import os
import json
from typing import Dict, Any, List, Optional
import numpy as np
import joblib
from app.config import settings
from app.core.logging import logger
from app.services.feature_service import feature_service

class DetectionService:
    def __init__(self):
        self.model_payload: Optional[Dict[str, Any]] = None
        self.metrics_metadata: Optional[Dict[str, Any]] = None
        self._load_artifacts()

    def _load_artifacts(self):
        model_path = os.path.join(settings.MODEL_DIR, "model.joblib")
        metrics_path = os.path.join(settings.MODEL_DIR, "metrics.json")

        if os.path.exists(model_path):
            try:
                self.model_payload = joblib.load(model_path)
                logger.info("Successfully loaded ML model artifact: %s", self.model_payload.get("model_name"))
            except Exception as e:
                logger.error("Error loading model artifact: %s", str(e))
                self.model_payload = None

        if os.path.exists(metrics_path):
            try:
                with open(metrics_path, "r") as f:
                    self.metrics_metadata = json.load(f)
            except Exception as e:
                logger.error("Error loading metrics artifact: %s", str(e))
                self.metrics_metadata = None

    def is_operational(self) -> bool:
        return self.model_payload is not None

    def get_model_info(self) -> Dict[str, Any]:
        if not self.model_payload:
            return {
                "model_name": "Unavailable",
                "model_version": "N/A",
                "status": "not_loaded"
            }
        return {
            "model_name": self.model_payload.get("model_name", "XGBoost"),
            "model_version": self.model_payload.get("model_version", "2.0.0"),
            "trained_at": self.model_payload.get("trained_at"),
            "status": "operational"
        }

    def get_metrics(self) -> Optional[Dict[str, Any]]:
        return self.metrics_metadata

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        if not self.model_payload:
            # Fallback heuristic if ML model artifact missing
            logger.warning("ML Model artifact missing; invoking heuristic fallback")
            prob = 0.85 if features.get("suspicious_keyword_count", 0) > 0 or features.get("has_ip") else 0.1
            return {
                "model_name": "Heuristic Rule Engine (Fallback)",
                "model_version": "1.0.0",
                "probability": prob,
                "prediction": "phishing" if prob > 0.5 else "legitimate",
                "feature_contributions": {}
            }

        model = self.model_payload["model"]
        scaler = self.model_payload["scaler"]
        use_scaled = self.model_payload.get("use_scaled", False)
        feature_names = self.model_payload["feature_names"]

        vector = feature_service.get_feature_vector(features)
        X = np.array([vector])

        if use_scaled:
            X_input = scaler.transform(X)
        else:
            X_input = X

        # Predict probability
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_input)[0]
            phishing_prob = float(probs[1])
        else:
            pred = model.predict(X_input)[0]
            phishing_prob = float(pred)

        prediction_label = "phishing" if phishing_prob >= 0.50 else "legitimate"

        # Calculate sample-specific feature contributions
        feature_contributions = {}
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            # Weight importance by whether the feature value is active / high
            for i, name in enumerate(feature_names):
                val = vector[i]
                if val > 0:
                    weight = round(float(importances[i] * min(val, 5.0)), 4)
                    if weight > 0.001:
                        feature_contributions[name] = weight

        return {
            "model_name": self.model_payload.get("model_name", "XGBoost"),
            "model_version": self.model_payload.get("model_version", "2.0.0"),
            "probability": round(phishing_prob, 4),
            "prediction": prediction_label,
            "feature_contributions": feature_contributions
        }

detection_service = DetectionService()
