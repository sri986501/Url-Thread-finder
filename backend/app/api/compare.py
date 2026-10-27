from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.scan import CompareRequest, CompareResponse, ScanDetailResponse
from app.schemas.common import ApiResponse
from app.api.scans import create_scan, ScanRequest
from app.core.dependencies import get_current_user_optional
from app.db.models import User
from typing import Optional

router = APIRouter(prefix="/compare", tags=["URL Comparison"])

@router.post("", response_model=ApiResponse[CompareResponse])
async def compare_urls(
    req: CompareRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Scan URL A
    res_a = await create_scan(ScanRequest(url=req.url_a), request, db, current_user)
    if not res_a.success or not res_a.data:
        return ApiResponse.fail(code="SCAN_A_FAILED", message=f"Failed to scan URL A: {res_a.error.message if res_a.error else 'Unknown error'}")

    # Scan URL B
    res_b = await create_scan(ScanRequest(url=req.url_b), request, db, current_user)
    if not res_b.success or not res_b.data:
        return ApiResponse.fail(code="SCAN_B_FAILED", message=f"Failed to scan URL B: {res_b.error.message if res_b.error else 'Unknown error'}")

    scan_a = res_a.data
    scan_b = res_b.data

    diff = round(abs(scan_a.risk_score - scan_b.risk_score), 1)
    
    higher_risk = "URL A" if scan_a.risk_score > scan_b.risk_score else "URL B"
    summary = (
        f"URL Comparison completed with a risk divergence of {diff} points. "
        f"{higher_risk} exhibits substantially elevated threat indicators ({max(scan_a.risk_score, scan_b.risk_score)} vs {min(scan_a.risk_score, scan_b.risk_score)}). "
        f"Key distinctions stem from domain composition, authentication keyword presence, and host signals."
    )

    return ApiResponse.ok(CompareResponse(
        url_a_result=scan_a,
        url_b_result=scan_b,
        risk_difference=diff,
        summary=summary
    ))
