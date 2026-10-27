import pytest
import os
import sys
from fastapi.testclient import TestClient

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app
from app.db.database import Base, engine

# Ensure tables are initialized for testing
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "components" in data["data"]

def test_scan_legitimate_url():
    response = client.post("/api/scans", json={"url": "https://www.wikipedia.org/wiki/Computer_security"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    scan = data["data"]
    assert scan["verdict"] in ["SAFE", "LOW_RISK"]
    assert scan["risk_score"] <= 40
    assert scan["confidence"] > 0.5
    assert "model_name" in scan

def test_scan_phishing_url():
    response = client.post("/api/scans", json={"url": "http://paypal-security-account-verification.xyz/login.php?cmd=update"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    scan = data["data"]
    assert scan["verdict"] in ["HIGH_RISK", "CRITICAL"]
    assert scan["risk_score"] >= 60

def test_scan_ssrf_blocked():
    response = client.post("/api/scans", json={"url": "http://127.0.0.1:8000/api/admin"})
    data = response.json()
    assert data["success"] is False
    assert data["error"]["code"] == "SSRF_BLOCKED"

def test_analytics_overview():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "overview" in data["data"]
    assert "current_model" in data["data"]

def test_compare_urls():
    payload = {
        "url_a": "https://www.google.com/search?q=docs",
        "url_b": "http://google-verify-security-login.xyz/checkpoint"
    }
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "risk_difference" in data["data"]
    assert data["data"]["risk_difference"] > 0
