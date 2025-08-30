"""
Data models for the Aegis Multi-Agent AI System.

This package contains all the data structures and schemas used throughout
the system, including events, threats, actions, and agent communications.
"""

from .events import (
    BlockchainEvent,
    EventType,
    EventPriority,
    EventStatus,
    EventMetadata
)

from .threats import (
    ThreatAnalysis,
    ThreatType,
    ThreatLevel,
    ThreatPattern,
    ThreatEvidence,
    RiskScore
)

from .actions import (
    SecurityAction,
    ActionType,
    ActionPriority,
    ActionStatus,
    ActionResult,
    ActionMetadata
)

from .agents import (
    AgentMessage,
    MessageType,
    MessagePriority,
    AgentStatus,
    AgentMetrics,
    AgentContext
)

from .hitl import (
    HumanApproval,
    ApprovalStatus,
    ApprovalWorkflow,
    EscalationRule,
    AuditTrail
)

__all__ = [
    # Events
    "BlockchainEvent",
    "EventType", 
    "EventPriority",
    "EventStatus",
    "EventMetadata",
    
    # Threats
    "ThreatAnalysis",
    "ThreatType",
    "ThreatLevel", 
    "ThreatPattern",
    "ThreatEvidence",
    "RiskScore",
    
    # Actions
    "SecurityAction",
    "ActionType",
    "ActionPriority",
    "ActionStatus",
    "ActionResult", 
    "ActionMetadata",
    
    # Agents
    "AgentMessage",
    "MessageType",
    "MessagePriority",
    "AgentStatus",
    "AgentMetrics",
    "AgentContext",
    
    # Human-in-the-Loop
    "HumanApproval",
    "ApprovalStatus",
    "ApprovalWorkflow",
    "EscalationRule",
    "AuditTrail"
]
