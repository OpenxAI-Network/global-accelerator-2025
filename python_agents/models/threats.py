"""
Threat analysis models for the Aegis Multi-Agent AI System.

This module defines the data structures for threat detection, analysis,
and risk assessment used by the AI agents.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List, Union
from enum import Enum
from pydantic import BaseModel, Field, validator
import json


class ThreatType(str, Enum):
    """Types of threats that can be detected."""
    NONE = "none"
    RUG_PULL = "rug_pull"
    PHISHING = "phishing"
    EXPLOIT = "exploit"
    WASH_TRADE = "wash_trade"
    FRONTRUNNING = "frontrunning"
    MEV_ATTACK = "mev_attack"
    LIQUIDATION = "liquidation"
    FLASH_LOAN = "flash_loan"
    REENTRANCY = "reentrancy"
    OVERFLOW = "overflow"
    UNDERFLOW = "underflow"
    ACCESS_CONTROL = "access_control"
    LOGIC_ERROR = "logic_error"
    ORACLE_MANIPULATION = "oracle_manipulation"
    ECONOMIC_ATTACK = "economic_attack"
    NETWORK_ATTACK = "network_attack"
    ANOMALY = "anomaly"
    SUSPICIOUS = "suspicious"
    UNKNOWN = "unknown"


class ThreatLevel(str, Enum):
    """Threat severity levels."""
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class RiskScore(BaseModel):
    """Risk scoring model."""
    overall_score: float = Field(..., description="Overall risk score (0-100)")
    threat_score: float = Field(..., description="Threat-specific risk score (0-100)")
    confidence_score: float = Field(..., description="Confidence in assessment (0-1)")
    volatility_score: float = Field(..., description="Market volatility impact (0-100)")
    historical_score: float = Field(..., description="Historical risk patterns (0-100)")
    network_score: float = Field(..., description="Network-specific risks (0-100)")
    
    # Weighted components
    weights: Dict[str, float] = Field(default_factory=lambda: {
        "threat": 0.4,
        "volatility": 0.2,
        "historical": 0.2,
        "network": 0.1,
        "confidence": 0.1
    })
    
    class Config:
        """Pydantic configuration."""
        validate_assignment = True
    
    @validator('overall_score', 'threat_score', 'volatility_score', 'historical_score', 'network_score')
    def validate_scores(cls, v):
        """Validate scores are between 0 and 100."""
        if not 0 <= v <= 100:
            raise ValueError("Risk scores must be between 0 and 100")
        return v
    
    @validator('confidence_score')
    def validate_confidence(cls, v):
        """Validate confidence is between 0 and 1."""
        if not 0 <= v <= 1:
            raise ValueError("Confidence must be between 0 and 1")
        return v
    
    def calculate_weighted_score(self) -> float:
        """Calculate weighted risk score."""
        weighted_sum = (
            self.threat_score * self.weights["threat"] +
            self.volatility_score * self.weights["volatility"] +
            self.historical_score * self.weights["historical"] +
            self.network_score * self.weights["network"] +
            self.confidence_score * 100 * self.weights["confidence"]
        )
        self.overall_score = min(100, max(0, weighted_sum))
        return self.overall_score
    
    def get_risk_level(self) -> ThreatLevel:
        """Get threat level based on overall score."""
        if self.overall_score >= 90:
            return ThreatLevel.EMERGENCY
        elif self.overall_score >= 80:
            return ThreatLevel.CRITICAL
        elif self.overall_score >= 60:
            return ThreatLevel.HIGH
        elif self.overall_score >= 40:
            return ThreatLevel.MEDIUM
        elif self.overall_score >= 20:
            return ThreatLevel.LOW
        else:
            return ThreatLevel.INFO
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "overall_score": self.overall_score,
            "threat_score": self.threat_score,
            "confidence_score": self.confidence_score,
            "volatility_score": self.volatility_score,
            "historical_score": self.historical_score,
            "network_score": self.network_score,
            "risk_level": self.get_risk_level().value,
            "weights": self.weights
        }


class ThreatEvidence(BaseModel):
    """Evidence supporting threat detection."""
    evidence_type: str = Field(..., description="Type of evidence")
    description: str = Field(..., description="Evidence description")
    confidence: float = Field(..., description="Confidence in evidence (0-1)")
    source: str = Field(..., description="Source of evidence")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Evidence timestamp")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
    
    class Config:
        """Pydantic configuration."""
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
    @validator('confidence')
    def validate_confidence(cls, v):
        """Validate confidence is between 0 and 1."""
        if not 0 <= v <= 1:
            raise ValueError("Confidence must be between 0 and 1")
        return v


class ThreatPattern(BaseModel):
    """Pattern for threat detection."""
    pattern_id: str = Field(..., description="Unique pattern identifier")
    name: str = Field(..., description="Pattern name")
    description: str = Field(..., description="Pattern description")
    threat_type: ThreatType = Field(..., description="Type of threat this pattern detects")
    risk_level: ThreatLevel = Field(..., description="Risk level of this pattern")
    
    # Pattern matching
    signatures: List[str] = Field(default_factory=list, description="Pattern signatures")
    conditions: List[Dict[str, Any]] = Field(default_factory=list, description="Matching conditions")
    thresholds: Dict[str, Union[int, float, str]] = Field(default_factory=dict, description="Detection thresholds")
    
    # AI and ML
    ml_model: Optional[str] = Field(None, description="ML model used for detection")
    training_data: Optional[str] = Field(None, description="Training data source")
    accuracy: float = Field(default=0.0, description="Pattern accuracy (0-1)")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Pattern creation time")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update time")
    version: str = Field(default="1.0.0", description="Pattern version")
    tags: List[str] = Field(default_factory=list, description="Pattern tags")
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
    @validator('accuracy')
    def validate_accuracy(cls, v):
        """Validate accuracy is between 0 and 1."""
        if not 0 <= v <= 1:
            raise ValueError("Accuracy must be between 0 and 1")
        return v
    
    def add_signature(self, signature: str):
        """Add a new signature to the pattern."""
        if signature not in self.signatures:
            self.signatures.append(signature)
            self.updated_at = datetime.utcnow()
    
    def add_condition(self, condition: Dict[str, Any]):
        """Add a new matching condition."""
        self.conditions.append(condition)
        self.updated_at = datetime.utcnow()
    
    def update_threshold(self, key: str, value: Union[int, float, str]):
        """Update a detection threshold."""
        self.thresholds[key] = value
        self.updated_at = datetime.utcnow()
    
    def matches_event(self, event_data: Dict[str, Any]) -> bool:
        """Check if an event matches this pattern."""
        # Basic signature matching
        for signature in self.signatures:
            if signature in str(event_data):
                return True
        
        # Condition matching
        for condition in self.conditions:
            if not self._evaluate_condition(condition, event_data):
                return False
        
        return True
    
    def _evaluate_condition(self, condition: Dict[str, Any], event_data: Dict[str, Any]) -> bool:
        """Evaluate a single condition against event data."""
        field = condition.get("field")
        operator = condition.get("operator")
        value = condition.get("value")
        
        if field not in event_data:
            return False
        
        event_value = event_data[field]
        
        if operator == "equals":
            return event_value == value
        elif operator == "not_equals":
            return event_value != value
        elif operator == "greater_than":
            return float(event_value) > float(value)
        elif operator == "less_than":
            return float(event_value) < float(value)
        elif operator == "contains":
            return str(value) in str(event_value)
        elif operator == "regex":
            import re
            return bool(re.search(value, str(event_value)))
        
        return False


class ThreatAnalysis(BaseModel):
    """Comprehensive threat analysis result."""
    
    # Analysis identification
    analysis_id: str = Field(..., description="Unique analysis identifier")
    event_id: str = Field(..., description="Associated event ID")
    agent_id: str = Field(..., description="Agent that performed analysis")
    
    # Threat assessment
    threat_type: ThreatType = Field(default=ThreatType.NONE, description="Detected threat type")
    threat_level: ThreatLevel = Field(default=ThreatLevel.INFO, description="Threat severity level")
    risk_score: RiskScore = Field(..., description="Risk assessment")
    
    # Analysis details
    confidence: float = Field(..., description="Confidence in analysis (0-1)")
    anomalies: List[str] = Field(default_factory=list, description="Detected anomalies")
    predicted_impact: str = Field(default="low", description="Predicted impact level")
    urgency: int = Field(default=0, description="Urgency level (0-100)")
    
    # Evidence and reasoning
    evidence: List[ThreatEvidence] = Field(default_factory=list, description="Supporting evidence")
    reasoning: str = Field(..., description="AI reasoning for threat detection")
    patterns_matched: List[str] = Field(default_factory=list, description="Matched threat patterns")
    
    # Recommendations
    actions: List[str] = Field(default_factory=list, description="Recommended actions")
    mitigation_strategies: List[str] = Field(default_factory=list, description="Mitigation strategies")
    prevention_tips: List[str] = Field(default_factory=list, description="Prevention tips")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Analysis creation time")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update time")
    processing_time: float = Field(default=0.0, description="Analysis processing time (seconds)")
    
    # AI model information
    model_used: str = Field(..., description="AI model used for analysis")
    model_version: str = Field(default="1.0.0", description="Model version")
    prompt_used: Optional[str] = Field(None, description="Prompt used for analysis")
    
    class Config:
        """Pydantic configuration."""
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
    
    @validator('confidence')
    def validate_confidence(cls, v):
        """Validate confidence is between 0 and 1."""
        if not 0 <= v <= 1:
            raise ValueError("Confidence must be between 0 and 1")
        return v
    
    @validator('urgency')
    def validate_urgency(cls, v):
        """Validate urgency is between 0 and 100."""
        if not 0 <= v <= 100:
            raise ValueError("Urgency must be between 0 and 100")
        return v
    
    def add_evidence(self, evidence: ThreatEvidence):
        """Add evidence to the analysis."""
        self.evidence.append(evidence)
        self.updated_at = datetime.utcnow()
    
    def add_anomaly(self, anomaly: str):
        """Add an anomaly to the analysis."""
        if anomaly not in self.anomalies:
            self.anomalies.append(anomaly)
            self.updated_at = datetime.utcnow()
    
    def add_action(self, action: str):
        """Add a recommended action."""
        if action not in self.actions:
            self.actions.append(action)
            self.updated_at = datetime.utcnow()
    
    def update_confidence(self, new_confidence: float, reason: str = None):
        """Update confidence level with reason."""
        old_confidence = self.confidence
        self.confidence = new_confidence
        
        if reason:
            self.add_evidence(ThreatEvidence(
                evidence_type="confidence_update",
                description=f"Confidence updated from {old_confidence} to {new_confidence}: {reason}",
                confidence=new_confidence,
                source="confidence_engine"
            ))
        
        self.updated_at = datetime.utcnow()
    
    def is_critical(self) -> bool:
        """Check if threat is critical."""
        return self.threat_level in [ThreatLevel.CRITICAL, ThreatLevel.EMERGENCY]
    
    def is_high_urgency(self) -> bool:
        """Check if threat requires immediate attention."""
        return self.urgency >= 80
    
    def get_risk_summary(self) -> Dict[str, Any]:
        """Get summary of risk assessment."""
        return {
            "threat_type": self.threat_type.value,
            "threat_level": self.threat_level.value,
            "risk_score": self.risk_score.overall_score,
            "confidence": self.confidence,
            "urgency": self.urgency,
            "is_critical": self.is_critical(),
            "is_high_urgency": self.is_high_urgency()
        }
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert analysis to dictionary."""
        return {
            "analysis_id": self.analysis_id,
            "event_id": self.event_id,
            "agent_id": self.agent_id,
            "threat_type": self.threat_type.value,
            "threat_level": self.threat_level.value,
            "risk_score": self.risk_score.to_dict(),
            "confidence": self.confidence,
            "anomalies": self.anomalies,
            "predicted_impact": self.predicted_impact,
            "urgency": self.urgency,
            "evidence": [e.dict() for e in self.evidence],
            "reasoning": self.reasoning,
            "patterns_matched": self.patterns_matched,
            "actions": self.actions,
            "mitigation_strategies": self.mitigation_strategies,
            "prevention_tips": self.prevention_tips,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "processing_time": self.processing_time,
            "model_used": self.model_used,
            "model_version": self.model_version
        }
    
    def to_json(self) -> str:
        """Convert analysis to JSON string."""
        return json.dumps(self.to_dict(), indent=2)
