import pytest
import os
import sys

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.url_service import url_service, URLValidationError
from app.services.feature_service import feature_service
from app.services.detection_service import detection_service
from app.services.risk_service import risk_service

def test_url_validation_normal():
    normalized = url_service.validate_and_normalize("google.com/search?q=test")
    assert normalized.startswith("https://")
    assert "google.com" in normalized

def test_url_validation_disallowed_schemes():
    with pytest.raises(URLValidationError):
        url_service.validate_and_normalize("javascript:alert(1)")

    with pytest.raises(URLValidationError):
        url_service.validate_and_normalize("file:///etc/passwd")

def test_url_validation_ssrf_prevention():
    with pytest.raises(URLValidationError):
        url_service.validate_and_normalize("http://127.0.0.1:8080/admin")

    with pytest.raises(URLValidationError):
        url_service.validate_and_normalize("http://169.254.169.254/latest/meta-data/")

    with pytest.raises(URLValidationError):
        url_service.validate_and_normalize("http://localhost:3000")

def test_feature_extraction():
    url = "https://paypal-security-update.account-verify.xyz/login.php?user=123"
    features = feature_service.extract_features(url)

    assert features["has_https"] is True
    assert features["suspicious_tld"] is True  # .xyz
    assert features["suspicious_keyword_count"] >= 2  # paypal, security, login, account
    assert features["dot_count"] >= 3
    assert features["url_entropy"] > 0

    vector = feature_service.get_feature_vector(features)
    assert len(vector) == len(feature_service.get_feature_names())

def test_model_inference():
    url = "http://192.168.1.50/paypal/login.htm"
    features = feature_service.extract_features(url)
    pred = detection_service.predict(features)

    assert "probability" in pred
    assert "prediction" in pred
    assert pred["model_name"] in ["XGBoost", "Heuristic Rule Engine (Fallback)"]

def test_risk_scoring():
    features = {
        "has_ip": True,
        "at_count": 1,
        "suspicious_keyword_count": 3,
        "is_shortened": False,
        "suspicious_tld": True,
        "has_https": False
    }
    pred = {"probability": 0.95}
    threat_intel = {"status": "unavailable"}
    evidence = [{"title": "Raw IP Hostname", "severity": "CRITICAL"}]

    risk_score, verdict, confidence, rec = risk_service.calculate_risk(
        pred, features, threat_intel, evidence
    )

    assert risk_score >= 70.0
    assert verdict in ["HIGH_RISK", "CRITICAL"]
    assert confidence > 0.8
