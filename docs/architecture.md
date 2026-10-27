# PhishGuard AI — System Architecture

## Overview

PhishGuard AI separates concerns into decoupled layers to guarantee security, modularity, and high-performance inference:

```text
               ┌──────────────────────────────┐
               │    Next.js 16 Client App     │
               │   (React, Tailwind, Recharts)│
               └──────────────┬───────────────┘
                              │ REST JSON API
                              ▼
               ┌──────────────────────────────┐
               │       FastAPI Gateway        │
               │  (Security Headers, Logging) │
               └──────────────┬───────────────┘
                              │
     ┌────────────────────────┼────────────────────────┐
     ▼                        ▼                        ▼
┌──────────────┐       ┌──────────────┐         ┌──────────────┐
│  URL Service │       │   Features   │         │ Auth & Audit │
│ (SSRF Guard) │       │   (26 Extr.) │         │ (Bcrypt/JWT) │
└──────────────┘       └──────┬───────┘         └──────┬───────┘
                              │                        │
                              ▼                        ▼
                       ┌──────────────┐         ┌──────────────┐
                       │   ML Model   │         │  SQLAlchemy  │
                       │   (XGBoost)  │         │ (PostgreSQL/ │
                       └──────┬───────┘         │   SQLite)    │
                              │                 └──────────────┘
                              ▼
                       ┌──────────────┐
                       │ Risk Engine  │
                       │ & AI Explain │
                       └──────────────┘
```

## Layers

### 1. Presentation Layer (Frontend)
- **Framework**: Next.js 16 with App Router and Server Components.
- **Styling**: Tailwind CSS with dark-mode cybersecurity SaaS aesthetics.
- **Data Visualization**: Recharts for live risk distributions and 7-day scan telemetry.
- **State & Communication**: Strongly typed REST client (`@/lib/api.ts`).

### 2. API Gateway & Middleware (Backend)
- **Framework**: FastAPI (Python 3.11+ / 3.14 compatible).
- **Security Middleware**: Auto-appends `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and CORS controls.
- **Structured Logging**: JSON formatter logging `request_id`, status, and latency while preventing password/token leakage.

### 3. Core Domain Services
- **`URLService`**: Validates schemes, normalizes format, and prevents SSRF to local or cloud metadata IPs.
- **`FeatureService`**: Computes 26 structural and behavioral features.
- **`DetectionService`**: Manages model lifecycle and calculates feature importances.
- **`RiskService`**: Calibrates final risk scores (0–100) and dictates security actions.
- **`AIService`**: Synthesizes human-friendly narrative grounded exclusively in empirical evidence.
- **`ThreatService`**: Clean provider abstraction with degraded offline mode.
