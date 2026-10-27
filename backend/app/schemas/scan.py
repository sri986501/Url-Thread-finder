from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any

class ScanRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048, description="URL to scan")

class RiskFactor(BaseModel):
    title: str
    severity: str  # "INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"
    description: str
    impact_score: float

class ExtractedFeaturesSchema(BaseModel):
    url_length: int
    domain_length: int
    path_length: int
    query_length: int
    fragment_length: int
    digit_count: int
    letter_count: int
    special_character_count: int
    dot_count: int
    hyphen_count: int
    underscore_count: int
    slash_count: int
    question_mark_count: int
    equals_count: int
    ampersand_count: int
    percent_count: int
    at_count: int
    subdomain_count: int
    query_param_count: int
    url_entropy: float
    has_ip: bool
    has_https: bool
    has_punycode: bool
    is_shortened: bool
    suspicious_keyword_count: int
    suspicious_tld: bool

class PredictionDetailSchema(BaseModel):
    model_name: str
    model_version: str
    probability: float
    prediction: str
    feature_contributions: Optional[Dict[str, float]] = None

class ThreatIntelligenceSchema(BaseModel):
    provider: str
    status: str
    reputation: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ScanDetailResponse(BaseModel):
    id: str
    original_url: str
    normalized_url: str
    risk_score: float
    verdict: str
    confidence: float
    model_name: str
    model_version: str
    ai_explanation: Optional[str] = None
    recommended_action: Optional[str] = None
    risk_factors: List[RiskFactor] = []
    features: Optional[ExtractedFeaturesSchema] = None
    prediction: Optional[PredictionDetailSchema] = None
    threat_intelligence: Optional[ThreatIntelligenceSchema] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ScanListItem(BaseModel):
    id: str
    original_url: str
    normalized_url: str
    risk_score: float
    verdict: str
    confidence: float
    model_name: str
    created_at: datetime

class PaginatedScansResponse(BaseModel):
    items: List[ScanListItem]
    total: int
    page: int
    page_size: int
    total_pages: int

class CompareRequest(BaseModel):
    url_a: str = Field(..., min_length=3, max_length=2048)
    url_b: str = Field(..., min_length=3, max_length=2048)

class CompareResponse(BaseModel):
    url_a_result: ScanDetailResponse
    url_b_result: ScanDetailResponse
    risk_difference: float
    summary: str

class BatchScanRequest(BaseModel):
    urls: List[str] = Field(..., min_length=1, max_length=100)

class BatchScanItemResult(BaseModel):
    url: str
    risk_score: float
    verdict: str
    confidence: float
    model_name: str
    error: Optional[str] = None

class BatchScanResponse(BaseModel):
    total_submitted: int
    total_processed: int
    results: List[BatchScanItemResult]
