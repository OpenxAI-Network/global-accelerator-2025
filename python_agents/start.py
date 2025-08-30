#!/usr/bin/env python3
"""
Startup script for the Aegis Multi-Agent AI System.

This script provides easy access to different system functions:
- Start the main system
- Run the demo
- Validate configuration
- Show system status
"""

import asyncio
import sys
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from core.config import config
from loguru import logger


def print_banner():
    """Print the system banner."""
    print("=" * 70)
    print("🚀 Aegis Multi-Agent AI System")
    print("=" * 70)
    print(f"Version: {config.app_version}")
    print(f"Environment: {config.environment}")
    print("=" * 70)


def print_menu():
    """Print the main menu."""
    print("\nAvailable Commands:")
    print("  1. start     - Start the main system")
    print("  2. demo      - Run the demo")
    print("  3. validate  - Validate configuration")
    print("  4. status    - Show system status")
    print("  5. help      - Show this help")
    print("  6. exit      - Exit the program")
    print()


async def start_system():
    """Start the main system."""
    try:
        from main import AegisSystem
        
        print("Starting Aegis Multi-Agent AI System...")
        system = AegisSystem()
        
        # Run the system
        success = await system.run()
        
        if success:
            print("System completed successfully")
        else:
            print("System failed")
            
    except Exception as e:
        logger.error(f"Failed to start system: {e}")
        print(f"Error: {e}")


async def run_demo():
    """Run the demo."""
    try:
        from demo import AegisDemo
        
        print("Starting demo...")
        demo = AegisDemo()
        
        success = await demo.run_demo()
        
        if success:
            print("Demo completed successfully!")
        else:
            print("Demo failed!")
            
    except Exception as e:
        logger.error(f"Failed to run demo: {e}")
        print(f"Error: {e}")


async def validate_config():
    """Validate the configuration."""
    try:
        print("Validating configuration...")
        
        # Check required services
        required_services = ["redis", "neo4j", "chroma", "gemini"]
        validation_results = {}
        
        for service in required_services:
            is_valid = config.validate_connection(service)
            validation_results[service] = is_valid
            status = "✓" if is_valid else "✗"
            print(f"  {service}: {status}")
        
        # Check if critical services are available
        critical_services = ["redis", "gemini"]
        critical_failures = [service for service in critical_services if not validation_results.get(service, False)]
        
        if critical_failures:
            print(f"\n❌ Critical services failed validation: {critical_failures}")
            if config.is_production():
                print("Cannot continue in production mode")
                return False
            else:
                print("⚠️  Continuing in development mode with validation failures")
        else:
            print("\n✅ Configuration validation passed")
        
        return True
        
    except Exception as e:
        logger.error(f"Configuration validation error: {e}")
        print(f"Error: {e}")
        return False


async def show_status():
    """Show system status."""
    try:
        from core.agent_orchestrator import orchestrator
        
        print("Getting system status...")
        
        # Check if orchestrator is running
        if orchestrator.is_running:
            status = orchestrator.get_system_status()
            
            print("\nSystem Status:")
            print(f"  Orchestrator: {status['orchestrator']['status']}")
            print(f"  Active Agents: {status['agents']['total']}")
            print(f"  Active Workflows: {status['workflows']['active']}")
            print(f"  Total Events: {status['events']['total_events']}")
            print(f"  System Health: {status['performance']['system_health']}")
            
        else:
            print("System is not running")
            
    except Exception as e:
        logger.error(f"Failed to get system status: {e}")
        print(f"Error: {e}")


def show_help():
    """Show help information."""
    print("\nAegis Multi-Agent AI System Help")
    print("=" * 40)
    print("This system provides blockchain security through AI agents.")
    print("\nCommands:")
    print("  start     - Start the main system (requires Redis, Neo4j, ChromaDB)")
    print("  demo      - Run a demonstration of the system")
    print("  validate  - Check if all required services are available")
    print("  status    - Show current system status")
    print("  help      - Show this help message")
    print("  exit      - Exit the program")
    print("\nPrerequisites:")
    print("  - Redis server running")
    print("  - Neo4j database running")
    print("  - ChromaDB running")
    print("  - Gemini API key configured")
    print("\nConfiguration:")
    print("  - Copy env.template to .env")
    print("  - Fill in your API keys and service URLs")
    print("  - Ensure all required services are running")


async def main():
    """Main interactive loop."""
    print_banner()
    
    while True:
        try:
            print_menu()
            command = input("Enter command: ").strip().lower()
            
            if command == "start":
                await start_system()
                
            elif command == "demo":
                await run_demo()
                
            elif command == "validate":
                await validate_config()
                
            elif command == "status":
                await show_status()
                
            elif command == "help":
                show_help()
                
            elif command == "exit":
                print("Goodbye!")
                break
                
            else:
                print(f"Unknown command: {command}")
                print("Type 'help' for available commands")
            
            input("\nPress Enter to continue...")
            
        except KeyboardInterrupt:
            print("\n\nInterrupted by user")
            break
            
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            print(f"Unexpected error: {e}")
            input("\nPress Enter to continue...")


if __name__ == "__main__":
    try:
        # Run the interactive startup script
        asyncio.run(main())
        
    except KeyboardInterrupt:
        print("\nGoodbye!")
        sys.exit(0)
        
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        print(f"Fatal error: {e}")
        sys.exit(1)
