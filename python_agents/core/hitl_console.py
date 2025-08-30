"""
Human-in-the-Loop (HITL) Console for the Aegis Multi-Agent AI System.

This module provides human oversight mechanisms for critical security decisions,
including approval workflows, escalation rules, and audit trails.
"""

import asyncio
import json
from typing import List, Dict, Any, Optional, Callable, Union
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass
from loguru import logger
import uuid

from models.events import BlockchainEvent, EventPriority
from models.threats import ThreatAnalysis, ThreatLevel
from models.actions import SecurityAction, ActionPriority


class ApprovalStatus(str, Enum):
    """Status of human approval requests."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    OVERRIDDEN = "overridden"
    EXPIRED = "expired"
    ESCALATED = "escalated"


class ApprovalType(str, Enum):
    """Types of actions requiring human approval."""
    ASSET_FREEZE = "asset_freeze"
    LIQUIDATION = "liquidation"
    CROSS_CHAIN_TRANSFER = "cross_chain_transfer"
    EMERGENCY_STOP = "emergency_stop"
    RISK_THRESHOLD_CHANGE = "risk_threshold_change"
    AI_MODEL_UPDATE = "ai_model_update"
    SYSTEM_CONFIGURATION = "system_configuration"
    CRITICAL_ALERT = "critical_alert"


class EscalationLevel(str, Enum):
    """Escalation levels for approval requests."""
    NONE = "none"
    SUPERVISOR = "supervisor"
    MANAGER = "manager"
    DIRECTOR = "director"
    EXECUTIVE = "executive"
    EMERGENCY = "emergency"


@dataclass
class ApprovalRequest:
    """Human approval request."""
    request_id: str
    request_type: ApprovalType
    title: str
    description: str
    urgency: int  # 0-100
    risk_level: ThreatLevel
    requested_by: str
    requested_at: datetime
    expires_at: datetime
    status: ApprovalStatus
    approvers: List[str]
    current_approver: Optional[str]
    escalation_level: EscalationLevel
    metadata: Dict[str, Any]
    
    def is_expired(self) -> bool:
        """Check if request has expired."""
        return datetime.utcnow() > self.expires_at
    
    def is_urgent(self) -> bool:
        """Check if request is urgent."""
        return self.urgency >= 80
    
    def requires_escalation(self) -> bool:
        """Check if request requires escalation."""
        return self.urgency >= 90 or self.risk_level in [ThreatLevel.CRITICAL, ThreatLevel.EMERGENCY]


@dataclass
class ApprovalDecision:
    """Human decision on approval request."""
    decision_id: str
    request_id: str
    approver: str
    decision: ApprovalStatus
    decision_at: datetime
    reasoning: str
    conditions: Optional[List[str]] = None
    override_reason: Optional[str] = None


@dataclass
class EscalationRule:
    """Rule for automatic escalation."""
    rule_id: str
    name: str
    conditions: Dict[str, Any]
    escalation_level: EscalationLevel
    timeout_minutes: int
    auto_approve: bool
    enabled: bool
    created_at: datetime


@dataclass
class AuditTrail:
    """Audit trail entry."""
    entry_id: str
    timestamp: datetime
    user: str
    action: str
    resource: str
    details: Dict[str, Any]
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class HITLConsole:
    """
    Human-in-the-Loop console for critical decision oversight.
    
    Features:
    - Approval workflows for critical actions
    - Automatic escalation based on rules
    - Multi-person approval for high-risk actions
    - Time-limited approvals with auto-expiry
    - Complete audit trails
    - Emergency override capabilities
    """
    
    def __init__(
        self,
        auto_escalation: bool = True,
        max_approval_time: int = 60,  # minutes
        emergency_approvers: Optional[List[str]] = None
    ):
        """Initialize the HITL console."""
        self.auto_escalation = auto_escalation
        self.max_approval_time = max_approval_time
        self.emergency_approvers = emergency_approvers or ["emergency_admin"]
        
        # Storage
        self.approval_requests: Dict[str, ApprovalRequest] = {}
        self.approval_decisions: Dict[str, List[ApprovalDecision]] = {}
        self.escalation_rules: List[EscalationRule] = []
        self.audit_trail: List[AuditTrail] = []
        
        # Callbacks
        self.approval_callbacks: Dict[str, Callable] = {}
        self.escalation_callbacks: Dict[str, Callable] = {}
        
        # Statistics
        self.stats = {
            "total_requests": 0,
            "approved_requests": 0,
            "rejected_requests": 0,
            "expired_requests": 0,
            "escalated_requests": 0,
            "average_approval_time": 0.0
        }
        
        # Initialize default escalation rules
        self._initialize_default_rules()
        
        # Start background tasks
        self._start_background_tasks()
    
    def _initialize_default_rules(self):
        """Initialize default escalation rules."""
        default_rules = [
            EscalationRule(
                rule_id="critical_threat_escalation",
                name="Critical Threat Escalation",
                conditions={
                    "threat_level": [ThreatLevel.CRITICAL, ThreatLevel.EMERGENCY],
                    "urgency": 90
                },
                escalation_level=EscalationLevel.EXECUTIVE,
                timeout_minutes=15,
                auto_approve=False,
                enabled=True,
                created_at=datetime.utcnow()
            ),
            EscalationRule(
                rule_id="high_value_asset_escalation",
                name="High Value Asset Escalation",
                conditions={
                    "asset_value": 1000000,  # $1M threshold
                    "action_type": ["asset_freeze", "liquidation"]
                },
                escalation_level=EscalationLevel.MANAGER,
                timeout_minutes=30,
                auto_approve=False,
                enabled=True,
                created_at=datetime.utcnow()
            ),
            EscalationRule(
                rule_id="cross_chain_escalation",
                name="Cross-Chain Operation Escalation",
                conditions={
                    "cross_chain": True,
                    "action_type": ["cross_chain_transfer", "emergency_stop"]
                },
                escalation_level=EscalationLevel.DIRECTOR,
                timeout_minutes=45,
                auto_approve=False,
                enabled=True,
                created_at=datetime.utcnow()
            )
        ]
        
        self.escalation_rules.extend(default_rules)
    
    def _start_background_tasks(self):
        """Start background monitoring tasks."""
        asyncio.create_task(self._monitor_expired_requests())
        asyncio.create_task(self._monitor_escalation_timeouts())
    
    async def create_approval_request(
        self,
        request_type: ApprovalType,
        title: str,
        description: str,
        urgency: int,
        risk_level: ThreatLevel,
        requested_by: str,
        approvers: List[str],
        metadata: Optional[Dict[str, Any]] = None,
        custom_expiry: Optional[int] = None
    ) -> str:
        """Create a new approval request."""
        try:
            request_id = str(uuid.uuid4())
            
            # Calculate expiry time
            expiry_minutes = custom_expiry or self.max_approval_time
            expires_at = datetime.utcnow() + timedelta(minutes=expiry_minutes)
            
            # Determine escalation level
            escalation_level = self._determine_escalation_level(urgency, risk_level, metadata)
            
            # Create approval request
            request = ApprovalRequest(
                request_id=request_id,
                request_type=request_type,
                title=title,
                description=description,
                urgency=urgency,
                risk_level=risk_level,
                requested_by=requested_by,
                requested_at=datetime.utcnow(),
                expires_at=expires_at,
                status=ApprovalStatus.PENDING,
                approvers=approvers,
                current_approver=approvers[0] if approvers else None,
                escalation_level=escalation_level,
                metadata=metadata or {}
            )
            
            # Store request
            self.approval_requests[request_id] = request
            self.approval_decisions[request_id] = []
            
            # Update statistics
            self.stats["total_requests"] += 1
            
            # Log audit trail
            self._add_audit_trail(
                user=requested_by,
                action="create_approval_request",
                resource=request_id,
                details={
                    "request_type": request_type.value,
                    "urgency": urgency,
                    "risk_level": risk_level.value,
                    "escalation_level": escalation_level.value
                }
            )
            
            # Trigger escalation if needed
            if self.auto_escalation and escalation_level != EscalationLevel.NONE:
                await self._trigger_escalation(request)
            
            logger.info(f"Created approval request {request_id} for {request_type.value}")
            return request_id
            
        except Exception as e:
            logger.error(f"Failed to create approval request: {e}")
            raise
    
    async def approve_request(
        self,
        request_id: str,
        approver: str,
        decision: ApprovalStatus,
        reasoning: str,
        conditions: Optional[List[str]] = None,
        override_reason: Optional[str] = None
    ) -> bool:
        """Approve or reject an approval request."""
        try:
            if request_id not in self.approval_requests:
                logger.error(f"Approval request {request_id} not found")
                return False
            
            request = self.approval_requests[request_id]
            
            # Check if request is still pending
            if request.status != ApprovalStatus.PENDING:
                logger.warning(f"Request {request_id} is not pending (status: {request.status})")
                return False
            
            # Check if approver is authorized
            if approver not in request.approvers and approver not in self.emergency_approvers:
                logger.error(f"Approver {approver} not authorized for request {request_id}")
                return False
            
            # Create decision record
            decision_record = ApprovalDecision(
                decision_id=str(uuid.uuid4()),
                request_id=request_id,
                approver=approver,
                decision=decision,
                decision_at=datetime.utcnow(),
                reasoning=reasoning,
                conditions=conditions,
                override_reason=override_reason
            )
            
            # Store decision
            self.approval_decisions[request_id].append(decision_record)
            
            # Update request status
            request.status = decision
            if decision == ApprovalStatus.APPROVED:
                self.stats["approved_requests"] += 1
            elif decision == ApprovalStatus.REJECTED:
                self.stats["rejected_requests"] += 1
            
            # Log audit trail
            self._add_audit_trail(
                user=approver,
                action=f"approval_{decision.value}",
                resource=request_id,
                details={
                    "decision": decision.value,
                    "reasoning": reasoning,
                    "conditions": conditions,
                    "override_reason": override_reason
                }
            )
            
            # Execute callback if registered
            if request_id in self.approval_callbacks:
                try:
                    await self.approval_callbacks[request_id](request, decision_record)
                except Exception as e:
                    logger.error(f"Approval callback failed: {e}")
            
            logger.info(f"Request {request_id} {decision.value} by {approver}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to approve request {request_id}: {e}")
            return False
    
    async def escalate_request(
        self,
        request_id: str,
        escalation_level: EscalationLevel,
        reason: str
    ) -> bool:
        """Escalate an approval request to a higher level."""
        try:
            if request_id not in self.approval_requests:
                logger.error(f"Approval request {request_id} not found")
                return False
            
            request = self.approval_requests[request_id]
            
            # Update escalation level
            request.escalation_level = escalation_level
            request.status = ApprovalStatus.ESCALATED
            
            # Update statistics
            self.stats["escalated_requests"] += 1
            
            # Log audit trail
            self._add_audit_trail(
                user="system",
                action="request_escalated",
                resource=request_id,
                details={
                    "escalation_level": escalation_level.value,
                    "reason": reason,
                    "previous_level": request.escalation_level.value
                }
            )
            
            # Trigger escalation callback if registered
            if request_id in self.escalation_callbacks:
                try:
                    await self.escalation_callbacks[request_id](request, escalation_level)
                except Exception as e:
                    logger.error(f"Escalation callback failed: {e}")
            
            logger.info(f"Request {request_id} escalated to {escalation_level.value}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to escalate request {request_id}: {e}")
            return False
    
    def _determine_escalation_level(
        self,
        urgency: int,
        risk_level: ThreatLevel,
        metadata: Dict[str, Any]
    ) -> EscalationLevel:
        """Determine appropriate escalation level based on request parameters."""
        # Check escalation rules
        for rule in self.escalation_rules:
            if not rule.enabled:
                continue
            
            if self._rule_matches(rule, urgency, risk_level, metadata):
                return rule.escalation_level
        
        # Default escalation based on urgency and risk
        if urgency >= 95 or risk_level == ThreatLevel.EMERGENCY:
            return EscalationLevel.EXECUTIVE
        elif urgency >= 85 or risk_level == ThreatLevel.CRITICAL:
            return EscalationLevel.DIRECTOR
        elif urgency >= 75:
            return EscalationLevel.MANAGER
        elif urgency >= 60:
            return EscalationLevel.SUPERVISOR
        else:
            return EscalationLevel.NONE
    
    def _rule_matches(
        self,
        rule: EscalationRule,
        urgency: int,
        risk_level: ThreatLevel,
        metadata: Dict[str, Any]
    ) -> bool:
        """Check if escalation rule matches request parameters."""
        conditions = rule.conditions
        
        # Check threat level
        if "threat_level" in conditions:
            if risk_level not in conditions["threat_level"]:
                return False
        
        # Check urgency
        if "urgency" in conditions:
            if urgency < conditions["urgency"]:
                return False
        
        # Check asset value
        if "asset_value" in conditions:
            asset_value = metadata.get("asset_value", 0)
            if asset_value < conditions["asset_value"]:
                return False
        
        # Check action type
        if "action_type" in conditions:
            action_type = metadata.get("action_type")
            if action_type not in conditions["action_type"]:
                return False
        
        # Check cross-chain flag
        if "cross_chain" in conditions:
            cross_chain = metadata.get("cross_chain", False)
            if cross_chain != conditions["cross_chain"]:
                return False
        
        return True
    
    async def _trigger_escalation(self, request: ApprovalRequest):
        """Trigger automatic escalation for a request."""
        try:
            if request.escalation_level == EscalationLevel.NONE:
                return
            
            # Find appropriate approvers for escalation level
            escalated_approvers = self._get_approvers_for_level(request.escalation_level)
            
            if escalated_approvers:
                # Update approvers list
                request.approvers = escalated_approvers
                request.current_approver = escalated_approvers[0]
                
                # Log escalation
                logger.info(f"Request {request.request_id} automatically escalated to {request.escalation_level.value}")
                
                # Trigger escalation callback
                if request.request_id in self.escalation_callbacks:
                    try:
                        await self.escalation_callbacks[request.request_id](request, request.escalation_level)
                    except Exception as e:
                        logger.error(f"Escalation callback failed: {e}")
            
        except Exception as e:
            logger.error(f"Failed to trigger escalation: {e}")
    
    def _get_approvers_for_level(self, level: EscalationLevel) -> List[str]:
        """Get list of approvers for a specific escalation level."""
        # This would typically come from a configuration or user management system
        approver_mapping = {
            EscalationLevel.SUPERVISOR: ["supervisor1", "supervisor2"],
            EscalationLevel.MANAGER: ["manager1", "manager2"],
            EscalationLevel.DIRECTOR: ["director1", "director2"],
            EscalationLevel.EXECUTIVE: ["executive1", "executive2"],
            EscalationLevel.EMERGENCY: self.emergency_approvers
        }
        
        return approver_mapping.get(level, [])
    
    async def _monitor_expired_requests(self):
        """Monitor and handle expired approval requests."""
        try:
            while True:
                current_time = datetime.utcnow()
                expired_requests = []
                
                for request_id, request in self.approval_requests.items():
                    if request.status == ApprovalStatus.PENDING and request.is_expired():
                        expired_requests.append(request_id)
                
                # Handle expired requests
                for request_id in expired_requests:
                    request = self.approval_requests[request_id]
                    request.status = ApprovalStatus.EXPIRED
                    
                    # Update statistics
                    self.stats["expired_requests"] += 1
                    
                    # Log audit trail
                    self._add_audit_trail(
                        user="system",
                        action="request_expired",
                        resource=request_id,
                        details={
                            "expired_at": request.expires_at.isoformat(),
                            "total_wait_time": (current_time - request.requested_at).total_seconds() / 60
                        }
                    )
                    
                    logger.warning(f"Approval request {request_id} expired")
                
                await asyncio.sleep(60)  # Check every minute
                
        except asyncio.CancelledError:
            logger.info("Expired request monitor cancelled")
        except Exception as e:
            logger.error(f"Expired request monitor error: {e}")
    
    async def _monitor_escalation_timeouts(self):
        """Monitor escalation timeouts and trigger further escalation."""
        try:
            while True:
                current_time = datetime.utcnow()
                
                for request_id, request in self.approval_requests.items():
                    if request.status == ApprovalStatus.ESCALATED:
                        # Check if escalation has timed out
                        escalation_timeout = self._get_escalation_timeout(request.escalation_level)
                        escalation_start = request.requested_at
                        
                        if current_time > escalation_start + timedelta(minutes=escalation_timeout):
                            # Escalate to next level
                            next_level = self._get_next_escalation_level(request.escalation_level)
                            if next_level != request.escalation_level:
                                await self.escalate_request(request_id, next_level, "Escalation timeout")
                
                await asyncio.sleep(300)  # Check every 5 minutes
                
        except asyncio.CancelledError:
            logger.info("Escalation timeout monitor cancelled")
        except Exception as e:
            logger.error(f"Escalation timeout monitor error: {e}")
    
    def _get_escalation_timeout(self, level: EscalationLevel) -> int:
        """Get timeout in minutes for an escalation level."""
        timeout_mapping = {
            EscalationLevel.SUPERVISOR: 30,
            EscalationLevel.MANAGER: 60,
            EscalationLevel.DIRECTOR: 120,
            EscalationLevel.EXECUTIVE: 240,
            EscalationLevel.EMERGENCY: 15
        }
        
        return timeout_mapping.get(level, 60)
    
    def _get_next_escalation_level(self, current_level: EscalationLevel) -> EscalationLevel:
        """Get the next escalation level."""
        level_sequence = [
            EscalationLevel.NONE,
            EscalationLevel.SUPERVISOR,
            EscalationLevel.MANAGER,
            EscalationLevel.DIRECTOR,
            EscalationLevel.EXECUTIVE,
            EscalationLevel.EMERGENCY
        ]
        
        try:
            current_index = level_sequence.index(current_level)
            if current_index < len(level_sequence) - 1:
                return level_sequence[current_index + 1]
        except ValueError:
            pass
        
        return current_level
    
    def _add_audit_trail(
        self,
        user: str,
        action: str,
        resource: str,
        details: Dict[str, Any]
    ):
        """Add entry to audit trail."""
        audit_entry = AuditTrail(
            entry_id=str(uuid.uuid4()),
            timestamp=datetime.utcnow(),
            user=user,
            action=action,
            resource=resource,
            details=details
        )
        
        self.audit_trail.append(audit_entry)
    
    def register_approval_callback(self, request_id: str, callback: Callable):
        """Register a callback for when an approval request is decided."""
        self.approval_callbacks[request_id] = callback
    
    def register_escalation_callback(self, request_id: str, callback: Callable):
        """Register a callback for when a request is escalated."""
        self.escalation_callbacks[request_id] = callback
    
    def get_request(self, request_id: str) -> Optional[ApprovalRequest]:
        """Get an approval request by ID."""
        return self.approval_requests.get(request_id)
    
    def get_pending_requests(self) -> List[ApprovalRequest]:
        """Get all pending approval requests."""
        return [
            request for request in self.approval_requests.values()
            if request.status == ApprovalStatus.PENDING
        ]
    
    def get_requests_by_user(self, user: str) -> List[ApprovalRequest]:
        """Get approval requests for a specific user."""
        return [
            request for request in self.approval_requests.values()
            if user in request.approvers
        ]
    
    def get_audit_trail(
        self,
        user: Optional[str] = None,
        action: Optional[str] = None,
        resource: Optional[str] = None,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[AuditTrail]:
        """Get filtered audit trail entries."""
        filtered_trail = self.audit_trail
        
        if user:
            filtered_trail = [entry for entry in filtered_trail if entry.user == user]
        
        if action:
            filtered_trail = [entry for entry in filtered_trail if entry.action == action]
        
        if resource:
            filtered_trail = [entry for entry in filtered_trail if entry.resource == resource]
        
        if start_time:
            filtered_trail = [entry for entry in filtered_trail if entry.timestamp >= start_time]
        
        if end_time:
            filtered_trail = [entry for entry in filtered_trail if entry.timestamp <= end_time]
        
        return sorted(filtered_trail, key=lambda x: x.timestamp, reverse=True)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get console statistics."""
        return {
            **self.stats,
            "active_requests": len([r for r in self.approval_requests.values() if r.status == ApprovalStatus.PENDING]),
            "total_escalation_rules": len(self.escalation_rules),
            "audit_trail_entries": len(self.audit_trail),
            "registered_callbacks": len(self.approval_callbacks) + len(self.escalation_callbacks)
        }
    
    def add_escalation_rule(self, rule: EscalationRule):
        """Add a new escalation rule."""
        self.escalation_rules.append(rule)
        logger.info(f"Added escalation rule: {rule.name}")
    
    def remove_escalation_rule(self, rule_id: str) -> bool:
        """Remove an escalation rule."""
        for i, rule in enumerate(self.escalation_rules):
            if rule.rule_id == rule_id:
                del self.escalation_rules[i]
                logger.info(f"Removed escalation rule: {rule.name}")
                return True
        
        return False
    
    def clear_expired_requests(self):
        """Clear expired requests from memory."""
        expired_ids = [
            request_id for request_id, request in self.approval_requests.items()
            if request.status == ApprovalStatus.EXPIRED
        ]
        
        for request_id in expired_ids:
            del self.approval_requests[request_id]
            if request_id in self.approval_decisions:
                del self.approval_decisions[request_id]
        
        logger.info(f"Cleared {len(expired_ids)} expired requests")
    
    def export_audit_trail(self, filepath: str) -> bool:
        """Export audit trail to JSON file."""
        try:
            audit_data = [
                {
                    "entry_id": entry.entry_id,
                    "timestamp": entry.timestamp.isoformat(),
                    "user": entry.user,
                    "action": entry.action,
                    "resource": entry.resource,
                    "details": entry.details,
                    "ip_address": entry.ip_address,
                    "user_agent": entry.user_agent
                }
                for entry in self.audit_trail
            ]
            
            with open(filepath, 'w') as f:
                json.dump(audit_data, f, indent=2)
            
            logger.info(f"Audit trail exported to {filepath}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to export audit trail: {e}")
            return False
