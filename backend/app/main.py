import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.logging import logger
from app.core.security import hash_password
from app.db.database import engine, Base, SessionLocal
from app.db.models import User, Scan, ScanFeatures, Prediction, ThreatIntelligence
from app.api.auth import router as auth_router
from app.api.scans import router as scans_router
from app.api.history import router as history_router
from app.api.analytics import router as analytics_router
from app.api.compare import router as compare_router
from app.api.batch import router as batch_router
from app.api.admin import router as admin_router
from app.api.health import router as health_router

def init_db_and_seed():
    """Create tables and seed initial admin credentials if fresh database."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == "admin@phishguard.ai").first()
        if not admin:
            admin = User(
                name="Security Administrator",
                email="admin@phishguard.ai",
                password_hash=hash_password("AdminSecurePass2026!"),
                role="ADMIN"
            )
            db.add(admin)
            db.commit()
            logger.info("Created default administrator user: admin@phishguard.ai")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing PhishGuard AI backend services...")
    init_db_and_seed()
    yield
    logger.info("Shutting down PhishGuard AI services.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Explainable AI-Powered Phishing URL Detection & Threat Intelligence Platform",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured Logging & Performance & Security Headers Middleware
@app.middleware("http")
async def security_and_logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    
    # Process request
    response = await call_next(request)
    
    latency_ms = round((time.time() - start_time) * 1000, 2)
    
    # Inject Security Headers (Section 31)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Log request event safely
    logger.info(
        f"{request.method} {request.url.path} -> {response.status_code} ({latency_ms}ms)",
        extra={
            "request_id": request_id,
            "endpoint": request.url.path,
            "status_code": response.status_code,
            "latency_ms": latency_ms
        }
    )
    
    return response

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please contact the security team if the problem persists."
            }
        }
    )

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(scans_router, prefix=settings.API_V1_STR)
app.include_router(history_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(compare_router, prefix=settings.API_V1_STR)
app.include_router(batch_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)
app.include_router(health_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs"
    }
