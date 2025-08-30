"""
Blockchain event models for the Aegis Multi-Agent AI System.

This module defines the data structures for blockchain events that are
monitored, processed, and analyzed by the AI agents.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
from pydantic import BaseModel, Field, validator
import hashlib


class EventType(str, Enum):
    """Types of blockchain events that can be monitored."""
    TRANSACTION = "transaction"
    BLOCK = "block"
    CONTRACT_EVENT = "contract_event"
    LIQUIDATION = "liquidation"
    PRICE_FEED = "price_feed"
    GOVERNANCE = "governance"
    BRIDGE = "bridge"
    SWAP = "swap"
    LIQUIDITY = "liquidity"
    REWARD = "reward"
    PENALTY = "penalty"
    EMERGENCY = "emergency"


class EventPriority(str, Enum):
    """Priority levels for event processing."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class EventStatus(str, Enum):
    """Status of event processing."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    ESCALATED = "escalated"


class EventMetadata(BaseModel):
    """Additional metadata for blockchain events."""
    gas_price: Optional[str] = None
    gas_limit: Optional[int] = None
    nonce: Optional[int] = None
    block_number: Optional[int] = None
    block_hash: Optional[str] = None
    transaction_index: Optional[int] = None
    confirmations: Optional[int] = None
    fee: Optional[str] = None
    method_signature: Optional[str] = None
    input_data: Optional[str] = None
    logs: Optional[List[Dict[str, Any]]] = None
    trace: Optional[Dict[str, Any]] = None
    mempool_position: Optional[int] = None
    replacement_underpriced: Optional[bool] = None
    custom_fields: Dict[str, Any] = Field(default_factory=dict)


class BlockchainEvent(BaseModel):
    """Core blockchain event model."""
    
    # Event identification
    id: str = Field(..., description="Unique event identifier")
    type: EventType = Field(..., description="Type of blockchain event")
    chain_id: int = Field(..., description="Chain ID where event occurred")
    hash: str = Field(..., description="Transaction or block hash")
    
    # Event details
    from_address: Optional[str] = Field(None, description="Source address")
    to_address: Optional[str] = Field(None, description="Destination address")
    contract_address: Optional[str] = Field(None, description="Contract address if applicable")
    value: Optional[str] = Field(None, description="Value transferred (in wei)")
    data: Optional[str] = Field(None, description="Transaction data or event data")
    
    # Timing and status
    timestamp: datetime = Field(..., description="Event timestamp")
    block_timestamp: Optional[datetime] = Field(None, description="Block timestamp")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Event creation time")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update time")
    
    # Processing metadata
    priority: EventPriority = Field(default=EventPriority.MEDIUM, description="Processing priority")
    status: EventStatus = Field(default=EventStatus.PENDING, description="Processing status")
    metadata: EventMetadata = Field(default_factory=EventMetadata, description="Additional metadata")
    
    # Risk and analysis
    risk_score: float = Field(default=0.0, description="Initial risk score (0-100)")
    confidence: float = Field(default=0.0, description="Confidence in event data (0-1)")
    tags: List[str] = Field(default_factory=list, description="Event tags for categorization")
    
    # Cross-chain information
    cross_chain: bool = Field(default=False, description="Whether this is a cross-chain event")
    related_events: List[str] = Field(default_factory=list, description="Related event IDs")
    bridge_protocol: Optional[str] = Field(None, description="Bridge protocol if applicable")
    
    # Agent processing
    processed_by: List[str] = Field(default_factory=list, description="Agents that have processed this event")
    processing_history: List[Dict[str, Any]] = Field(default_factory=list, description="Processing history")
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
    @validator('id', pre=True, always=True)
    def generate_id(cls, v, values):
        """Generate event ID if not provided."""
        if v:
            return v
        
        # Generate ID from hash and chain_id
        if 'hash' in values and 'chain_id' in values:
            return f"{values['chain_id']}_{values['hash'][:16]}"
        
        # Fallback to timestamp-based ID
        return f"event_{datetime.utcnow().timestamp()}"
    
    @validator('risk_score')
    def validate_risk_score(cls, v):
        """Validate risk score is between 0 and 100."""
        if not 0 <= v <= 100:
            raise ValueError("Risk score must be between 0 and 100")
        return v
    
    @validator('confidence')
    def validate_confidence(cls, v):
        """Validate confidence is between 0 and 1."""
        if not 0 <= v <= 1:
            raise ValueError("Confidence must be between 0 and 1")
        return v
    
    def add_processing_step(self, agent_name: str, step: str, result: Any = None):
        """Add a processing step to the event history."""
        self.processing_history.append({
            "timestamp": datetime.utcnow().isoformat(),
            "agent": agent_name,
            "step": step,
            "result": result
        })
        self.processed_by.append(agent_name)
        self.updated_at = datetime.utcnow()
    
    def update_status(self, status: EventStatus):
        """Update event status."""
        self.status = status
        self.updated_at = datetime.utcnow()
    
    def update_risk_score(self, new_score: float, reason: str = None):
        """Update risk score with reason."""
        old_score = self.risk_score
        self.risk_score = new_score
        
        if reason:
            self.add_processing_step(
                "risk_engine",
                "risk_score_update",
                {
                    "old_score": old_score,
                    "new_score": new_score,
                    "reason": reason
                }
            )
    
    def is_high_priority(self) -> bool:
        """Check if event is high priority."""
        return self.priority in [EventPriority.HIGH, EventPriority.CRITICAL, EventPriority.EMERGENCY]
    
    def is_cross_chain(self) -> bool:
        """Check if event involves cross-chain operations."""
        return self.cross_chain or self.bridge_protocol is not None
    
    def get_processing_time(self) -> float:
        """Get total processing time in seconds."""
        if self.status == EventStatus.COMPLETED:
            return (self.updated_at - self.created_at).total_seconds()
        return (datetime.utcnow() - self.created_at).total_seconds()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert event to dictionary."""
        return self.dict()
    
    def to_json(self) -> str:
        """Convert event to JSON string."""
        return self.json()
    
    def __hash__(self):
        """Make event hashable for set operations."""
        return hash(self.id)
    
    def __eq__(self, other):
        """Compare events by ID."""
        if not isinstance(other, BlockchainEvent):
            return False
        return self.id == other.id


class EventBatch(BaseModel):
    """Batch of blockchain events for processing."""
    batch_id: str = Field(..., description="Unique batch identifier")
    events: List[BlockchainEvent] = Field(..., description="Events in the batch")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Batch creation time")
    priority: EventPriority = Field(default=EventPriority.MEDIUM, description="Batch priority")
    source_chain: Optional[int] = Field(None, description="Source chain for batch")
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
    @validator('batch_id', pre=True, always=True)
    def generate_batch_id(cls, v):
        """Generate batch ID if not provided."""
        if v:
            return v
        return f"batch_{datetime.utcnow().timestamp()}"
    
    def add_event(self, event: BlockchainEvent):
        """Add event to batch."""
        self.events.append(event)
    
    def remove_event(self, event_id: str):
        """Remove event from batch by ID."""
        self.events = [e for e in self.events if e.id != event_id]
    
    def get_high_priority_events(self) -> List[BlockchainEvent]:
        """Get high priority events from batch."""
        return [e for e in self.events if e.is_high_priority()]
    
    def get_events_by_type(self, event_type: EventType) -> List[BlockchainEvent]:
        """Get events by type."""
        return [e for e in self.events if e.type == event_type]
    
    def get_total_value(self) -> str:
        """Get total value of all events in batch."""
        total = 0
        for event in self.events:
            if event.value:
                try:
                    total += int(event.value)
                except (ValueError, TypeError):
                    continue
        return str(total)
    
    def get_average_risk_score(self) -> float:
        """Get average risk score of events in batch."""
        if not self.events:
            return 0.0
        return sum(e.risk_score for e in self.events) / len(self.events)
    
    def __len__(self):
        """Return number of events in batch."""
        return len(self.events)
    
    def __iter__(self):
        """Iterate over events in batch."""
        return iter(self.events)
