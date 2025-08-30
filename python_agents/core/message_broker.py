"""
Redis message broker for the Aegis Multi-Agent AI System.

This module provides a robust message broker using Redis for inter-agent
communication, including pub/sub, priority queues, and persistent storage.
"""

import asyncio
import json
import time
from typing import Optional, Dict, Any, List, Callable, Union
from datetime import datetime
import aioredis
from loguru import logger
import uuid

from models.events import BlockchainEvent, EventPriority
from models.threats import ThreatAnalysis
from models.actions import SecurityAction


class MessageBroker:
    """
    Redis-based message broker for agent communication.
    
    Features:
    - Pub/Sub for real-time messaging
    - Priority queues for critical events
    - Persistent storage for message durability
    - Message acknowledgment and retry logic
    - Load balancing across multiple agents
    """
    
    def __init__(
        self,
        redis_url: str = "redis://localhost:6379",
        max_retries: int = 3,
        retry_delay: float = 1.0,
        max_queue_size: int = 10000
    ):
        """Initialize the message broker."""
        self.redis_url = redis_url
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.max_queue_size = max_queue_size
        
        # Redis connections
        self.redis: Optional[aioredis.Redis] = None
        self.pubsub: Optional[aioredis.client.PubSub] = None
        
        # Message handlers
        self.handlers: Dict[str, List[Callable]] = {}
        self.subscriptions: Dict[str, asyncio.Task] = {}
        
        # Queue management
        self.processing_queues: Dict[str, asyncio.Queue] = {}
        self.priority_queues: Dict[str, asyncio.PriorityQueue] = {}
        
        # Statistics
        self.stats = {
            "messages_sent": 0,
            "messages_received": 0,
            "messages_processed": 0,
            "messages_failed": 0,
            "queue_sizes": {}
        }
        
        # Health monitoring
        self.is_healthy = False
        self.last_heartbeat = 0
        self.heartbeat_interval = 30  # seconds
    
    async def connect(self) -> bool:
        """Connect to Redis and initialize the broker."""
        try:
            self.redis = aioredis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                max_connections=20
            )
            
            # Test connection
            await self.redis.ping()
            
            # Initialize pub/sub
            self.pubsub = self.redis.pubsub()
            
            # Initialize queues
            await self._initialize_queues()
            
            # Start health monitoring
            asyncio.create_task(self._health_monitor())
            
            self.is_healthy = True
            logger.info("Message broker connected successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.is_healthy = False
            return False
    
    async def disconnect(self):
        """Disconnect from Redis and cleanup."""
        try:
            if self.pubsub:
                await self.pubsub.close()
            
            if self.redis:
                await self.redis.close()
            
            # Cancel all subscriptions
            for task in self.subscriptions.values():
                task.cancel()
            
            self.is_healthy = False
            logger.info("Message broker disconnected")
            
        except Exception as e:
            logger.error(f"Error during disconnect: {e}")
    
    async def _initialize_queues(self):
        """Initialize Redis queues and streams."""
        try:
            # Create priority queues for different event types
            queue_names = [
                "events:critical",
                "events:high", 
                "events:medium",
                "events:low",
                "threats:analysis",
                "actions:security",
                "system:health"
            ]
            
            for queue_name in queue_names:
                # Ensure queue exists
                await self.redis.xgroup_create(
                    f"stream:{queue_name}",
                    "agents",
                    id="0",
                    mkstream=True
                )
                
                # Initialize local priority queues
                self.priority_queues[queue_name] = asyncio.PriorityQueue(maxsize=self.max_queue_size)
                
                # Start queue processors
                asyncio.create_task(self._process_queue(queue_name))
            
            logger.info("Message broker queues initialized")
            
        except Exception as e:
            logger.error(f"Failed to initialize queues: {e}")
            raise
    
    async def publish(
        self,
        channel: str,
        message: Union[Dict[str, Any], BlockchainEvent, ThreatAnalysis, SecurityAction],
        priority: EventPriority = EventPriority.MEDIUM
    ) -> bool:
        """Publish a message to a channel."""
        try:
            if not self.is_healthy:
                logger.warning("Message broker not healthy, cannot publish")
                return False
            
            # Prepare message
            message_data = self._prepare_message(message, priority)
            message_id = str(uuid.uuid4())
            
            # Add to Redis stream
            stream_key = f"stream:{channel}"
            await self.redis.xadd(
                stream_key,
                {
                    "id": message_id,
                    "data": json.dumps(message_data),
                    "timestamp": str(int(time.time())),
                    "priority": priority.value
                }
            )
            
            # Also publish to pub/sub for real-time delivery
            await self.redis.publish(channel, json.dumps(message_data))
            
            # Update statistics
            self.stats["messages_sent"] += 1
            
            logger.debug(f"Published message {message_id} to {channel}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to publish message to {channel}: {e}")
            self.stats["messages_failed"] += 1
            return False
    
    async def subscribe(
        self,
        channel: str,
        handler: Callable,
        priority: bool = False
    ) -> str:
        """Subscribe to a channel with a message handler."""
        try:
            subscription_id = str(uuid.uuid4())
            
            if priority:
                # Add to priority queue processing
                if channel not in self.priority_queues:
                    self.priority_queues[channel] = asyncio.PriorityQueue(maxsize=self.max_queue_size)
                
                # Start priority queue processor
                self.subscriptions[subscription_id] = asyncio.create_task(
                    self._process_priority_queue(channel, handler)
                )
            else:
                # Add to pub/sub subscription
                await self.pubsub.subscribe(channel)
                
                # Start pub/sub processor
                self.subscriptions[subscription_id] = asyncio.create_task(
                    self._process_pubsub(channel, handler)
                )
            
            # Register handler
            if channel not in self.handlers:
                self.handlers[channel] = []
            self.handlers[channel].append(handler)
            
            logger.info(f"Subscribed to {channel} with ID {subscription_id}")
            return subscription_id
            
        except Exception as e:
            logger.error(f"Failed to subscribe to {channel}: {e}")
            raise
    
    async def unsubscribe(self, subscription_id: str) -> bool:
        """Unsubscribe from a channel."""
        try:
            if subscription_id in self.subscriptions:
                task = self.subscriptions[subscription_id]
                task.cancel()
                del self.subscriptions[subscription_id]
                
                logger.info(f"Unsubscribed from {subscription_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to unsubscribe {subscription_id}: {e}")
            return False
    
    async def send_to_queue(
        self,
        queue_name: str,
        message: Union[Dict[str, Any], BlockchainEvent, ThreatAnalysis, SecurityAction],
        priority: int = 0
    ) -> bool:
        """Send a message to a specific queue with priority."""
        try:
            if queue_name not in self.priority_queues:
                logger.warning(f"Queue {queue_name} does not exist")
                return False
            
            # Prepare message
            message_data = self._prepare_message(message, EventPriority.MEDIUM)
            message_data["priority"] = priority
            message_data["timestamp"] = time.time()
            
            # Add to priority queue
            await self.priority_queues[queue_name].put((priority, message_data))
            
            # Update statistics
            self.stats["messages_sent"] += 1
            self.stats["queue_sizes"][queue_name] = self.priority_queues[queue_name].qsize()
            
            logger.debug(f"Added message to queue {queue_name} with priority {priority}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send message to queue {queue_name}: {e}")
            self.stats["messages_failed"] += 1
            return False
    
    async def _process_pubsub(self, channel: str, handler: Callable):
        """Process messages from pub/sub subscription."""
        try:
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    try:
                        # Parse message
                        data = json.loads(message["data"])
                        
                        # Update statistics
                        self.stats["messages_received"] += 1
                        
                        # Call handler
                        await self._call_handler(handler, data)
                        
                        # Update statistics
                        self.stats["messages_processed"] += 1
                        
                    except Exception as e:
                        logger.error(f"Error processing pub/sub message: {e}")
                        self.stats["messages_failed"] += 1
                        
        except asyncio.CancelledError:
            logger.info(f"Pub/sub processing cancelled for {channel}")
        except Exception as e:
            logger.error(f"Pub/sub processing error for {channel}: {e}")
    
    async def _process_priority_queue(self, queue_name: str, handler: Callable):
        """Process messages from priority queue."""
        try:
            while True:
                try:
                    # Get message from queue
                    priority, message_data = await self.priority_queues[queue_name].get()
                    
                    # Update statistics
                    self.stats["messages_received"] += 1
                    
                    # Call handler
                    await self._call_handler(handler, message_data)
                    
                    # Mark as processed
                    self.priority_queues[queue_name].task_done()
                    
                    # Update statistics
                    self.stats["messages_processed"] += 1
                    self.stats["queue_sizes"][queue_name] = self.priority_queues[queue_name].qsize()
                    
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"Error processing priority queue message: {e}")
                    self.stats["messages_failed"] += 1
                    
        except asyncio.CancelledError:
            logger.info(f"Priority queue processing cancelled for {queue_name}")
        except Exception as e:
            logger.error(f"Priority queue processing error for {queue_name}: {e}")
    
    async def _process_queue(self, queue_name: str):
        """Process messages from Redis stream queue."""
        try:
            while True:
                try:
                    # Read from Redis stream
                    messages = await self.redis.xreadgroup(
                        "agents",
                        "worker",
                        {f"stream:{queue_name}": ">"},
                        count=10,
                        block=1000
                    )
                    
                    for stream, stream_messages in messages:
                        for message_id, fields in stream_messages:
                            try:
                                # Parse message
                                data = json.loads(fields["data"])
                                priority = int(fields.get("priority", 0))
                                
                                # Add to local priority queue
                                await self.priority_queues[queue_name].put((priority, data))
                                
                                # Acknowledge message
                                await self.redis.xack(f"stream:{queue_name}", "agents", message_id)
                                
                            except Exception as e:
                                logger.error(f"Error processing stream message: {e}")
                    
                    await asyncio.sleep(0.1)  # Small delay to prevent busy waiting
                    
                except asyncio.CancelledError:
                    break
                except Exception as e:
                    logger.error(f"Error processing stream queue: {e}")
                    await asyncio.sleep(1)  # Delay on error
                    
        except asyncio.CancelledError:
            logger.info(f"Stream queue processing cancelled for {queue_name}")
        except Exception as e:
            logger.error(f"Stream queue processing error for {queue_name}: {e}")
    
    async def _call_handler(self, handler: Callable, message_data: Dict[str, Any]):
        """Call a message handler with error handling."""
        try:
            if asyncio.iscoroutinefunction(handler):
                await handler(message_data)
            else:
                handler(message_data)
                
        except Exception as e:
            logger.error(f"Handler error: {e}")
            raise
    
    def _prepare_message(self, message: Union[Dict[str, Any], BlockchainEvent, ThreatAnalysis, SecurityAction], priority: EventPriority) -> Dict[str, Any]:
        """Prepare a message for transmission."""
        if isinstance(message, (BlockchainEvent, ThreatAnalysis, SecurityAction)):
            message_data = message.dict()
        else:
            message_data = message
        
        # Add metadata
        message_data.update({
            "message_id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "priority": priority.value,
            "source": "message_broker"
        })
        
        return message_data
    
    async def _health_monitor(self):
        """Monitor broker health and statistics."""
        try:
            while True:
                try:
                    # Check Redis connection
                    if self.redis:
                        await self.redis.ping()
                        self.is_healthy = True
                        self.last_heartbeat = time.time()
                    else:
                        self.is_healthy = False
                    
                    # Update queue statistics
                    for queue_name, queue in self.priority_queues.items():
                        self.stats["queue_sizes"][queue_name] = queue.qsize()
                    
                    # Log statistics periodically
                    if int(time.time()) % 300 == 0:  # Every 5 minutes
                        logger.info(f"Message broker stats: {self.stats}")
                    
                    await asyncio.sleep(self.heartbeat_interval)
                    
                except Exception as e:
                    logger.error(f"Health monitor error: {e}")
                    self.is_healthy = False
                    await asyncio.sleep(5)  # Shorter delay on error
                    
        except asyncio.CancelledError:
            logger.info("Health monitor cancelled")
        except Exception as e:
            logger.error(f"Health monitor fatal error: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current broker statistics."""
        return {
            **self.stats,
            "is_healthy": self.is_healthy,
            "last_heartbeat": self.last_heartbeat,
            "active_subscriptions": len(self.subscriptions),
            "active_handlers": sum(len(handlers) for handlers in self.handlers.values())
        }
    
    def get_queue_size(self, queue_name: str) -> int:
        """Get current size of a specific queue."""
        if queue_name in self.priority_queues:
            return self.priority_queues[queue_name].qsize()
        return 0
    
    async def clear_queue(self, queue_name: str) -> bool:
        """Clear all messages from a specific queue."""
        try:
            if queue_name in self.priority_queues:
                # Clear local queue
                while not self.priority_queues[queue_name].empty():
                    try:
                        self.priority_queues[queue_name].get_nowait()
                        self.priority_queues[queue_name].task_done()
                    except asyncio.QueueEmpty:
                        break
                
                # Clear Redis stream
                stream_key = f"stream:{queue_name}"
                await self.redis.xdel(stream_key, "*")
                
                logger.info(f"Cleared queue {queue_name}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Failed to clear queue {queue_name}: {e}")
            return False
    
    async def wait_for_queue_empty(self, queue_name: str, timeout: float = 60.0) -> bool:
        """Wait for a queue to become empty."""
        try:
            if queue_name not in self.priority_queues:
                return False
            
            start_time = time.time()
            while not self.priority_queues[queue_name].empty():
                if time.time() - start_time > timeout:
                    return False
                await asyncio.sleep(0.1)
            
            return True
            
        except Exception as e:
            logger.error(f"Error waiting for queue {queue_name} to empty: {e}")
            return False
