#!/usr/bin/env python3
"""
Demo script for the Aegis Multi-Agent AI System.

This script demonstrates the basic functionality of the system by:
1. Starting the orchestrator
2. Registering sample agents
3. Submitting sample events
4. Triggering workflows
5. Monitoring system status
"""

import asyncio
import time
from datetime import datetime
from pathlib import Path
import sys

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from core.agent_orchestrator import orchestrator
from models.events import BlockchainEvent, EventType, EventPriority
from models.threats import ThreatType, ThreatLevel
from models.actions import ActionType, ActionPriority
from loguru import logger


class AegisDemo:
    """Demo class for the Aegis Multi-Agent AI System."""
    
    def __init__(self):
        """Initialize the demo."""
        self.orchestrator = orchestrator
        self.demo_agents = []
        self.demo_events = []
        self.demo_workflows = []
        
        # Demo configuration
        self.demo_duration = 60  # seconds
        self.event_interval = 5  # seconds
        self.workflow_interval = 15  # seconds
    
    async def run_demo(self):
        """Run the complete demo."""
        try:
            logger.info("=" * 60)
            logger.info("Starting Aegis Multi-Agent AI System Demo")
            logger.info("=" * 60)
            
            # Start the orchestrator
            if not await self._start_orchestrator():
                logger.error("Failed to start orchestrator")
                return False
            
            # Run demo phases
            await self._phase_1_agent_registration()
            await self._phase_2_event_generation()
            await self._phase_3_workflow_execution()
            await self._phase_4_system_monitoring()
            
            # Demo completed
            logger.info("=" * 60)
            logger.info("Demo completed successfully!")
            logger.info("=" * 60)
            
            return True
            
        except Exception as e:
            logger.error(f"Demo failed: {e}")
            return False
        
        finally:
            # Cleanup
            await self._cleanup()
    
    async def _start_orchestrator(self) -> bool:
        """Start the agent orchestrator."""
        try:
            logger.info("Starting Agent Orchestrator...")
            
            if not await self.orchestrator.start():
                logger.error("Failed to start orchestrator")
                return False
            
            logger.info("Orchestrator started successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to start orchestrator: {e}")
            return False
    
    async def _phase_1_agent_registration(self):
        """Phase 1: Register demo agents."""
        try:
            logger.info("Phase 1: Agent Registration")
            logger.info("-" * 40)
            
            # Register Perception Agent
            perception_agent_id = "demo_perception_001"
            await self.orchestrator.register_agent(
                agent_id=perception_agent_id,
                name="Demo Perception Agent",
                agent_type="perception",
                capabilities=["blockchain_monitoring", "event_detection", "data_collection"]
            )
            self.demo_agents.append(perception_agent_id)
            
            # Register Cognitive Agent
            cognitive_agent_id = "demo_cognitive_001"
            await self.orchestrator.register_agent(
                agent_id=cognitive_agent_id,
                name="Demo Cognitive Agent",
                agent_type="cognitive",
                capabilities=["threat_analysis", "pattern_recognition", "risk_assessment"]
            )
            self.demo_agents.append(cognitive_agent_id)
            
            # Register Action Agent
            action_agent_id = "demo_action_001"
            await self.orchestrator.register_agent(
                agent_id=action_agent_id,
                name="Demo Action Agent",
                agent_type="action",
                capabilities=["security_action_execution", "cross_chain_operations", "emergency_response"]
            )
            self.demo_agents.append(action_agent_id)
            
            # Register Learning Module
            learning_agent_id = "demo_learning_001"
            await self.orchestrator.register_agent(
                agent_id=learning_agent_id,
                name="Demo Learning Module",
                agent_type="learning",
                capabilities=["pattern_learning", "performance_optimization", "model_adaptation"]
            )
            self.demo_agents.append(learning_agent_id)
            
            logger.info(f"Registered {len(self.demo_agents)} demo agents")
            
            # Show agent status
            await self._show_agent_status()
            
        except Exception as e:
            logger.error(f"Agent registration failed: {e}")
            raise
    
    async def _phase_2_event_generation(self):
        """Phase 2: Generate and submit demo events."""
        try:
            logger.info("Phase 2: Event Generation")
            logger.info("-" * 40)
            
            # Generate sample events
            events = self._generate_sample_events()
            
            for i, event in enumerate(events):
                logger.info(f"Submitting event {i+1}/{len(events)}: {event.type.value}")
                
                # Submit event
                event_id = await self.orchestrator.submit_event(event)
                self.demo_events.append(event_id)
                
                # Small delay between events
                await asyncio.sleep(1)
            
            logger.info(f"Submitted {len(self.demo_events)} events")
            
            # Wait for events to be processed
            logger.info("Waiting for events to be processed...")
            await asyncio.sleep(10)
            
        except Exception as e:
            logger.error(f"Event generation failed: {e}")
            raise
    
    async def _phase_3_workflow_execution(self):
        """Phase 3: Execute demo workflows."""
        try:
            logger.info("Phase 3: Workflow Execution")
            logger.info("-" * 40)
            
            # Get available workflows
            available_workflows = list(self.orchestrator.workflows.keys())
            logger.info(f"Available workflows: {available_workflows}")
            
            # Trigger workflows for sample events
            if self.demo_events:
                # Use the first event to trigger workflows
                sample_event = await self._get_event_by_id(self.demo_events[0])
                
                if sample_event:
                    for workflow_type in available_workflows[:2]:  # Trigger first 2 workflows
                        logger.info(f"Triggering workflow: {workflow_type}")
                        
                        workflow_id = await self.orchestrator.trigger_workflow(
                            workflow_type=workflow_type,
                            event=sample_event,
                            priority="normal"
                        )
                        
                        if workflow_id:
                            self.demo_workflows.append(workflow_id)
                            logger.info(f"Workflow {workflow_type} triggered with ID: {workflow_id}")
                        else:
                            logger.warning(f"Failed to trigger workflow {workflow_type}")
            
            # Wait for workflows to execute
            logger.info("Waiting for workflows to execute...")
            await asyncio.sleep(20)
            
        except Exception as e:
            logger.error(f"Workflow execution failed: {e}")
            raise
    
    async def _phase_4_system_monitoring(self):
        """Phase 4: Monitor system status and performance."""
        try:
            logger.info("Phase 4: System Monitoring")
            logger.info("-" * 40)
            
            # Get system status
            status = self.orchestrator.get_system_status()
            
            # Display system overview
            logger.info("System Overview:")
            logger.info(f"  Orchestrator Status: {status['orchestrator']['status']}")
            logger.info(f"  Uptime: {status['orchestrator']['uptime']:.1f} seconds")
            logger.info(f"  Active Agents: {status['agents']['total']}")
            logger.info(f"  Active Workflows: {status['workflows']['active']}")
            logger.info(f"  Total Events: {status['events']['total_events']}")
            logger.info(f"  System Health: {status['performance']['system_health']}")
            
            # Display agent details
            logger.info("\nAgent Details:")
            for agent_id in self.demo_agents:
                agent_info = self.orchestrator.get_agent_info(agent_id)
                if agent_info:
                    logger.info(f"  {agent_info.name}: {agent_info.status.value}")
            
            # Display workflow status
            logger.info("\nWorkflow Status:")
            for workflow_id in self.demo_workflows:
                workflow_status = self.orchestrator.get_workflow_status(workflow_id)
                if workflow_status:
                    logger.info(f"  {workflow_id}: {workflow_status.get('status', 'unknown')}")
            
            # Display performance metrics
            logger.info("\nPerformance Metrics:")
            logger.info(f"  Events Processed: {status['events']['processed_events']}")
            logger.info(f"  Events Failed: {status['events']['failed_events']}")
            if status['events']['total_events'] > 0:
                success_rate = (status['events']['processed_events'] / status['events']['total_events']) * 100
                logger.info(f"  Success Rate: {success_rate:.1f}%")
            
        except Exception as e:
            logger.error(f"System monitoring failed: {e}")
            raise
    
    async def _cleanup(self):
        """Clean up demo resources."""
        try:
            logger.info("Cleaning up demo resources...")
            
            # Unregister demo agents
            for agent_id in self.demo_agents:
                await self.orchestrator.unregister_agent(agent_id)
            
            # Stop orchestrator
            await self.orchestrator.stop()
            
            logger.info("Cleanup completed")
            
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
    
    def _generate_sample_events(self) -> list:
        """Generate sample blockchain events for the demo."""
        events = []
        
        # Event 1: Normal transaction
        event1 = BlockchainEvent(
            id="demo_event_001",
            type=EventType.TRANSACTION,
            chain_id=1,
            hash="0x1234567890abcdef1234567890abcdef12345678",
            from_address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            to_address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            value="1000000000000000000",  # 1 ETH
            timestamp=datetime.utcnow(),
            priority=EventPriority.MEDIUM,
            risk_score=25.0,
            confidence=0.9
        )
        events.append(event1)
        
        # Event 2: High-risk transaction
        event2 = BlockchainEvent(
            id="demo_event_002",
            type=EventType.TRANSACTION,
            chain_id=56,
            hash="0xabcdef1234567890abcdef1234567890abcdef12",
            from_address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            to_address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            value="1000000000000000000000",  # 1000 ETH
            timestamp=datetime.utcnow(),
            priority=EventPriority.HIGH,
            risk_score=75.0,
            confidence=0.8
        )
        events.append(event2)
        
        # Event 3: Critical contract interaction
        event3 = BlockchainEvent(
            id="demo_event_003",
            type=EventType.CONTRACT_EVENT,
            chain_id=137,
            hash="0x7890abcdef1234567890abcdef1234567890abcd",
            contract_address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            data="0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d4c9db96c4b4d8b600000000000000000000000000000000000000000000000000000000000000000",
            timestamp=datetime.utcnow(),
            priority=EventPriority.CRITICAL,
            risk_score=90.0,
            confidence=0.95
        )
        events.append(event3)
        
        # Event 4: Cross-chain bridge operation
        event4 = BlockchainEvent(
            id="demo_event_004",
            type=EventType.BRIDGE,
            chain_id=42161,
            hash="0x4567890abcdef1234567890abcdef1234567890ab",
            from_address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            to_address="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
            value="500000000000000000000",  # 500 ETH
            timestamp=datetime.utcnow(),
            priority=EventPriority.HIGH,
            risk_score=60.0,
            confidence=0.85,
            cross_chain=True,
            bridge_protocol="multichain"
        )
        events.append(event4)
        
        return events
    
    async def _get_event_by_id(self, event_id: str):
        """Get event by ID (placeholder implementation)."""
        # In a real implementation, this would query the event store
        # For demo purposes, we'll create a simple event
        return BlockchainEvent(
            id=event_id,
            type=EventType.TRANSACTION,
            chain_id=1,
            hash="0x" + "0" * 64,
            timestamp=datetime.utcnow(),
            priority=EventPriority.MEDIUM,
            risk_score=50.0,
            confidence=0.8
        )
    
    async def _show_agent_status(self):
        """Show the status of registered agents."""
        try:
            logger.info("Agent Status:")
            for agent_id in self.demo_agents:
                agent_info = self.orchestrator.get_agent_info(agent_id)
                if agent_info:
                    logger.info(f"  {agent_info.name} ({agent_id}): {agent_info.status.value}")
                else:
                    logger.warning(f"  Agent {agent_id} not found")
            
        except Exception as e:
            logger.error(f"Failed to show agent status: {e}")


async def main():
    """Main demo function."""
    try:
        # Create and run the demo
        demo = AegisDemo()
        
        # Run the demo
        success = await demo.run_demo()
        
        if success:
            logger.info("Demo completed successfully!")
            return 0
        else:
            logger.error("Demo failed!")
            return 1
            
    except KeyboardInterrupt:
        logger.info("Demo interrupted by user")
        return 0
    
    except Exception as e:
        logger.error(f"Demo failed with error: {e}")
        return 1


if __name__ == "__main__":
    try:
        # Run the demo
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        logger.info("Demo interrupted by user")
        sys.exit(0)
    
    except Exception as e:
        logger.error(f"Fatal error in demo: {e}")
        sys.exit(1)
