from fastapi import APIRouter, Depends, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import csv
import io

from app.db.database import get_db
from app.db.models import User
from app.schemas.scan import BatchScanRequest, BatchScanResponse, BatchScanItemResult, ScanRequest
from app.schemas.common import ApiResponse
from app.core.dependencies import get_current_user_optional
from app.api.scans import create_scan

router = APIRouter(prefix="/batch-scan", tags=["Batch Scanner"])

@router.post("", response_model=ApiResponse[BatchScanResponse])
async def batch_scan_urls(
    req: BatchScanRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Enforce batch size limit
    clean_urls = list(dict.fromkeys([u.strip() for u in req.urls if u.strip()]))[:50]
    results: List[BatchScanItemResult] = []

    for url in clean_urls:
        try:
            res = await create_scan(ScanRequest(url=url), request, db, current_user)
            if res.success and res.data:
                d = res.data
                results.append(BatchScanItemResult(
                    url=url,
                    risk_score=d.risk_score,
                    verdict=d.verdict,
                    confidence=d.confidence,
                    model_name=d.model_name
                ))
            else:
                results.append(BatchScanItemResult(
                    url=url,
                    risk_score=0.0,
                    verdict="ERROR",
                    confidence=0.0,
                    model_name="N/A",
                    error=res.error.message if res.error else "Processing failed"
                ))
        except Exception as e:
            results.append(BatchScanItemResult(
                url=url,
                risk_score=0.0,
                verdict="ERROR",
                confidence=0.0,
                model_name="N/A",
                error=str(e)
            ))

    return ApiResponse.ok(BatchScanResponse(
        total_submitted=len(req.urls),
        total_processed=len(results),
        results=results
    ))

@router.post("/upload", response_model=ApiResponse[BatchScanResponse])
async def upload_batch_file(
    file: UploadFile = File(...),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    if not file.filename.endswith((".csv", ".txt")):
        return ApiResponse.fail(code="INVALID_FILE_TYPE", message="Only .csv and .txt files are supported.")

    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    
    urls = []
    if file.filename.endswith(".csv"):
        reader = csv.reader(io.StringIO(text))
        for row in reader:
            if row and row[0].strip():
                # Ignore header row if present
                if row[0].strip().lower() in ["url", "link", "urls"]:
                    continue
                urls.append(row[0].strip())
    else:
        for line in text.splitlines():
            clean = line.strip()
            if clean:
                urls.append(clean)

    # Process batch
    req = BatchScanRequest(urls=urls[:50])
    return await batch_scan_urls(req, request, db, current_user)
