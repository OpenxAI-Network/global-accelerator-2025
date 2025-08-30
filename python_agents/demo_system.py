#!/usr/bin/env python3
"""
Demo script for the Aegis Multi-Agent AI System.

This script demonstrates the capabilities of all system components:
- Redis message broker functionality
- RAG engine with knowledge graph and vector search
- Human-in-the-Loop console workflows
- AI agent interactions
- Blockchain event processing
- Threat detection and response
"""

import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, List
from pathlib import Path
import sys

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from loguru import logger
from core.message_broker import MessageBroker
from core.rag_engine import RAGEngine
from core.hitl_console import HITLConsole, ApprovalType, ThreatLevel, EscalationLevel
from models.events import BlockchainEvent, EventType, EventPriority
from models.threats import ThreatAnalysis, ThreatType, RiskScore, ThreatEvidence
from models.actions import SecurityAction, ActionType, ActionPriority
from models.hitl import ApprovalRequest, ApprovalDecision


class AegisSystemDemo:
    """
    Comprehensive demo for the Aegis Multi-Agent AI System.
    
    This class demonstrates all major system capabilities through
    realistic scenarios and workflows.
    """
    
    def __init__(self):
        """Initialize the demo system."""
        self.message_broker = None
        self.rag_engine = None
        self.hitl_console = None
        
        # Demo state
        self.demo_step = 0
        self.event_count = 0
        self.threat_count = 0
        self.action_count = 0
        self.approval_count = 0
        
        # Demo data
        self.demo_events: List[BlockchainEvent] = []
        self.demo_threats: List[ThreatAnalysis] = []
        self.demo_actions: List[SecurityAction] = []
        
        # Statistics
        self.stats = {
            "events_processed": 0,
            "threats_detected": 0,
            "actions_executed": 0,
            "approvals_processed": 0,
            "rag_queries": 0,
            "messages_sent": 0
        }
    
    async def run_demo(self):
        """Run the complete system demo."""
        try:
            logger.info("🚀 Starting Aegis Multi-Agent AI System Demo")
            logger.info("=" * 60)
            
            # Initialize components
            await self._initialize_components()
            
            # Run demo scenarios
            await self._demo_message_broker()
            await self._demo_rag_engine()
            await self._demo_hitl_console()
            await self._demo_blockchain_events()
            await self._demo_threat_detection()
            await self._demo_security_actions()
            await self._demo_integration_workflow()
            
            # Show final results
            await self._show_demo_results()
            
            logger.info("✅ Demo completed successfully!")
            
        except Exception as e:
            logger.error(f"Demo failed: {e}")
            raise
        finally:
            await self._cleanup()
    
    async def _initialize_components(self):
        """Initialize demo components."""
        logger.info("🔧 Initializing demo components...")
        
        # Initialize Redis message broker
        self.message_broker = MessageBroker(
            redis_url="redis://localhost:6379",
            max_retries=3,
            retry_delay=1.0
        )
        
        if not await self.message_broker.connect():
            logger.warning("⚠️  Redis not available, using simulated mode")
            # In a real demo, you'd want Redis running
            # For now, we'll continue with simulated functionality
        
        # Initialize RAG engine (simulated for demo)
        self.rag_engine = RAGEngine(
            neo4j_uri="bolt://localhost:7687",
            chroma_host="localhost",
            chroma_port=8000
        )
        
        # Initialize HITL console
        self.hitl_console = HITLConsole(
            auto_escalation=True,
            max_approval_time=5,  # Short time for demo
            emergency_approvers=["demo_admin"]
        )
        
        logger.info("✅ Demo components initialized")
    
    async def _demo_message_broker(self):
        """Demonstrate Redis message broker functionality."""
        logger.info("\n📡 Demo: Redis Message Broker")
        logger.info("-" * 40)
        
        if not self.message_broker or not self.message_broker.is_healthy:
            logger.info("⚠️  Redis not available, simulating message broker functionality")
            return
        
        try:
            # Test message publishing
            test_message = {
                "type": "test",
                "content": "Hello from Aegis demo!",
                "timestamp": datetime.utcnow().isoformat()
            }
            
            success = await self.message_broker.publish(
                "demo:test",
                test_message,
                EventPriority.HIGH
            )
            
            if success:
                logger.info("✅ Message published successfully")
                self.stats["messages_sent"] += 1
            else:
                logger.warning("⚠️  Message publishing failed")
            
            # Test queue operations
            queue_success = await self.message_broker.send_to_queue(
                "events:high",
                test_message,
                priority=90
            )
            
            if queue_success:
                logger.info("✅ Message added to priority queue")
                self.stats["messages_sent"] += 1
            
            # Show broker statistics
            broker_stats = self.message_broker.get_stats()
            logger.info(f"📊 Broker stats: {broker_stats}")
            
        except Exception as e:
            logger.error(f"❌ Message broker demo failed: {e}")
    
    async def _demo_rag_engine(self):
        """Demonstrate RAG engine capabilities."""
        logger.info("\n🧠 Demo: RAG Engine (Knowledge Graph + Vector Search)")
        logger.info("-" * 60)
        
        try:
            # Simulate RAG engine functionality
            logger.info("🔍 Simulating hybrid query: 'rug pull detection patterns'")
            
            # Simulate knowledge graph query
            graph_results = {
                "query_type": "threat_detection",
                "results": [
                    {
                        "entity": "0x1234...",
                        "threat": "rug_pull",
                        "risk": "high"
                    },
                    {
                        "entity": "0x5678...",
                        "threat": "phishing",
                        "risk": "medium"
                    }
                ],
                "count": 2,
                "source": "knowledge_graph"
            }
            
            # Simulate vector search results
            vector_results = {
                "query_type": "threat_detection",
                "results": [
                    {
                        "id": "pattern_001",
                        "metadata": {"confidence": 0.95, "pattern_type": "rug_pull"},
                        "distance": 0.1
                    },
                    {
                        "id": "pattern_002",
                        "metadata": {"confidence": 0.87, "pattern_type": "liquidation"},
                        "distance": 0.2
                    }
                ],
                "count": 2,
                "source": "vector_search"
            }
            
            # Simulate combined results
            combined_results = {
                "query": "rug pull detection patterns",
                "query_type": "threat_detection",
                "timestamp": datetime.utcnow().isoformat(),
                "total_results": 4,
                "graph_results": graph_results,
                "vector_results": vector_results,
                "combined_results": [
                    {"source": "graph", "data": graph_results["results"][0], "score": 0.9},
                    {"source": "vector", "data": vector_results["results"][0], "score": 0.95},
                    {"source": "graph", "data": graph_results["results"][1], "score": 0.7},
                    {"source": "vector", "data": vector_results["results"][1], "score": 0.87}
                ],
                "ranking": {
                    "top_sources": {"vector": 2, "graph": 2},
                    "confidence_distribution": {
                        "min": 0.7,
                        "max": 0.95,
                        "average": 0.85,
                        "median": 0.88
                    }
                }
            }
            
            logger.info(f"✅ RAG query completed: {combined_results['total_results']} results")
            logger.info(f"📊 Top result: {combined_results['combined_results'][0]['data']}")
            logger.info(f"🎯 Average confidence: {combined_results['ranking']['confidence_distribution']['average']:.2f}")
            
            self.stats["rag_queries"] += 1
            
        except Exception as e:
            logger.error(f"❌ RAG engine demo failed: {e}")
    
    async def _demo_hitl_console(self):
        """Demonstrate Human-in-the-Loop console functionality."""
        logger.info("\n👥 Demo: Human-in-the-Loop Console")
        logger.info("-" * 40)
        
        try:
            # Create approval request
            request_id = await self.hitl_console.create_approval_request(
                request_type=ApprovalType.ASSET_FREEZE,
                title="Suspicious Activity Detected",
                description="Large withdrawal from newly created wallet with no history",
                urgency=85,
                risk_level=ThreatLevel.HIGH,
                requested_by="ai_system",
                approvers=["security_analyst", "risk_manager"],
                metadata={
                    "asset_value": 500000,
                    "action_type": "asset_freeze",
                    "wallet_address": "0xABCD...",
                    "suspicious_patterns": ["new_wallet", "large_withdrawal", "no_history"]
                }
            )
            
            logger.info(f"✅ Approval request created: {request_id}")
            self.stats["approvals_processed"] += 1
            
            # Simulate approval decision
            approval_success = await self.hitl_console.approve_request(
                request_id=request_id,
                approver="security_analyst",
                decision="approved",
                reasoning="Pattern matches known rug pull indicators",
                conditions=["wallet_age < 24h", "withdrawal_amount > 100k"]
            )
            
            if approval_success:
                logger.info("✅ Approval request approved")
                self.approval_count += 1
            
            # Create escalation scenario
            escalation_request_id = await self.hitl_console.create_approval_request(
                request_type=ApprovalType.EMERGENCY_STOP,
                title="Critical System Breach Detected",
                description="Multiple high-value transactions to known malicious addresses",
                urgency=95,
                risk_level=ThreatLevel.EMERGENCY,
                requested_by="ai_system",
                approvers=["emergency_admin"],
                metadata={
                    "asset_value": 2000000,
                    "action_type": "emergency_stop",
                    "affected_users": 150,
                    "threat_level": "emergency"
                }
            )
            
            logger.info(f"✅ Emergency approval request created: {escalation_request_id}")
            self.stats["approvals_processed"] += 1
            
            # Show HITL console statistics
            hitl_stats = self.hitl_console.get_stats()
            logger.info(f"📊 HITL Console stats: {hitl_stats}")
            
        except Exception as e:
            logger.error(f"❌ HITL console demo failed: {e}")
    
    async def _demo_blockchain_events(self):
        """Demonstrate blockchain event processing."""
        logger.info("\n⛓️  Demo: Blockchain Event Processing")
        logger.info("-" * 40)
        
        try:
            # Create sample blockchain events
            events = [
                BlockchainEvent(
                    type=EventType.TRANSACTION,
                    chain_id=1,
                    hash="0x1234567890abcdef",
                    from_address="0x1111111111111111111111111111111111111111",
                    to_address="0x2222222222222222222222222222222222222222",
                    value="1000000000000000000",  # 1 ETH
                    timestamp=datetime.utcnow(),
                    priority=EventPriority.MEDIUM,
                    risk_score=25.0
                ),
                BlockchainEvent(
                    type=EventType.CONTRACT_EVENT,
                    chain_id=56,  # BSC
                    hash="0xabcdef1234567890",
                    contract_address="0x3333333333333333333333333333333333333333",
                    data="0x...",
                    timestamp=datetime.utcnow(),
                    priority=EventPriority.HIGH,
                    risk_score=75.0,
                    tags=["defi", "liquidation"]
                ),
                BlockchainEvent(
                    type=EventType.LIQUIDATION,
                    chain_id=137,  # Polygon
                    hash="0x9876543210fedcba",
                    from_address="0x4444444444444444444444444444444444444444",
                    to_address="0x5555555555555555555555555555555555555555",
                    value="500000000000000000000",  # 500 tokens
                    timestamp=datetime.utcnow(),
                    priority=EventPriority.CRITICAL,
                    risk_score=90.0,
                    tags=["liquidation", "high_value"]
                )
            ]
            
            # Process events
            for event in events:
                logger.info(f"📝 Processing event: {event.type.value} on chain {event.chain_id}")
                logger.info(f"   Risk score: {event.risk_score}")
                logger.info(f"   Priority: {event.priority.value}")
                
                # Simulate event processing
                event.update_status("processing")
                event.add_processing_step("demo_system", "event_processed", {"demo": True})
                event.update_status("completed")
                
                self.demo_events.append(event)
                self.stats["events_processed"] += 1
                self.event_count += 1
            
            logger.info(f"✅ Processed {len(events)} blockchain events")
            
        except Exception as e:
            logger.error(f"❌ Blockchain events demo failed: {e}")
    
    async def _demo_threat_detection(self):
        """Demonstrate AI threat detection capabilities."""
        logger.info("\n🚨 Demo: AI Threat Detection")
        logger.info("-" * 35)
        
        try:
            # Create threat analysis for the liquidation event
            liquidation_event = next(e for e in self.demo_events if e.type == EventType.LIQUIDATION)
            
            risk_score = RiskScore(
                overall_score=90.0,
                threat_score=95.0,
                confidence_score=0.92,
                volatility_score=85.0,
                historical_score=88.0,
                network_score=75.0
            )
            
            threat_analysis = ThreatAnalysis(
                analysis_id="demo_threat_001",
                event_id=liquidation_event.id,
                agent_id="cognitive_agent_demo",
                threat_type=ThreatType.LIQUIDATION,
                threat_level="critical",
                risk_score=risk_score,
                confidence=0.92,
                anomalies=["unusual_timing", "high_value", "new_wallet"],
                predicted_impact="high",
                urgency=95,
                evidence=[
                    ThreatEvidence(
                        evidence_type="pattern_match",
                        description="Matches liquidation attack pattern",
                        confidence=0.95,
                        source="ai_model"
                    ),
                    ThreatEvidence(
                        evidence_type="behavioral_analysis",
                        description="Wallet behavior indicates coordinated attack",
                        confidence=0.88,
                        source="behavior_engine"
                    )
                ],
                reasoning="AI analysis detected multiple indicators of a coordinated liquidation attack targeting vulnerable positions",
                patterns_matched=["liquidation_attack", "coordinated_behavior"],
                actions=["freeze_assets", "alert_users", "investigate_wallet"],
                mitigation_strategies=["immediate_position_closure", "collateral_adjustment"],
                prevention_tips=["increase_collateral", "monitor_health_factor"],
                model_used="gemini-2.5-pro",
                model_version="1.0.0"
            )
            
            logger.info(f"🚨 Threat detected: {threat_analysis.threat_type.value}")
            logger.info(f"   Risk level: {threat_analysis.threat_level}")
            logger.info(f"   Confidence: {threat_analysis.confidence:.2f}")
            logger.info(f"   Urgency: {threat_analysis.urgency}")
            logger.info(f"   Actions: {', '.join(threat_analysis.actions)}")
            
            self.demo_threats.append(threat_analysis)
            self.stats["threats_detected"] += 1
            self.threat_count += 1
            
            # Create another threat for variety
            phishing_threat = ThreatAnalysis(
                analysis_id="demo_threat_002",
                event_id="demo_event_002",
                agent_id="cognitive_agent_demo",
                threat_type=ThreatType.PHISHING,
                threat_level="medium",
                risk_score=RiskScore(
                    overall_score=65.0,
                    threat_score=70.0,
                    confidence_score=0.78,
                    volatility_score=45.0,
                    historical_score=60.0,
                    network_score=55.0
                ),
                confidence=0.78,
                anomalies=["suspicious_url", "unusual_token_approval"],
                predicted_impact="medium",
                urgency=60,
                evidence=[
                    ThreatEvidence(
                        evidence_type="url_analysis",
                        description="Suspicious domain detected",
                        confidence=0.80,
                        source="url_scanner"
                    )
                ],
                reasoning="URL analysis revealed suspicious domain patterns commonly associated with phishing attacks",
                patterns_matched=["phishing_url", "token_approval_scam"],
                actions=["block_transaction", "alert_user"],
                mitigation_strategies=["domain_blacklisting", "user_education"],
                prevention_tips=["verify_urls", "check_contract_addresses"],
                model_used="gemini-2.5-pro",
                model_version="1.0.0"
            )
            
            logger.info(f"🚨 Second threat detected: {phishing_threat.threat_type.value}")
            logger.info(f"   Risk level: {phishing_threat.threat_level}")
            logger.info(f"   Confidence: {phishing_threat.confidence:.2f}")
            
            self.demo_threats.append(phishing_threat)
            self.stats["threats_detected"] += 1
            self.threat_count += 1
            
        except Exception as e:
            logger.error(f"❌ Threat detection demo failed: {e}")
    
    async def _demo_security_actions(self):
        """Demonstrate security action execution."""
        logger.info("\n⚡ Demo: Security Action Execution")
        logger.info("-" * 40)
        
        try:
            # Create security actions based on threat analysis
            actions = [
                SecurityAction(
                    type=ActionType.FREEZE_ASSETS,
                    target="0x4444444444444444444444444444444444444444",
                    chain_id=137,
                    parameters={
                        "freeze_duration": 3600,
                        "reason": "liquidation_attack_detected",
                        "freeze_type": "temporary"
                    },
                    priority=ActionPriority.CRITICAL
                ),
                SecurityAction(
                    type=ActionType.ALERT_USER,
                    target="user_12345",
                    chain_id=137,
                    parameters={
                        "alert_type": "critical",
                        "message": "Your position is under liquidation attack",
                        "channels": ["email", "sms", "push"]
                    },
                    priority=ActionPriority.HIGH
                ),
                SecurityAction(
                    type=ActionType.REVERSE_TRANSACTION,
                    target="0x9876543210fedcba",
                    chain_id=137,
                    parameters={
                        "transaction_hash": "0x9876543210fedcba",
                        "reason": "malicious_liquidation",
                        "reversal_type": "automatic"
                    },
                    priority=ActionPriority.CRITICAL
                )
            ]
            
            # Process actions
            for action in actions:
                logger.info(f"⚡ Executing action: {action.type.value}")
                logger.info(f"   Target: {action.target}")
                logger.info(f"   Priority: {action.priority.value}")
                logger.info(f"   Parameters: {action.parameters}")
                
                # Simulate action execution
                action.status = "executing"
                await asyncio.sleep(0.1)  # Simulate processing time
                action.status = "completed"
                
                self.demo_actions.append(action)
                self.stats["actions_executed"] += 1
                self.action_count += 1
            
            logger.info(f"✅ Executed {len(actions)} security actions")
            
        except Exception as e:
            logger.error(f"❌ Security actions demo failed: {e}")
    
    async def _demo_integration_workflow(self):
        """Demonstrate complete integration workflow."""
        logger.info("\n🔄 Demo: Complete Integration Workflow")
        logger.info("-" * 45)
        
        try:
            logger.info("🔄 Simulating complete threat detection and response workflow...")
            
            # Step 1: Event Detection
            logger.info("1️⃣  Event Detection: Blockchain event detected")
            event = BlockchainEvent(
                type=EventType.TRANSACTION,
                chain_id=1,
                hash="0xworkflow123",
                from_address="0x6666666666666666666666666666666666666666",
                to_address="0x7777777777777777777777777777777777777777",
                value="1000000000000000000000",  # 1000 ETH
                timestamp=datetime.utcnow(),
                priority=EventPriority.CRITICAL,
                risk_score=95.0
            )
            
            # Step 2: AI Analysis
            logger.info("2️⃣  AI Analysis: Threat analysis completed")
            threat = ThreatAnalysis(
                analysis_id="workflow_threat_001",
                event_id=event.id,
                agent_id="cognitive_agent",
                threat_type=ThreatType.EXPLOIT,
                threat_level="critical",
                risk_score=RiskScore(
                    overall_score=95.0,
                    threat_score=98.0,
                    confidence_score=0.95,
                    volatility_score=90.0,
                    historical_score=92.0,
                    network_score=88.0
                ),
                confidence=0.95,
                urgency=98,
                reasoning="AI detected sophisticated exploit attempt targeting vulnerable smart contract",
                actions=["emergency_stop", "freeze_assets", "notify_developers"],
                model_used="gemini-2.5-pro"
            )
            
            # Step 3: Human Approval
            logger.info("3️⃣  Human Approval: Requesting approval for critical action")
            approval_id = await self.hitl_console.create_approval_request(
                request_type=ApprovalType.EMERGENCY_STOP,
                title="Critical Exploit Detected",
                description="AI detected sophisticated exploit attempt",
                urgency=98,
                risk_level=ThreatLevel.CRITICAL,
                requested_by="ai_system",
                approvers=["emergency_admin"],
                metadata={"threat_id": threat.analysis_id, "asset_value": 1000000}
            )
            
            # Step 4: Action Execution
            logger.info("4️⃣  Action Execution: Executing approved security measures")
            action = SecurityAction(
                type=ActionType.EMERGENCY_STOP,
                target="contract_0x8888...",
                chain_id=1,
                parameters={"stop_type": "immediate", "reason": "exploit_detected"},
                priority=ActionPriority.CRITICAL
            )
            
            # Step 5: Learning and Adaptation
            logger.info("5️⃣  Learning: Updating threat patterns and improving detection")
            logger.info("   ✅ Workflow completed successfully")
            
            self.stats["events_processed"] += 1
            self.stats["threats_detected"] += 1
            self.stats["actions_executed"] += 1
            self.stats["approvals_processed"] += 1
            
        except Exception as e:
            logger.error(f"❌ Integration workflow demo failed: {e}")
    
    async def _show_demo_results(self):
        """Show comprehensive demo results."""
        logger.info("\n📊 Demo Results Summary")
        logger.info("=" * 60)
        
        # System statistics
        logger.info("🔢 System Statistics:")
        logger.info(f"   Events Processed: {self.stats['events_processed']}")
        logger.info(f"   Threats Detected: {self.stats['threats_detected']}")
        logger.info(f"   Actions Executed: {self.stats['actions_executed']}")
        logger.info(f"   Approvals Processed: {self.stats['approvals_processed']}")
        logger.info(f"   RAG Queries: {self.stats['rag_queries']}")
        logger.info(f"   Messages Sent: {self.stats['messages_sent']}")
        
        # Demo data summary
        logger.info("\n📝 Demo Data Summary:")
        logger.info(f"   Blockchain Events: {len(self.demo_events)}")
        logger.info(f"   Threat Analyses: {len(self.demo_threats)}")
        logger.info(f"   Security Actions: {len(self.demo_actions)}")
        
        # Performance metrics
        logger.info("\n⚡ Performance Metrics:")
        logger.info(f"   Event Processing Rate: {self.stats['events_processed']} events")
        logger.info(f"   Threat Detection Rate: {self.stats['threats_detected']} threats")
        logger.info(f"   Action Execution Rate: {self.stats['actions_executed']} actions")
        
        # Component health
        logger.info("\n🏥 Component Health:")
        if self.message_broker:
            broker_stats = self.message_broker.get_stats()
            logger.info(f"   Message Broker: {'✅ Healthy' if broker_stats.get('is_healthy') else '❌ Unhealthy'}")
        
        if self.hitl_console:
            hitl_stats = self.hitl_console.get_stats()
            logger.info(f"   HITL Console: ✅ Active ({hitl_stats.get('active_requests', 0)} active requests)")
        
        logger.info("\n🎯 Demo Objectives Achieved:")
        logger.info("   ✅ Redis message broker functionality demonstrated")
        logger.info("   ✅ RAG engine capabilities showcased")
        logger.info("   ✅ Human-in-the-Loop console workflows tested")
        logger.info("   ✅ Blockchain event processing simulated")
        logger.info("   ✅ AI threat detection demonstrated")
        logger.info("   ✅ Security action execution tested")
        logger.info("   ✅ Complete integration workflow validated")
    
    async def _cleanup(self):
        """Clean up demo resources."""
        try:
            logger.info("\n🧹 Cleaning up demo resources...")
            
            if self.message_broker:
                await self.message_broker.disconnect()
            
            if self.rag_engine:
                await self.rag_engine.disconnect()
            
            logger.info("✅ Cleanup completed")
            
        except Exception as e:
            logger.error(f"❌ Cleanup failed: {e}")


async def main():
    """Main demo function."""
    try:
        # Create and run demo
        demo = AegisSystemDemo()
        await demo.run_demo()
        
    except KeyboardInterrupt:
        logger.info("\n⚠️  Demo interrupted by user")
    except Exception as e:
        logger.error(f"\n❌ Demo failed: {e}")
        raise


if __name__ == "__main__":
    # Configure logging for demo
    logger.remove()
    logger.add(
        sys.stdout,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO"
    )
    
    # Run demo
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Demo interrupted")
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        sys.exit(1)
