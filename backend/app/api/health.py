import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.db.database import get_db
from app.services.detection_service import detection_service
from app.services.threat_service import threat_service
from app.config import settings
from app.schemas.common import ApiResponse

router = APIRouter(prefix="/health", tags=["Observability & Health"])

SERVER_START_TIME = time.time()

@router.get("", response_model=ApiResponse[dict])
def get_system_health(db: Session = Depends(get_db)):
    # 1. Database check
    db_status = "operational"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "degraded"

    # 2. ML Engine check
    ml_status = "operational" if detection_service.is_operational() else "degraded"

    # 3. AI Service
    ai_status = "operational"

    # 4. Threat Intel
    ti_status = "operational" if settings.THREAT_INTELLIGENCE_API_KEY else "degraded (offline mode)"

    uptime_sec = round(time.time() - SERVER_START_TIME, 1)

    return ApiResponse.ok({
        "status": "healthy" if db_status == "operational" and ml_status == "operational" else "degraded",
        "components": {
            "api": "operational",
            "database": db_status,
            "ml_engine": ml_status,
            "ai_explanation": ai_status,
            "threat_intelligence": ti_status
        },
        "model_info": detection_service.get_model_info(),
        "uptime_seconds": uptime_sec,
        "version": settings.VERSION
    })

@router.get("/ml", response_model=ApiResponse[dict])
def get_ml_health():
    return ApiResponse.ok({
        "status": "operational" if detection_service.is_operational() else "unavailable",
        "model": detection_service.get_model_info(),
        "evaluation_metrics": detection_service.get_metrics()
    })
