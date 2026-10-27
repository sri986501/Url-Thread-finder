from typing import Dict, Any, List, Tuple
from app.core.logging import logger

class RiskService:
    @classmethod
    def calculate_risk(
        cls,
        ml_prediction: Dict[str, Any],
        features: Dict[str, Any],
        threat_intel: Dict[str, Any],
        evidence_list: List[Dict[str, Any]]
    ) -> Tuple[float, str, float, str]:
        """
        Calibrates risk score (0-100), maps verdict, computes confidence,
        and generates actionable security recommendations.
        """
        prob = ml_prediction.get("probability", 0.0)
        
        # Base risk from ML model (0-100 scale)
        base_ml_risk = prob * 100.0

        # Feature heuristics booster (ensures critical signals like IP or @ delimiter are reflected)
        heuristic_boost = 0.0
        if features.get("has_ip"):
            heuristic_boost += 25.0
        if features.get("at_count", 0) > 0:
            heuristic_boost += 20.0
        if features.get("suspicious_keyword_count", 0) >= 2:
            heuristic_boost += 15.0
        if features.get("is_shortened"):
            heuristic_boost += 10.0
        if features.get("suspicious_tld"):
            heuristic_boost += 10.0

        # Calibrated risk score blending ML confidence and structural flags
        raw_risk = (base_ml_risk * 0.75) + (heuristic_boost * 0.25)
        
        # Hard floor / ceiling protections for clear extremes
        if features.get("has_ip") or (features.get("suspicious_keyword_count", 0) >= 2 and not features.get("has_https")):
            raw_risk = max(raw_risk, 75.0)

        risk_score = round(min(100.0, max(0.0, raw_risk)), 1)

        # Verdict Categorization (Section 11)
        # 0–20     SAFE
        # 21–40    LOW RISK
        # 41–60    SUSPICIOUS
        # 61–80    HIGH RISK
        # 81–100   CRITICAL
        if risk_score <= 20.0:
            verdict = "SAFE"
            recommended_action = "This link exhibits legitimate structure and indicators. Standard browsing caution applies."
        elif risk_score <= 40.0:
            verdict = "LOW_RISK"
            recommended_action = "Low risk detected. Verify the website domain matches your expectations before logging in."
        elif risk_score <= 60.0:
            verdict = "SUSPICIOUS"
            recommended_action = "Suspicious signals observed. Exercise caution. Do not enter credentials or download unexpected files."
        elif risk_score <= 80.0:
            verdict = "HIGH_RISK"
            recommended_action = "High risk indicators found. Avoid entering passwords, payment details, or personal information."
        else:
            verdict = "CRITICAL"
            recommended_action = "Critical threat detected. Do not visit this site or interact with its components under any circumstances."

        # Model confidence calculation (distance from decision boundary 0.50)
        confidence = round(float(abs(prob - 0.5) * 2.0 * 0.2 + 0.8), 2)
        confidence = min(0.99, max(0.70, confidence))

        return risk_score, verdict, confidence, recommended_action

risk_service = RiskService()
