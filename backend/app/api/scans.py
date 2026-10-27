from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
import json
from typing import Optional

from app.db.database import get_db
from app.db.models import Scan, ScanFeatures, Prediction, ThreatIntelligence, User, AuditLog
from app.schemas.scan import ScanRequest, ScanDetailResponse, ExtractedFeaturesSchema, PredictionDetailSchema, ThreatIntelligenceSchema, RiskFactor
from app.schemas.common import ApiResponse
from app.core.dependencies import get_current_user_optional
from app.services.url_service import url_service, URLValidationError
from app.services.feature_service import feature_service
from app.services.detection_service import detection_service
from app.services.threat_service import threat_service
from app.services.risk_service import risk_service
from app.services.ai_service import ai_service
from app.core.logging import logger

router = APIRouter(prefix="/scans", tags=["Scans"])

@router.post("", response_model=ApiResponse[ScanDetailResponse])
async def create_scan(
    req: ScanRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    try:
        normalized_url = url_service.validate_and_normalize(req.url)
    except URLValidationError as e:
        return ApiResponse.fail(code=e.code, message=e.message)
    except Exception as e:
        logger.error("URL validation unexpected error: %s", str(e))
        return ApiResponse.fail(code="INVALID_URL", message="The provided URL is invalid or malformed.")

    # 1. Feature Extraction
    features = feature_service.extract_features(normalized_url)
    evidence = feature_service.explain_feature_evidence(features)

    # 2. ML Prediction
    prediction = detection_service.predict(features)

    # 3. Threat Intelligence Signal
    hostname = features.get("_hostname", "")
    threat_intel = await threat_service.check_domain(hostname)

    # 4. Risk Engine
    risk_score, verdict, confidence, recommended_action = risk_service.calculate_risk(
        ml_prediction=prediction,
        features=features,
        threat_intel=threat_intel,
        evidence_list=evidence
    )

    # 5. AI Explanation
    explanation = ai_service.generate_explanation(
        url=normalized_url,
        verdict=verdict,
        risk_score=risk_score,
        confidence=confidence,
        risk_factors=evidence
    )

    # 6. Database Persistence
    user_id = current_user.id if current_user else None
    scan = Scan(
        user_id=user_id,
        original_url=req.url,
        normalized_url=normalized_url,
        risk_score=risk_score,
        verdict=verdict,
        confidence=confidence,
        model_name=prediction["model_name"],
        model_version=prediction["model_version"],
        ai_explanation=explanation,
        recommended_action=recommended_action
    )
    db.add(scan)
    db.flush()

    # Save features
    scan_features = ScanFeatures(
        scan_id=scan.id,
        url_length=features["url_length"],
        domain_length=features["domain_length"],
        path_length=features["path_length"],
        query_length=features["query_length"],
        fragment_length=features["fragment_length"],
        digit_count=features["digit_count"],
        letter_count=features["letter_count"],
        special_character_count=features["special_character_count"],
        dot_count=features["dot_count"],
        hyphen_count=features["hyphen_count"],
        underscore_count=features["underscore_count"],
        slash_count=features["slash_count"],
        question_mark_count=features["question_mark_count"],
        equals_count=features["equals_count"],
        ampersand_count=features["ampersand_count"],
        percent_count=features["percent_count"],
        at_count=features["at_count"],
        subdomain_count=features["subdomain_count"],
        query_param_count=features["query_param_count"],
        url_entropy=features["url_entropy"],
        has_ip=features["has_ip"],
        has_https=features["has_https"],
        has_punycode=features["has_punycode"],
        is_shortened=features["is_shortened"],
        suspicious_keyword_count=features["suspicious_keyword_count"],
        suspicious_tld=features["suspicious_tld"],
        top_risk_factors_json=json.dumps(evidence)
    )
    db.add(scan_features)

    # Save prediction
    pred_record = Prediction(
        scan_id=scan.id,
        model_name=prediction["model_name"],
        model_version=prediction["model_version"],
        probability=prediction["probability"],
        prediction=prediction["prediction"],
        raw_scores_json=json.dumps(prediction.get("feature_contributions", {}))
    )
    db.add(pred_record)

    # Save threat intelligence
    ti_record = ThreatIntelligence(
        scan_id=scan.id,
        provider=threat_intel["provider"],
        status=threat_intel["status"],
        reputation=threat_intel.get("reputation"),
        metadata_json=json.dumps(threat_intel.get("metadata", {}))
    )
    db.add(ti_record)

    # Audit log
    audit = AuditLog(
        user_id=user_id,
        action="SCAN_CREATED",
        resource_type="Scan",
        resource_id=scan.id,
        metadata_json=json.dumps({"verdict": verdict, "risk_score": risk_score}),
        ip_address=request.client.host if request.client else None
    )
    db.add(audit)
    db.commit()
    db.refresh(scan)

    # Construct response
    risk_factor_models = [RiskFactor(**item) for item in evidence]
    feature_schema = ExtractedFeaturesSchema(**{k: v for k, v in features.items() if not k.startswith("_")})
    pred_schema = PredictionDetailSchema(
        model_name=prediction["model_name"],
        model_version=prediction["model_version"],
        probability=prediction["probability"],
        prediction=prediction["prediction"],
        feature_contributions=prediction.get("feature_contributions")
    )
    ti_schema = ThreatIntelligenceSchema(
        provider=threat_intel["provider"],
        status=threat_intel["status"],
        reputation=threat_intel.get("reputation"),
        metadata=threat_intel.get("metadata")
    )

    response_data = ScanDetailResponse(
        id=scan.id,
        original_url=scan.original_url,
        normalized_url=scan.normalized_url,
        risk_score=scan.risk_score,
        verdict=scan.verdict,
        confidence=scan.confidence,
        model_name=scan.model_name,
        model_version=scan.model_version,
        ai_explanation=scan.ai_explanation,
        recommended_action=scan.recommended_action,
        risk_factors=risk_factor_models,
        features=feature_schema,
        prediction=pred_schema,
        threat_intelligence=ti_schema,
        created_at=scan.created_at
    )

    return ApiResponse.ok(response_data)

@router.get("/{id}", response_model=ApiResponse[ScanDetailResponse])
def get_scan_by_id(id: str, db: Session = Depends(get_db)):
    scan = db.query(Scan).filter(Scan.id == id).first()
    if not scan:
        return ApiResponse.fail(code="SCAN_NOT_FOUND", message="Security scan report not found.")

    risk_factors = []
    if scan.features and scan.features.top_risk_factors_json:
        try:
            raw_factors = json.loads(scan.features.top_risk_factors_json)
            risk_factors = [RiskFactor(**rf) for rf in raw_factors]
        except Exception:
            risk_factors = []

    feature_schema = None
    if scan.features:
        f = scan.features
        feature_schema = ExtractedFeaturesSchema(
            url_length=f.url_length,
            domain_length=f.domain_length,
            path_length=f.path_length,
            query_length=f.query_length,
            fragment_length=f.fragment_length,
            digit_count=f.digit_count,
            letter_count=f.letter_count,
            special_character_count=f.special_character_count,
            dot_count=f.dot_count,
            hyphen_count=f.hyphen_count,
            underscore_count=f.underscore_count,
            slash_count=f.slash_count,
            question_mark_count=f.question_mark_count,
            equals_count=f.equals_count,
            ampersand_count=f.ampersand_count,
            percent_count=f.percent_count,
            at_count=f.at_count,
            subdomain_count=f.subdomain_count,
            query_param_count=f.query_param_count,
            url_entropy=f.url_entropy,
            has_ip=f.has_ip,
            has_https=f.has_https,
            has_punycode=f.has_punycode,
            is_shortened=f.is_shortened,
            suspicious_keyword_count=f.suspicious_keyword_count,
            suspicious_tld=f.suspicious_tld
        )

    pred_schema = None
    if scan.prediction:
        p = scan.prediction
        contributions = json.loads(p.raw_scores_json) if p.raw_scores_json else None
        pred_schema = PredictionDetailSchema(
            model_name=p.model_name,
            model_version=p.model_version,
            probability=p.probability,
            prediction=p.prediction,
            feature_contributions=contributions
        )

    ti_schema = None
    if scan.threat_intelligence:
        ti = scan.threat_intelligence
        meta = json.loads(ti.metadata_json) if ti.metadata_json else None
        ti_schema = ThreatIntelligenceSchema(
            provider=ti.provider,
            status=ti.status,
            reputation=ti.reputation,
            metadata=meta
        )

    response_data = ScanDetailResponse(
        id=scan.id,
        original_url=scan.original_url,
        normalized_url=scan.normalized_url,
        risk_score=scan.risk_score,
        verdict=scan.verdict,
        confidence=scan.confidence,
        model_name=scan.model_name,
        model_version=scan.model_version,
        ai_explanation=scan.ai_explanation,
        recommended_action=scan.recommended_action,
        risk_factors=risk_factors,
        features=feature_schema,
        prediction=pred_schema,
        threat_intelligence=ti_schema,
        created_at=scan.created_at
    )
    return ApiResponse.ok(response_data)
