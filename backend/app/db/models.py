import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime,
    ForeignKey, Text, Index
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="USER", nullable=False)  # "USER" or "ADMIN"
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    original_url = Column(Text, nullable=False)
    normalized_url = Column(Text, nullable=False)
    risk_score = Column(Float, nullable=False, index=True)  # 0 to 100
    verdict = Column(String(30), nullable=False, index=True)  # SAFE, LOW_RISK, SUSPICIOUS, HIGH_RISK, CRITICAL
    confidence = Column(Float, nullable=False)  # 0.0 to 1.0
    model_name = Column(String(50), nullable=False)
    model_version = Column(String(50), nullable=False)
    ai_explanation = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)

    user = relationship("User", back_populates="scans")
    features = relationship("ScanFeatures", back_populates="scan", uselist=False, cascade="all, delete-orphan")
    prediction = relationship("Prediction", back_populates="scan", uselist=False, cascade="all, delete-orphan")
    threat_intelligence = relationship("ThreatIntelligence", back_populates="scan", uselist=False, cascade="all, delete-orphan")

class ScanFeatures(Base):
    __tablename__ = "features"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    
    # Lexical / Structural
    url_length = Column(Integer, nullable=False)
    domain_length = Column(Integer, nullable=False)
    path_length = Column(Integer, nullable=False)
    query_length = Column(Integer, nullable=False)
    fragment_length = Column(Integer, nullable=False)
    
    # Counts
    digit_count = Column(Integer, nullable=False)
    letter_count = Column(Integer, nullable=False)
    special_character_count = Column(Integer, nullable=False)
    dot_count = Column(Integer, nullable=False)
    hyphen_count = Column(Integer, nullable=False)
    underscore_count = Column(Integer, nullable=False)
    slash_count = Column(Integer, nullable=False)
    question_mark_count = Column(Integer, nullable=False)
    equals_count = Column(Integer, nullable=False)
    ampersand_count = Column(Integer, nullable=False)
    percent_count = Column(Integer, nullable=False)
    at_count = Column(Integer, nullable=False)
    subdomain_count = Column(Integer, nullable=False)
    query_param_count = Column(Integer, nullable=False)
    
    # Advanced Signals
    url_entropy = Column(Float, nullable=False)
    has_ip = Column(Boolean, nullable=False, default=False)
    has_https = Column(Boolean, nullable=False, default=True)
    has_punycode = Column(Boolean, nullable=False, default=False)
    is_shortened = Column(Boolean, nullable=False, default=False)
    suspicious_keyword_count = Column(Integer, nullable=False, default=0)
    suspicious_tld = Column(Boolean, nullable=False, default=False)
    
    # Serialization of extracted keyword list & detailed factors
    top_risk_factors_json = Column(Text, nullable=True)

    scan = relationship("Scan", back_populates="features")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    model_name = Column(String(50), nullable=False)
    model_version = Column(String(50), nullable=False)
    probability = Column(Float, nullable=False)
    prediction = Column(String(30), nullable=False)  # "phishing" or "legitimate"
    raw_scores_json = Column(Text, nullable=True)  # feature contributions / SHAP values
    created_at = Column(DateTime, default=utc_now, nullable=False)

    scan = relationship("Scan", back_populates="prediction")

class ThreatIntelligence(Base):
    __tablename__ = "threat_intelligence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    provider = Column(String(50), nullable=False)
    status = Column(String(30), nullable=False)  # "operational", "unavailable", "clean", "malicious"
    reputation = Column(String(50), nullable=True)
    metadata_json = Column(Text, nullable=True)
    checked_at = Column(DateTime, default=utc_now, nullable=False)

    scan = relationship("Scan", back_populates="threat_intelligence")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(50), nullable=False, index=True)  # USER_LOGIN, SCAN_CREATED, MODEL_CHANGED, etc.
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(50), nullable=True)
    metadata_json = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False, index=True)

    user = relationship("User", back_populates="audit_logs")

# Composite index for search & analytics
Index("idx_scans_user_created", Scan.user_id, Scan.created_at.desc())
Index("idx_scans_verdict_created", Scan.verdict, Scan.created_at.desc())
Index("idx_audit_action_created", AuditLog.action, AuditLog.created_at.desc())
