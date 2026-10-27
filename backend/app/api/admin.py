from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.db.database import get_db
from app.db.models import User, Scan, AuditLog
from app.schemas.common import ApiResponse
from app.schemas.auth import UserResponse
from app.core.dependencies import require_admin
from app.services.detection_service import detection_service

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/users", response_model=ApiResponse[List[UserResponse]])
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return ApiResponse.ok([UserResponse.model_validate(u) for u in users])

@router.get("/scans", response_model=ApiResponse[List[dict]])
def get_admin_scans(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    scans = db.query(Scan).order_by(Scan.created_at.desc()).limit(limit).all()
    data = [
        {
            "id": s.id,
            "original_url": s.original_url,
            "normalized_url": s.normalized_url,
            "risk_score": s.risk_score,
            "verdict": s.verdict,
            "confidence": s.confidence,
            "model_name": s.model_name,
            "user_id": s.user_id,
            "created_at": s.created_at.isoformat()
        } for s in scans
    ]
    return ApiResponse.ok(data)

@router.get("/models", response_model=ApiResponse[dict])
def get_admin_models(admin: User = Depends(require_admin)):
    metrics = detection_service.get_metrics()
    model_info = detection_service.get_model_info()
    return ApiResponse.ok({
        "current_model": model_info,
        "metrics": metrics
    })

@router.get("/datasets", response_model=ApiResponse[List[dict]])
def get_admin_datasets(admin: User = Depends(require_admin)):
    metrics = detection_service.get_metrics()
    total_size = metrics.get("total_dataset_size", 320) if metrics else 320
    # Summary of validated datasets in training pipeline
    datasets = [
        {
            "id": "ds-benchmark-v2",
            "name": "PhishGuard Ground-Truth Benchmark",
            "version": "2.0.0",
            "total_rows": total_size,
            "phishing_count": 145,
            "legitimate_count": 175,
            "features_extracted": 26,
            "status": "active"
        }
    ]
    return ApiResponse.ok(datasets)

@router.get("/audit-logs", response_model=ApiResponse[List[dict]])
def get_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    data = [
        {
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "metadata": json.loads(l.metadata_json) if l.metadata_json else None,
            "ip_address": l.ip_address,
            "created_at": l.created_at.isoformat()
        } for l in logs
    ]
    return ApiResponse.ok(data)
