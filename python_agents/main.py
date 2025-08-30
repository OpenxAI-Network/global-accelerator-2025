#!/usr/bin/env python3
"""
Main entry point for the Aegis Multi-Agent AI System.

This module provides the main application that starts and manages the entire
multi-agent system, including the orchestrator, agents, and all core components.
"""

import asyncio
import signal
import sys
import time
from pathlib import Path
from typing import Optional
import argparse

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from core.agent_orchestrator import orchestrator
from core.config import config
from loguru import logger


class AegisSystem:
    """Main Aegis Multi-Agent AI System application."""
    
    def __init__(self):
        """Initialize the Aegis system."""
        self.orchestrator = orchestrator
        self.is_running = False
        self.shutdown_event = asyncio.Event()
        
        # Setup signal handlers
        self._setup_signal_handlers()
    
    def _setup_signal_handlers(self):
        """Setup signal handlers for graceful shutdown."""
        def signal_handler(signum, frame):
            logger.info(f"Received signal {signum}, initiating shutdown...")
            self.shutdown_event.set()
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
    
    async def start(self) -> bool:
        """Start the Aegis system."""
        try:
            logger.info("=" * 60)
            logger.info("Starting Aegis Multi-Agent AI System")
            logger.info("=" * 60)
            logger.info(f"Version: {config.app_version}")
            logger.info(f"Environment: {config.environment}")
            logger.info(f"Debug Mode: {config.debug}")
            
            # Validate configuration
            if not await self._validate_configuration():
                logger.error("Configuration validation failed")
                return False
            
            # Start the orchestrator
            if not await self.orchestrator.start():
                logger.error("Failed to start agent orchestrator")
                return False
            
            # Start background tasks
            await self._start_background_tasks()
            
            self.is_running = True
            logger.info("Aegis system started successfully")
            
            # Log system status
            await self._log_system_status()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to start Aegis system: {e}")
            return False
    
    async def stop(self):
        """Stop the Aegis system."""
        try:
            logger.info("Stopping Aegis system...")
            
            self.is_running = False
            
            # Stop the orchestrator
            await self.orchestrator.stop()
            
            logger.info("Aegis system stopped successfully")
            
        except Exception as e:
            logger.error(f"Error stopping Aegis system: {e}")
    
    async def run(self):
        """Run the main system loop."""
        try:
            # Start the system
            if not await self.start():
                return False
            
            # Main loop
            while self.is_running and not self.shutdown_event.is_set():
                try:
                    # Check system health
                    await self._check_system_health()
                    
                    # Wait for shutdown signal or health check interval
                    try:
                        await asyncio.wait_for(
                            self.shutdown_event.wait(),
                            timeout=config.health_check_interval
                        )
                    except asyncio.TimeoutError:
                        # Continue running
                        pass
                    
                except Exception as e:
                    logger.error(f"Error in main loop: {e}")
                    await asyncio.sleep(5)
            
            return True
            
        except Exception as e:
            logger.error(f"Fatal error in main loop: {e}")
            return False
        
        finally:
            # Ensure system is stopped
            await self.stop()
    
    async def _validate_configuration(self) -> bool:
        """Validate system configuration."""
        try:
            logger.info("Validating system configuration...")
            
            # Check required services
            required_services = ["redis", "neo4j", "chroma", "gemini"]
            validation_results = {}
            
            for service in required_services:
                is_valid = config.validate_connection(service)
                validation_results[service] = is_valid
                status = "✓" if is_valid else "✗"
                logger.info(f"  {service}: {status}")
            
            # Check if critical services are available
            critical_services = ["redis", "gemini"]
            critical_failures = [service for service in critical_services if not validation_results.get(service, False)]
            
            if critical_failures:
                logger.error(f"Critical services failed validation: {critical_failures}")
                if config.is_production():
                    return False
                else:
                    logger.warning("Continuing in development mode with validation failures")
            
            logger.info("Configuration validation completed")
            return True
            
        except Exception as e:
            logger.error(f"Configuration validation error: {e}")
            return False
    
    async def _start_background_tasks(self):
        """Start background system tasks."""
        try:
            logger.info("Starting background tasks...")
            
            # Start periodic status logging
            asyncio.create_task(self._periodic_status_logging())
            
            # Start configuration monitoring
            asyncio.create_task(self._monitor_configuration())
            
            logger.info("Background tasks started")
            
        except Exception as e:
            logger.error(f"Failed to start background tasks: {e}")
            raise
    
    async def _check_system_health(self):
        """Check overall system health."""
        try:
            # Get system status
            status = self.orchestrator.get_system_status()
            
            # Check critical components
            core_components = status.get("core_components", {})
            
            if not core_components.get("message_broker", False):
                logger.error("Message broker is unhealthy")
                self.performance_metrics["system_health"] = "critical"
            
            elif not core_components.get("rag_engine", False):
                logger.warning("RAG engine is unhealthy")
                self.performance_metrics["system_health"] = "degraded"
            
            # Check agent health
            agent_status = status.get("agents", {})
            total_agents = agent_status.get("total", 0)
            active_agents = agent_status.get("by_status", {}).get("active", 0)
            
            if total_agents > 0 and active_agents == 0:
                logger.error("No active agents found")
                self.performance_metrics["system_health"] = "critical"
            
            elif total_agents > 0 and active_agents < total_agents:
                logger.warning(f"Some agents are inactive: {active_agents}/{total_agents}")
                self.performance_metrics["system_health"] = "degraded"
            
        except Exception as e:
            logger.error(f"Health check error: {e}")
    
    async def _periodic_status_logging(self):
        """Log system status periodically."""
        try:
            while self.is_running and not self.shutdown_event.is_set():
                try:
                    await asyncio.sleep(300)  # Every 5 minutes
                    
                    if self.is_running:
                        status = self.orchestrator.get_system_status()
                        
                        logger.info("=" * 40)
                        logger.info("System Status Summary")
                        logger.info("=" * 40)
                        logger.info(f"Orchestrator: {status['orchestrator']['status']}")
                        logger.info(f"Uptime: {status['orchestrator']['uptime']:.1f}s")
                        logger.info(f"Active Agents: {status['agents']['total']}")
                        logger.info(f"Active Workflows: {status['workflows']['active']}")
                        logger.info(f"Total Events: {status['events']['total_events']}")
                        logger.info(f"Success Rate: {status['events'].get('success_rate', 0):.1f}%")
                        logger.info(f"System Health: {status['performance']['system_health']}")
                        logger.info("=" * 40)
                        
                except Exception as e:
                    logger.error(f"Status logging error: {e}")
                    await asyncio.sleep(60)
                    
        except asyncio.CancelledError:
            logger.info("Periodic status logging cancelled")
        except Exception as e:
            logger.error(f"Periodic status logging fatal error: {e}")
    
    async def _monitor_configuration(self):
        """Monitor configuration for changes."""
        try:
            while self.is_running and not self.shutdown_event.is_set():
                try:
                    await asyncio.sleep(600)  # Every 10 minutes
                    
                    if self.is_running:
                        # Check if configuration has changed
                        # This is a placeholder for actual configuration monitoring
                        logger.debug("Configuration monitoring check completed")
                        
                except Exception as e:
                    logger.error(f"Configuration monitoring error: {e}")
                    await asyncio.sleep(60)
                    
        except asyncio.CancelledError:
            logger.info("Configuration monitoring cancelled")
        except Exception as e:
            logger.error(f"Configuration monitoring fatal error: {e}")
    
    async def _log_system_status(self):
        """Log initial system status."""
        try:
            status = self.orchestrator.get_system_status()
            
            logger.info("=" * 40)
            logger.info("Initial System Status")
            logger.info("=" * 40)
            logger.info(f"Orchestrator: {status['orchestrator']['status']}")
            logger.info(f"Core Components:")
            for component, healthy in status['core_components'].items():
                status_symbol = "✓" if healthy else "✗"
                logger.info(f"  {component}: {status_symbol}")
            logger.info(f"Active Agents: {status['agents']['total']}")
            logger.info(f"Available Workflows: {len(self.orchestrator.workflows)}")
            logger.info("=" * 40)
            
        except Exception as e:
            logger.error(f"Failed to log system status: {e}")


async def main():
    """Main application entry point."""
    try:
        # Parse command line arguments
        parser = argparse.ArgumentParser(description="Aegis Multi-Agent AI System")
        parser.add_argument(
            "--config",
            type=str,
            help="Path to configuration file"
        )
        parser.add_argument(
            "--validate-only",
            action="store_true",
            help="Only validate configuration and exit"
        )
        parser.add_argument(
            "--status",
            action="store_true",
            help="Show system status and exit"
        )
        
        args = parser.parse_args()
        
        # Create and run the system
        system = AegisSystem()
        
        if args.validate_only:
            # Only validate configuration
            logger.info("Configuration validation mode")
            if await system._validate_configuration():
                logger.info("Configuration validation passed")
                return 0
            else:
                logger.error("Configuration validation failed")
                return 1
        
        elif args.status:
            # Show system status
            logger.info("System status mode")
            status = system.orchestrator.get_system_status()
            print("System Status:")
            print(f"  Orchestrator: {status['orchestrator']['status']}")
            print(f"  Active Agents: {status['agents']['total']}")
            print(f"  Active Workflows: {status['workflows']['active']}")
            return 0
        
        else:
            # Run the full system
            logger.info("Starting Aegis Multi-Agent AI System...")
            
            # Run the system
            success = await system.run()
            
            if success:
                logger.info("System completed successfully")
                return 0
            else:
                logger.error("System failed")
                return 1
    
    except KeyboardInterrupt:
        logger.info("System interrupted by user")
        return 0
    
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        return 1


if __name__ == "__main__":
    try:
        # Run the main application
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
        
    except KeyboardInterrupt:
        logger.info("System interrupted by user")
        sys.exit(0)
    
    except Exception as e:
        logger.error(f"Fatal error in main: {e}")
        sys.exit(1)
