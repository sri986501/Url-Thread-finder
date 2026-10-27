from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class OverviewMetrics(BaseModel):
    total_scans: int
    threats_detected: int
    high_risk_scans: int
    detection_rate_pct: float
    average_risk_score: float

class VerdictDistributionItem(BaseModel):
    verdict: str
    count: int
    percentage: float

class TrendPoint(BaseModel):
    date: str
    total_scans: int
    threats: int
    safe: int

class RiskDistributionBucket(BaseModel):
    range: str
    count: int

class TopRiskIndicator(BaseModel):
    indicator: str
    count: int
    percentage: float

class ModelMetrics(BaseModel):
    model_name: str
    model_version: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float
    evaluated_at: str
    training_sample_size: int

class AnalyticsSummaryResponse(BaseModel):
    overview: OverviewMetrics
    verdict_distribution: List[VerdictDistributionItem]
    recent_trend: List[TrendPoint]
    risk_distribution: List[RiskDistributionBucket]
    top_indicators: List[TopRiskIndicator]
    current_model: Optional[ModelMetrics] = None

class AdminSystemStatus(BaseModel):
    api: str = "operational"
    database: str = "operational"
    ml_engine: str = "operational"
    ai_explanation: str = "operational"
    threat_intel: str = "degraded"
    uptime_seconds: float
