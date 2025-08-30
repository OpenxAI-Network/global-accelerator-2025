"""
Agent Orchestrator for the Aegis Multi-Agent AI System.

This module provides the main orchestrator that coordinates all specialized
agents, manages the workflow, and ensures proper communication between
components.
"""

import asyncio
import json
import time
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime
from dataclasses import dataclass
from loguru import logger
import uuid

from models.events import BlockchainEvent, EventPriority, EventStatus
from models.threats import ThreatAnalysis, ThreatLevel
from models.actions import SecurityAction, ActionStatus
from models.agents import AgentStatus, AgentMetrics
from core.message_broker import MessageBroker
from core.rag_engine import RAGEngine
from core.hitl_console import HITLConsole
from core.config import config


@dataclass
class AgentInfo:
    """Information about a registered agent."""
    agent_id: str
    name: str
    agent_type: str
    status: AgentStatus
    capabilities: List[str]
    registered_at: datetime
    last_heartbeat: datetime
    metrics: AgentMetrics


class AgentOrchestrator:
    """
    Main orchestrator for the Aegis Multi-Agent AI System.
    
    Features:
    - Agent registration and lifecycle management
    - Workflow orchestration and task distribution
    - Performance monitoring and health checks
    - Load balancing and failover
    - Event routing and prioritization
    """
    
    def __init__(self):
        """Initialize the agent orchestrator."""
        # Core components
        self.message_broker: Optional[MessageBroker] = None
        self.rag_engine: Optional[RAGEngine] = None
        self.hitl_console: Optional[HITLConsole] = None
        
        # Agent management
        self.agents: Dict[str, AgentInfo] = {}
        self.agent_types: Dict[str, List[str]] = {}
        self.agent_capabilities: Dict[str, List[str]] = {}
        
        # Workflow management
        self.workflows: Dict[str, Dict[str, Any]] = {}
        self.active_workflows: Dict[str, Dict[str, Any]] = {}
        self.workflow_history: List[Dict[str, Any]] = []
        
        # Event processing
        self.event_queue: asyncio.Queue = asyncio.Queue(maxsize=config.max_concurrent_events)
        self.processing_events: Dict[str, BlockchainEvent] = {}
        self.event_metrics: Dict[str, Any] = {
            "total_events": 0,
            "processed_events": 0,
            "failed_events": 0,
            "average_processing_time": 0.0
        }
        
        # Performance monitoring
        self.performance_metrics: Dict[str, Any] = {
            "start_time": time.time(),
            "total_workflows": 0,
            "completed_workflows": 0,
            "failed_workflows": 0,
            "active_agents": 0,
            "system_health": "healthy"
        }
        
        # Callbacks and event handlers
        self.event_handlers: Dict[str, List[Callable]] = {}
        self.workflow_handlers: Dict[str, List[Callable]] = {}
        
        # Background tasks
        self.background_tasks: List[asyncio.Task] = []
        self.is_running = False
        
        # Initialize default workflows
        self._initialize_default_workflows()
    
    def _initialize_default_workflows(self):
        """Initialize default workflow definitions."""
        default_workflows = {
            "threat_detection": {
                "name": "Threat Detection Workflow",
                "description": "Standard workflow for detecting and analyzing threats",
                "steps": [
                    {
                        "step": 1,
                        "agent_type": "perception",
                        "action": "monitor_blockchain",
                        "timeout": 30,
                        "retry_count": 3
                    },
                    {
                        "step": 2,
                        "agent_type": "cognitive",
                        "action": "analyze_threat",
                        "timeout": 60,
                        "retry_count": 2
                    },
                    {
                        "step": 3,
                        "agent_type": "action",
                        "action": "execute_security_action",
                        "timeout": 120,
                        "retry_count": 3
                    }
                ],
                "priority": "high",
                "auto_escalation": True
            },
            "cross_chain_monitoring": {
                "name": "Cross-Chain Monitoring Workflow",
                "description": "Workflow for monitoring cross-chain activities",
                "steps": [
                    {
                        "step": 1,
                        "agent_type": "perception",
                        "action": "monitor_multiple_chains",
                        "timeout": 45,
                        "retry_count": 3
                    },
                    {
                        "step": 2,
                        "agent_type": "cognitive",
                        "action": "analyze_cross_chain_patterns",
                        "timeout": 90,
                        "retry_count": 2
                    },
                    {
                        "step": 3,
                        "agent_type": "action",
                        "action": "execute_cross_chain_action",
                        "timeout": 180,
                        "retry_count": 3
                    }
                ],
                "priority": "medium",
                "auto_escalation": True
            },
            "emergency_response": {
                "name": "Emergency Response Workflow",
                "description": "High-priority workflow for emergency situations",
                "steps": [
                    {
                        "step": 1,
                        "agent_type": "perception",
                        "action": "detect_emergency",
                        "timeout": 10,
                        "retry_count": 1
                    },
                    {
                        "step": 2,
                        "agent_type": "cognitive",
                        "action": "assess_emergency",
                        "timeout": 20,
                        "retry_count": 1
                    },
                    {
                        "step": 3,
                        "agent_type": "action",
                        "action": "execute_emergency_action",
                        "timeout": 60,
                        "retry_count": 2
                    },
                    {
                        "step": 4,
                        "agent_type": "hitl",
                        "action": "human_approval",
                        "timeout": 300,
                        "retry_count": 1
                    }
                ],
                "priority": "critical",
                "auto_escalation": True
            }
        }
        
        self.workflows.update(default_workflows)
        logger.info(f"Initialized {len(default_workflows)} default workflows")
    
    async def start(self) -> bool:
        """Start the agent orchestrator."""
        try:
            logger.info("Starting Agent Orchestrator...")
            
            # Initialize core components
            await self._initialize_core_components()
            
            # Start background tasks
            await self._start_background_tasks()
            
            # Start event processing
            await self._start_event_processing()
            
            self.is_running = True
            logger.info("Agent Orchestrator started successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start Agent Orchestrator: {e}")
            return False
    
    async def stop(self):
        """Stop the agent orchestrator."""
        try:
            logger.info("Stopping Agent Orchestrator...")
            
            self.is_running = False
            
            # Cancel background tasks
            for task in self.background_tasks:
                task.cancel()
            
            # Wait for tasks to complete
            if self.background_tasks:
                await asyncio.gather(*self.background_tasks, return_exceptions=True)
            
            # Disconnect core components
            if self.message_broker:
                await self.message_broker.disconnect()
            
            if self.rag_engine:
                await self.rag_engine.disconnect()
            
            logger.info("Agent Orchestrator stopped successfully")
            
        except Exception as e:
            logger.error(f"Error stopping Agent Orchestrator: {e}")
    
    async def _initialize_core_components(self):
        """Initialize core system components."""
        try:
            # Initialize message broker
            self.message_broker = MessageBroker(
                redis_url=config.redis_url,
                max_retries=config.redis_max_retries,
                retry_delay=config.redis_retry_delay,
                max_queue_size=config.redis_max_queue_size
            )
            await self.message_broker.connect()
            
            # Initialize RAG engine
            self.rag_engine = RAGEngine(
                neo4j_uri=config.neo4j_uri,
                neo4j_user=config.neo4j_user,
                neo4j_password=config.neo4j_password,
                chroma_host=config.chroma_host,
                chroma_port=config.chroma_port
            )
            await self.rag_engine.connect()
            
            # Initialize HITL console
            self.hitl_console = HITLConsole(
                auto_escalation=config.hitl_auto_escalation,
                max_approval_time=config.hitl_max_approval_time,
                emergency_approvers=config.hitl_emergency_approvers
            )
            
            logger.info("Core components initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize core components: {e}")
            raise
    
    async def _start_background_tasks(self):
        """Start background monitoring and maintenance tasks."""
        try:
            # Health monitoring task
            health_task = asyncio.create_task(self._health_monitor())
            self.background_tasks.append(health_task)
            
            # Performance monitoring task
            perf_task = asyncio.create_task(self._performance_monitor())
            self.background_tasks.append(perf_task)
            
            # Agent cleanup task
            cleanup_task = asyncio.create_task(self._agent_cleanup())
            self.background_tasks.append(cleanup_task)
            
            # Workflow monitoring task
            workflow_task = asyncio.create_task(self._workflow_monitor())
            self.background_tasks.append(workflow_task)
            
            logger.info(f"Started {len(self.background_tasks)} background tasks")
            
        except Exception as e:
            logger.error(f"Failed to start background tasks: {e}")
            raise
    
    async def _start_event_processing(self):
        """Start the main event processing loop."""
        try:
            # Subscribe to event channels
            await self.message_broker.subscribe("events:all", self._handle_event)
            await self.message_broker.subscribe("events:critical", self._handle_critical_event, priority=True)
            await self.message_broker.subscribe("events:high", self._handle_high_priority_event, priority=True)
            
            logger.info("Event processing started successfully")
            
        except Exception as e:
            logger.error(f"Failed to start event processing: {e}")
            raise
    
    async def register_agent(
        self,
        agent_id: str,
        name: str,
        agent_type: str,
        capabilities: List[str]
    ) -> bool:
        """Register a new agent with the orchestrator."""
        try:
            if agent_id in self.agents:
                logger.warning(f"Agent {agent_id} already registered")
                return False
            
            # Create agent info
            agent_info = AgentInfo(
                agent_id=agent_id,
                name=name,
                agent_type=agent_type,
                status=AgentStatus.ACTIVE,
                capabilities=capabilities,
                registered_at=datetime.utcnow(),
                last_heartbeat=datetime.utcnow(),
                metrics=AgentMetrics()
            )
            
            # Register agent
            self.agents[agent_id] = agent_info
            
            # Update agent type mapping
            if agent_type not in self.agent_types:
                self.agent_types[agent_type] = []
            self.agent_types[agent_type].append(agent_id)
            
            # Update capabilities mapping
            for capability in capabilities:
                if capability not in self.agent_capabilities:
                    self.agent_capabilities[capability] = []
                self.agent_capabilities[capability].append(agent_id)
            
            # Update performance metrics
            self.performance_metrics["active_agents"] = len(self.agents)
            
            logger.info(f"Registered agent {name} ({agent_id}) of type {agent_type}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to register agent {agent_id}: {e}")
            return False
    
    async def unregister_agent(self, agent_id: str) -> bool:
        """Unregister an agent from the orchestrator."""
        try:
            if agent_id not in self.agents:
                logger.warning(f"Agent {agent_id} not found")
                return False
            
            agent_info = self.agents[agent_id]
            
            # Remove from type mapping
            if agent_info.agent_type in self.agent_types:
                self.agent_types[agent_info.agent_type].remove(agent_id)
                if not self.agent_types[agent_info.agent_type]:
                    del self.agent_types[agent_info.agent_type]
            
            # Remove from capabilities mapping
            for capability in agent_info.capabilities:
                if capability in self.agent_capabilities:
                    self.agent_capabilities[capability].remove(agent_id)
                    if not self.agent_capabilities[capability]:
                        del self.agent_capabilities[capability]
            
            # Remove agent
            del self.agents[agent_id]
            
            # Update performance metrics
            self.performance_metrics["active_agents"] = len(self.agents)
            
            logger.info(f"Unregistered agent {agent_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to unregister agent {agent_id}: {e}")
            return False
    
    async def update_agent_status(
        self,
        agent_id: str,
        status: AgentStatus,
        metrics: Optional[AgentMetrics] = None
    ) -> bool:
        """Update agent status and metrics."""
        try:
            if agent_id not in self.agents:
                logger.warning(f"Agent {agent_id} not found")
                return False
            
            agent_info = self.agents[agent_id]
            agent_info.status = status
            agent_info.last_heartbeat = datetime.utcnow()
            
            if metrics:
                agent_info.metrics = metrics
            
            logger.debug(f"Updated agent {agent_id} status to {status}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update agent {agent_id} status: {e}")
            return False
    
    async def submit_event(self, event: BlockchainEvent) -> str:
        """Submit a blockchain event for processing."""
        try:
            # Add event to queue
            await self.event_queue.put(event)
            
            # Update metrics
            self.event_metrics["total_events"] += 1
            
            # Log event submission
            logger.info(f"Submitted event {event.id} for processing")
            
            return event.id
            
        except Exception as e:
            logger.error(f"Failed to submit event {event.id}: {e}")
            raise
    
    async def _handle_event(self, event_data: Dict[str, Any]):
        """Handle incoming blockchain events."""
        try:
            # Create blockchain event from data
            event = BlockchainEvent(**event_data)
            
            # Submit for processing
            await self.submit_event(event)
            
        except Exception as e:
            logger.error(f"Error handling event: {e}")
    
    async def _handle_critical_event(self, event_data: Dict[str, Any]):
        """Handle critical priority events."""
        try:
            # Create blockchain event from data
            event = BlockchainEvent(**event_data)
            event.priority = EventPriority.CRITICAL
            
            # Submit for immediate processing
            await self.submit_event(event)
            
            # Trigger emergency workflow if needed
            if event.risk_score > 80:
                await self._trigger_emergency_workflow(event)
            
        except Exception as e:
            logger.error(f"Error handling critical event: {e}")
    
    async def _handle_high_priority_event(self, event_data: Dict[str, Any]):
        """Handle high priority events."""
        try:
            # Create blockchain event from data
            event = BlockchainEvent(**event_data)
            event.priority = EventPriority.HIGH
            
            # Submit for processing
            await self.submit_event(event)
            
        except Exception as e:
            logger.error(f"Error handling high priority event: {e}")
    
    async def _trigger_emergency_workflow(self, event: BlockchainEvent):
        """Trigger emergency response workflow for critical events."""
        try:
            workflow_id = f"emergency_{event.id}_{int(time.time())}"
            
            workflow_data = {
                "workflow_id": workflow_id,
                "workflow_type": "emergency_response",
                "triggering_event": event.id,
                "status": "active",
                "created_at": datetime.utcnow(),
                "priority": "critical",
                "steps_completed": 0,
                "current_step": 1
            }
            
            self.active_workflows[workflow_id] = workflow_data
            
            # Start workflow execution
            asyncio.create_task(self._execute_workflow(workflow_id, "emergency_response", event))
            
            logger.info(f"Triggered emergency workflow {workflow_id} for event {event.id}")
            
        except Exception as e:
            logger.error(f"Failed to trigger emergency workflow: {e}")
    
    async def _execute_workflow(
        self,
        workflow_id: str,
        workflow_type: str,
        event: BlockchainEvent
    ):
        """Execute a workflow for an event."""
        try:
            if workflow_type not in self.workflows:
                logger.error(f"Workflow type {workflow_type} not found")
                return
            
            workflow = self.workflows[workflow_type]
            workflow_data = self.active_workflows[workflow_id]
            
            logger.info(f"Executing workflow {workflow_id} for event {event.id}")
            
            # Execute workflow steps
            for step in workflow["steps"]:
                if not self.is_running:
                    break
                
                try:
                    # Find suitable agent for this step
                    agent_id = await self._find_agent_for_step(step)
                    if not agent_id:
                        logger.error(f"No suitable agent found for step {step['step']}")
                        break
                    
                    # Execute step
                    success = await self._execute_workflow_step(workflow_id, step, agent_id, event)
                    
                    if success:
                        workflow_data["steps_completed"] += 1
                        workflow_data["current_step"] = step["step"] + 1
                    else:
                        logger.error(f"Step {step['step']} failed in workflow {workflow_id}")
                        break
                    
                    # Check if workflow is complete
                    if workflow_data["steps_completed"] >= len(workflow["steps"]):
                        await self._complete_workflow(workflow_id, workflow_data, event)
                        break
                    
                except Exception as e:
                    logger.error(f"Error executing step {step['step']}: {e}")
                    break
            
            # Update workflow history
            self.workflow_history.append({
                "workflow_id": workflow_id,
                "workflow_type": workflow_type,
                "event_id": event.id,
                "status": workflow_data.get("status", "unknown"),
                "steps_completed": workflow_data.get("steps_completed", 0),
                "created_at": workflow_data.get("created_at"),
                "completed_at": datetime.utcnow()
            })
            
        except Exception as e:
            logger.error(f"Error executing workflow {workflow_id}: {e}")
            await self._fail_workflow(workflow_id, str(e))
    
    async def _find_agent_for_step(self, step: Dict[str, Any]) -> Optional[str]:
        """Find a suitable agent for a workflow step."""
        try:
            agent_type = step["agent_type"]
            
            if agent_type not in self.agent_types:
                return None
            
            # Find available agents of the required type
            available_agents = []
            for agent_id in self.agent_types[agent_type]:
                if agent_id in self.agents:
                    agent_info = self.agents[agent_id]
                    if agent_info.status == AgentStatus.ACTIVE:
                        available_agents.append(agent_id)
            
            if not available_agents:
                return None
            
            # Simple round-robin selection (could be enhanced with load balancing)
            # For now, return the first available agent
            return available_agents[0]
            
        except Exception as e:
            logger.error(f"Error finding agent for step: {e}")
            return None
    
    async def _execute_workflow_step(
        self,
        workflow_id: str,
        step: Dict[str, Any],
        agent_id: str,
        event: BlockchainEvent
    ) -> bool:
        """Execute a single workflow step."""
        try:
            # Send step execution request to agent
            step_request = {
                "workflow_id": workflow_id,
                "step": step,
                "event": event.dict(),
                "agent_id": agent_id,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Publish to agent's channel
            channel = f"agent:{agent_id}:workflow"
            success = await self.message_broker.publish(channel, step_request)
            
            if success:
                logger.debug(f"Sent step {step['step']} to agent {agent_id}")
                return True
            else:
                logger.error(f"Failed to send step {step['step']} to agent {agent_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error executing workflow step: {e}")
            return False
    
    async def _complete_workflow(
        self,
        workflow_id: str,
        workflow_data: Dict[str, Any],
        event: BlockchainEvent
    ):
        """Mark a workflow as completed."""
        try:
            workflow_data["status"] = "completed"
            workflow_data["completed_at"] = datetime.utcnow()
            
            # Update performance metrics
            self.performance_metrics["completed_workflows"] += 1
            
            # Remove from active workflows
            if workflow_id in self.active_workflows:
                del self.active_workflows[workflow_id]
            
            logger.info(f"Workflow {workflow_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Error completing workflow {workflow_id}: {e}")
    
    async def _fail_workflow(self, workflow_id: str, error: str):
        """Mark a workflow as failed."""
        try:
            if workflow_id in self.active_workflows:
                workflow_data = self.active_workflows[workflow_id]
                workflow_data["status"] = "failed"
                workflow_data["error"] = error
                workflow_data["failed_at"] = datetime.utcnow()
                
                # Update performance metrics
                self.performance_metrics["failed_workflows"] += 1
                
                # Remove from active workflows
                del self.active_workflows[workflow_id]
            
            logger.error(f"Workflow {workflow_id} failed: {error}")
            
        except Exception as e:
            logger.error(f"Error failing workflow {workflow_id}: {e}")
    
    async def _health_monitor(self):
        """Monitor system health and agent status."""
        try:
            while self.is_running:
                try:
                    # Check agent health
                    current_time = datetime.utcnow()
                    unhealthy_agents = []
                    
                    for agent_id, agent_info in self.agents.items():
                        # Check if agent is responsive
                        time_since_heartbeat = (current_time - agent_info.last_heartbeat).total_seconds()
                        
                        if time_since_heartbeat > config.agent_health_check_interval * 2:
                            agent_info.status = AgentStatus.UNRESPONSIVE
                            unhealthy_agents.append(agent_id)
                    
                    # Update system health
                    if unhealthy_agents:
                        self.performance_metrics["system_health"] = "degraded"
                        logger.warning(f"Found {len(unhealthy_agents)} unhealthy agents")
                    else:
                        self.performance_metrics["system_health"] = "healthy"
                    
                    await asyncio.sleep(config.agent_health_check_interval)
                    
                except Exception as e:
                    logger.error(f"Health monitor error: {e}")
                    await asyncio.sleep(5)
                    
        except asyncio.CancelledError:
            logger.info("Health monitor cancelled")
        except Exception as e:
            logger.error(f"Health monitor fatal error: {e}")
    
    async def _performance_monitor(self):
        """Monitor system performance metrics."""
        try:
            while self.is_running:
                try:
                    # Calculate event processing metrics
                    if self.event_metrics["total_events"] > 0:
                        success_rate = (
                            self.event_metrics["processed_events"] / 
                            self.event_metrics["total_events"]
                        ) * 100
                        
                        self.event_metrics["success_rate"] = success_rate
                        self.event_metrics["failure_rate"] = 100 - success_rate
                    
                    # Log performance summary
                    logger.info(f"Performance Summary - Events: {self.event_metrics['total_events']}, "
                              f"Success Rate: {self.event_metrics.get('success_rate', 0):.1f}%, "
                              f"Active Agents: {self.performance_metrics['active_agents']}")
                    
                    await asyncio.sleep(config.metrics_interval)
                    
                except Exception as e:
                    logger.error(f"Performance monitor error: {e}")
                    await asyncio.sleep(5)
                    
        except asyncio.CancelledError:
            logger.info("Performance monitor cancelled")
        except Exception as e:
            logger.error(f"Performance monitor fatal error: {e}")
    
    async def _agent_cleanup(self):
        """Clean up inactive agents."""
        try:
            while self.is_running:
                try:
                    # Remove agents that have been unresponsive for too long
                    current_time = datetime.utcnow()
                    agents_to_remove = []
                    
                    for agent_id, agent_info in self.agents.items():
                        time_since_heartbeat = (current_time - agent_info.last_heartbeat).total_seconds()
                        
                        if time_since_heartbeat > config.agent_health_check_interval * 5:
                            agents_to_remove.append(agent_id)
                    
                    # Remove inactive agents
                    for agent_id in agents_to_remove:
                        await self.unregister_agent(agent_id)
                        logger.info(f"Removed inactive agent {agent_id}")
                    
                    await asyncio.sleep(config.agent_health_check_interval * 2)
                    
                except Exception as e:
                    logger.error(f"Agent cleanup error: {e}")
                    await asyncio.sleep(10)
                    
        except asyncio.CancelledError:
            logger.info("Agent cleanup cancelled")
        except Exception as e:
            logger.error(f"Agent cleanup fatal error: {e}")
    
    async def _workflow_monitor(self):
        """Monitor active workflows and handle timeouts."""
        try:
            while self.is_running:
                try:
                    # Check for workflow timeouts
                    current_time = datetime.utcnow()
                    timed_out_workflows = []
                    
                    for workflow_id, workflow_data in self.active_workflows.items():
                        if "created_at" in workflow_data:
                            created_at = workflow_data["created_at"]
                            if isinstance(created_at, str):
                                created_at = datetime.fromisoformat(created_at)
                            
                            time_since_creation = (current_time - created_at).total_seconds()
                            
                            # Check if workflow has timed out (5 minutes default)
                            if time_since_creation > 300:
                                timed_out_workflows.append(workflow_id)
                    
                    # Handle timed out workflows
                    for workflow_id in timed_out_workflows:
                        await self._fail_workflow(workflow_id, "Workflow timeout")
                        logger.warning(f"Workflow {workflow_id} timed out")
                    
                    await asyncio.sleep(30)  # Check every 30 seconds
                    
                except Exception as e:
                    logger.error(f"Workflow monitor error: {e}")
                    await asyncio.sleep(10)
                    
        except asyncio.CancelledError:
            logger.info("Workflow monitor cancelled")
        except Exception as e:
            logger.error(f"Workflow monitor fatal error: {e}")
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get current system status."""
        return {
            "orchestrator": {
                "status": "running" if self.is_running else "stopped",
                "start_time": self.performance_metrics["start_time"],
                "uptime": time.time() - self.performance_metrics["start_time"]
            },
            "agents": {
                "total": len(self.agents),
                "by_type": {agent_type: len(agents) for agent_type, agents in self.agent_types.items()},
                "by_status": {
                    status.value: len([a for a in self.agents.values() if a.status == status])
                    for status in AgentStatus
                }
            },
            "workflows": {
                "total": self.performance_metrics["total_workflows"],
                "completed": self.performance_metrics["completed_workflows"],
                "failed": self.performance_metrics["failed_workflows"],
                "active": len(self.active_workflows)
            },
            "events": self.event_metrics,
            "performance": self.performance_metrics,
            "core_components": {
                "message_broker": self.message_broker.is_healthy if self.message_broker else False,
                "rag_engine": True if self.rag_engine else False,
                "hitl_console": True if self.hitl_console else False
            }
        }
    
    def get_agent_info(self, agent_id: str) -> Optional[AgentInfo]:
        """Get information about a specific agent."""
        return self.agents.get(agent_id)
    
    def get_agents_by_type(self, agent_type: str) -> List[AgentInfo]:
        """Get all agents of a specific type."""
        if agent_type not in self.agent_types:
            return []
        
        return [self.agents[agent_id] for agent_id in self.agent_types[agent_type] if agent_id in self.agents]
    
    def get_agents_by_capability(self, capability: str) -> List[AgentInfo]:
        """Get all agents with a specific capability."""
        if capability not in self.agent_capabilities:
            return []
        
        return [self.agents[agent_id] for agent_id in self.agent_capabilities[capability] if agent_id in self.agents]
    
    def get_workflow_status(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a specific workflow."""
        return self.active_workflows.get(workflow_id)
    
    def get_workflow_history(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get workflow execution history."""
        return self.workflow_history[-limit:] if self.workflow_history else []
    
    async def trigger_workflow(
        self,
        workflow_type: str,
        event: BlockchainEvent,
        priority: str = "normal"
    ) -> Optional[str]:
        """Manually trigger a workflow."""
        try:
            if workflow_type not in self.workflows:
                logger.error(f"Workflow type {workflow_type} not found")
                return None
            
            workflow_id = f"{workflow_type}_{event.id}_{int(time.time())}"
            
            workflow_data = {
                "workflow_id": workflow_id,
                "workflow_type": workflow_type,
                "triggering_event": event.id,
                "status": "active",
                "created_at": datetime.utcnow(),
                "priority": priority,
                "steps_completed": 0,
                "current_step": 1
            }
            
            self.active_workflows[workflow_id] = workflow_data
            
            # Start workflow execution
            asyncio.create_task(self._execute_workflow(workflow_id, workflow_type, event))
            
            logger.info(f"Manually triggered workflow {workflow_id} for event {event.id}")
            return workflow_id
            
        except Exception as e:
            logger.error(f"Failed to trigger workflow {workflow_type}: {e}")
            return None


# Global orchestrator instance
orchestrator = AgentOrchestrator()

# Export commonly used components
__all__ = [
    "AgentOrchestrator",
    "orchestrator",
    "AgentInfo"
]
