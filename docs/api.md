# PhishGuard AI — REST API Documentation

All API endpoints return JSON structured according to the standard envelope:
```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

## Authentication

### `POST /api/auth/register`
Creates a user account and returns JWT access token.
```json
{
  "name": "Jane Analyst",
  "email": "jane@enterprise.com",
  "password": "SecurePassword123!"
}
```

### `POST /api/auth/login`
Authenticates existing user and issues JWT.

### `GET /api/auth/me`
Retrieves currently authenticated user profile. Requires `Authorization: Bearer <token>`.

---

## URL Scanning

### `POST /api/scans`
Scans a target URL through the complete feature, ML, and risk engine pipeline.
```json
{
  "url": "http://paypal-verification-alert.xyz/login.php"
}
```
**Response**:
Includes `risk_score`, `verdict`, `confidence`, `risk_factors`, `features`, `prediction`, and `ai_explanation`.

### `GET /api/scans/{id}`
Retrieves a saved security report by ID.

---

## Analytics & Telemetry

### `GET /api/analytics/overview`
Retrieves aggregated statistics: total scans, threats detected, detection rate %, 7-day trend array, and champion ML model metrics.

---

## URL Comparison

### `POST /api/compare`
Compares two URLs side-by-side:
```json
{
  "url_a": "https://google.com/search?q=docs",
  "url_b": "http://google-verify-security-login.xyz/checkpoint"
}
```

---

## Batch Scanning

### `POST /api/batch-scan`
Analyzes an array of URLs (up to 50 items).

### `POST /api/batch-scan/upload`
Uploads a `.csv` or `.txt` file containing URLs.

---

## Health & Observability

### `GET /api/health`
System status, components (api, database, ml_engine, threat_intel), and uptime.

### `GET /api/health/ml`
ML engine status and current model evaluation metrics.
