import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "PhishGuard AI"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    # Database (supports sqlite:///./phishguard.db or postgresql://... via DATABASE_URL)
    DATABASE_URL: str = "sqlite:///./phishguard.db"
    
    # Security / Auth
    JWT_SECRET: str = "phishguard_super_secret_dev_key_change_in_prod_991827"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # External APIs (Optional - degraded offline mode if absent)
    AI_API_KEY: str = ""
    AI_PROVIDER: str = "mock"
    THREAT_INTELLIGENCE_API_KEY: str = ""
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    # App Settings
    DEMO_MODE: bool = False
    RATE_LIMIT_SCANS_PER_MINUTE: int = 60
    RATE_LIMIT_AUTH_PER_MINUTE: int = 15
    
    # ML Model directory
    MODEL_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "artifacts")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
