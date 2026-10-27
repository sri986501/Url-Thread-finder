from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timezone
import csv
import io

from app.db.database import get_db
from app.db.models import Scan, User, AuditLog
from app.schemas.scan import PaginatedScansResponse, ScanListItem
from app.schemas.common import ApiResponse
from app.core.dependencies import get_current_user_optional, get_current_user

router = APIRouter(prefix="/history", tags=["Scan History"])

@router.get("", response_model=ApiResponse[PaginatedScansResponse])
def get_scan_history(
    search: Optional[str] = Query(None, description="Search URL"),
    verdict: Optional[str] = Query(None, description="Filter by verdict"),
    min_risk: Optional[float] = Query(None, ge=0, le=100),
    max_risk: Optional[float] = Query(None, ge=0, le=100),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at", pattern="^(created_at|risk_score|verdict)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Scan)

    # Filter to user if logged in and not admin, or allow public view of global scans if unauthenticated
    if current_user and current_user.role != "ADMIN":
        query = query.filter((Scan.user_id == current_user.id) | (Scan.user_id == None))

    if search:
        query = query.filter(Scan.normalized_url.ilike(f"%{search.strip()}%"))

    if verdict:
        query = query.filter(Scan.verdict == verdict.upper())

    if min_risk is not None:
        query = query.filter(Scan.risk_score >= min_risk)

    if max_risk is not None:
        query = query.filter(Scan.risk_score <= max_risk)

    total = query.count()

    # Sorting
    sort_column = getattr(Scan, sort_by)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Pagination
    items = query.offset((page - 1) * page_size).limit(page_size).all()
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1

    list_items = [
        ScanListItem(
            id=s.id,
            original_url=s.original_url,
            normalized_url=s.normalized_url,
            risk_score=s.risk_score,
            verdict=s.verdict,
            confidence=s.confidence,
            model_name=s.model_name,
            created_at=s.created_at
        ) for s in items
    ]

    return ApiResponse.ok(PaginatedScansResponse(
        items=list_items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    ))

@router.delete("/{id}", response_model=ApiResponse[dict])
def delete_scan(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    scan = db.query(Scan).filter(Scan.id == id).first()
    if not scan:
        return ApiResponse.fail(code="NOT_FOUND", message="Scan not found.")

    if current_user.role != "ADMIN" and scan.user_id != current_user.id:
        return ApiResponse.fail(code="FORBIDDEN", message="Permission denied to delete this scan.")

    db.delete(scan)
    db.commit()
    return ApiResponse.ok({"message": f"Scan {id} deleted successfully."})

@router.get("/export/csv")
def export_history_csv(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Scan).order_by(Scan.created_at.desc()).limit(1000)
    scans = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Original URL", "Normalized URL", "Risk Score", "Verdict", "Confidence", "Model", "Timestamp"])

    for s in scans:
        writer.writerow([
            s.id, s.original_url, s.normalized_url, s.risk_score,
            s.verdict, s.confidence, s.model_name, s.created_at.isoformat()
        ])

    return PlainTextResponse(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=phishguard_scans_export.csv"}
    )
