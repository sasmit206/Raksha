from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

from sqlalchemy.types import TypeDecorator, String
from app.services.crypto_service import encrypt_text, decrypt_text

class EncryptedString(TypeDecorator):
    impl = String
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            return encrypt_text(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            try:
                return decrypt_text(value)
            except Exception:
                return value # Fallback for unencrypted legacy data
        return value


class Experiment(Base):
    __tablename__ = "experiments"
    
    id = Column(String, primary_key=True, index=True)
    scenario = Column(String, index=True)
    status = Column(String, default="Draft") # Draft, Ready, Running, Completed, Failed
    started_at = Column(DateTime, default=datetime.utcnow)
    duration = Column(Integer)
    events_count = Column(Integer, default=0)
    anomalies_count = Column(Integer, default=0)
    risk_score = Column(Integer, default=0)
    is_demo = Column(Boolean, default=False)
    
    telemetry_events = relationship("TelemetryEvent", back_populates="experiment")
    anomalies = relationship("Anomaly", back_populates="experiment")
    patterns = relationship("Pattern", back_populates="experiment")

class TelemetryEvent(Base):
    __tablename__ = "telemetry_events"
    
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"))
    vm_id = Column(String, index=True)
    source = Column(String, index=True) # AUTH, PROCESS, FILE, PRIVILEGE, NETWORK
    event_type = Column(String)
    severity = Column(String) # low, medium, high, critical
    user = Column(String)
    process = Column(String)
    pid = Column(Integer)
    resource = Column(String)
    action = Column(String)
    raw_event = Column(EncryptedString)
    anomaly_score = Column(Float, default=0.0)
    
    experiment = relationship("Experiment", back_populates="telemetry_events")
    
class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"))
    title = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    anomaly_score = Column(Float)
    vm_id = Column(String)
    source = Column(String)
    event_count = Column(Integer)
    confidence = Column(Float)
    status = Column(String, default="New") # New, Investigating, Confirmed, Dismissed, Resolved
    
    experiment = relationship("Experiment", back_populates="anomalies")

class Pattern(Base):
    __tablename__ = "patterns"
    
    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"))
    name = Column(String)
    confidence = Column(Float)
    risk_level = Column(String) # LOW, MODERATE, HIGH, CRITICAL
    evidence_count = Column(Integer)
    time_window_seconds = Column(Integer)
    
    experiment = relationship("Experiment", back_populates="patterns")

class Recommendation(Base):
    __tablename__ = "recommendations"
    
    id = Column(String, primary_key=True, index=True)
    experiment_id = Column(String, ForeignKey("experiments.id"))
    title = Column(String)
    reason = Column(String)
    priority = Column(String)
    control_category = Column(String)
    status = Column(String, default="Pending") # Pending, Implemented, Dismissed

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user_id = Column(String, ForeignKey("users.id"))
    action = Column(String)
    ip_address = Column(String)
    details = Column(EncryptedString, nullable=True)
