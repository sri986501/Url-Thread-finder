from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any

from app.db.database import get_db
from app.db.models import Scan, ScanFeatures
from app.schemas.analytics import (
    AnalyticsSummaryResponse, OverviewMetrics, VerdictDistributionItem,
    TrendPoint, RiskDistributionBucket, TopRiskIndicator, ModelMetrics
)
from app.schemas.common import ApiResponse
from app.services.detection_service import detection_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=ApiResponse[AnalyticsSummaryResponse])
def get_analytics_overview(db: Session = Depends(get_db)):
    total_scans = db.query(Scan).count()

    if total_scans == 0:
        # Clean empty state response
        metrics_meta = detection_service.get_metrics()
        current_model = None
        if metrics_meta:
            cm = metrics_meta.get("champion_metrics", {})
            current_model = ModelMetrics(
                model_name=metrics_meta.get("champion_model", "XGBoost"),
                model_version=metrics_meta.get("model_version", "2.0.0"),
                accuracy=cm.get("accuracy", 1.0),
                precision=cm.get("precision", 1.0),
                recall=cm.get("recall", 1.0),
                f1_score=cm.get("f1_score", 1.0),
                roc_auc=cm.get("roc_auc", 1.0),
                evaluated_at=metrics_meta.get("evaluated_at", datetime.now(timezone.utc).isoformat()),
                training_sample_size=metrics_meta.get("total_dataset_size", 0)
            )

        return ApiResponse.ok(AnalyticsSummaryResponse(
            overview=OverviewMetrics(
                total_scans=0,
                threats_detected=0,
                high_risk_scans=0,
                detection_rate_pct=0.0,
                average_risk_score=0.0
            ),
            verdict_distribution=[],
            recent_trend=[],
            risk_distribution=[
                RiskDistributionBucket(range="0-20 (Safe)", count=0),
                RiskDistributionBucket(range="21-40 (Low)", count=0),
                RiskDistributionBucket(range="41-60 (Suspicious)", count=0),
                RiskDistributionBucket(range="61-80 (High)", count=0),
                RiskDistributionBucket(range="81-100 (Critical)", count=0)
            ],
            top_indicators=[],
            current_model=current_model
        ))

    # Real Database aggregations
    threat_verdicts = ["SUSPICIOUS", "HIGH_RISK", "CRITICAL"]
    threats_detected = db.query(Scan).filter(Scan.verdict.in_(threat_verdicts)).count()
    high_risk_scans = db.query(Scan).filter(Scan.verdict.in_(["HIGH_RISK", "CRITICAL"])).count()
    avg_score = db.query(func.avg(Scan.risk_score)).scalar() or 0.0

    detection_rate_pct = round((threats_detected / total_scans) * 100.0, 1)

    # Verdict distribution
    verdict_rows = db.query(Scan.verdict, func.count(Scan.id)).group_by(Scan.verdict).all()
    verdict_dist = [
        VerdictDistributionItem(
            verdict=v,
            count=c,
            percentage=round((c / total_scans) * 100.0, 1)
        ) for v, c in verdict_rows
    ]

    # Risk buckets
    b_safe = db.query(Scan).filter(Scan.risk_score <= 20).count()
    b_low = db.query(Scan).filter(Scan.risk_score > 20, Scan.risk_score <= 40).count()
    b_sus = db.query(Scan).filter(Scan.risk_score > 40, Scan.risk_score <= 60).count()
    b_high = db.query(Scan).filter(Scan.risk_score > 60, Scan.risk_score <= 80).count()
    b_crit = db.query(Scan).filter(Scan.risk_score > 80).count()

    risk_dist = [
        RiskDistributionBucket(range="0-20 (Safe)", count=b_safe),
        RiskDistributionBucket(range="21-40 (Low)", count=b_low),
        RiskDistributionBucket(range="41-60 (Suspicious)", count=b_sus),
        RiskDistributionBucket(range="61-80 (High)", count=b_high),
        RiskDistributionBucket(range="81-100 (Critical)", count=b_crit)
    ]

    # Recent 7 days trend
    trend_points = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        day_label = day_start.strftime("%b %d")

        day_scans = db.query(Scan).filter(Scan.created_at >= day_start, Scan.created_at < day_end).count()
        day_threats = db.query(Scan).filter(
            Scan.created_at >= day_start,
            Scan.created_at < day_end,
            Scan.verdict.in_(threat_verdicts)
        ).count()

        trend_points.append(TrendPoint(
            date=day_label,
            total_scans=day_scans,
            threats=day_threats,
            safe=max(0, day_scans - day_threats)
        ))

    # Top risk indicators from ScanFeatures
    ip_count = db.query(ScanFeatures).filter(ScanFeatures.has_ip == True).count()
    at_count = db.query(ScanFeatures).filter(ScanFeatures.at_count > 0).count()
    kw_count = db.query(ScanFeatures).filter(ScanFeatures.suspicious_keyword_count > 0).count()
    short_count = db.query(ScanFeatures).filter(ScanFeatures.is_shortened == True).count()
    tld_count = db.query(ScanFeatures).filter(ScanFeatures.suspicious_tld == True).count()

    top_indicators = [
        TopRiskIndicator(indicator="Auth/Financial Keywords", count=kw_count, percentage=round((kw_count / total_scans) * 100, 1)),
        TopRiskIndicator(indicator="High-Risk Disposable TLD", count=tld_count, percentage=round((tld_count / total_scans) * 100, 1)),
        TopRiskIndicator(indicator="URL Shortener Masking", count=short_count, percentage=round((short_count / total_scans) * 100, 1)),
        TopRiskIndicator(indicator="Embedded '@' Symbol", count=at_count, percentage=round((at_count / total_scans) * 100, 1)),
        TopRiskIndicator(indicator="Raw IP Hostname", count=ip_count, percentage=round((ip_count / total_scans) * 100, 1)),
    ]

    # Model metrics
    metrics_meta = detection_service.get_metrics()
    current_model = None
    if metrics_meta:
        cm = metrics_meta.get("champion_metrics", {})
        current_model = ModelMetrics(
            model_name=metrics_meta.get("champion_model", "XGBoost"),
            model_version=metrics_meta.get("model_version", "2.0.0"),
            accuracy=cm.get("accuracy", 1.0),
            precision=cm.get("precision", 1.0),
            recall=cm.get("recall", 1.0),
            f1_score=cm.get("f1_score", 1.0),
            roc_auc=cm.get("roc_auc", 1.0),
            evaluated_at=metrics_meta.get("evaluated_at", datetime.now(timezone.utc).isoformat()),
            training_sample_size=metrics_meta.get("total_dataset_size", 0)
        )

    return ApiResponse.ok(AnalyticsSummaryResponse(
        overview=OverviewMetrics(
            total_scans=total_scans,
            threats_detected=threats_detected,
            high_risk_scans=high_risk_scans,
            detection_rate_pct=detection_rate_pct,
            average_risk_score=round(avg_score, 1)
        ),
        verdict_distribution=verdict_dist,
        recent_trend=trend_points,
        risk_distribution=risk_dist,
        top_indicators=top_indicators,
        current_model=current_model
    ))
