# PhishGuard AI

> **Explainable, AI-Assisted Phishing URL Detection & Threat Intelligence Platform**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![XGBoost](https://img.shields.io/badge/ML-XGBoost%20Ensemble-orange?style=flat)](https://xgboost.readthedocs.io/)
[![TailwindCSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

PhishGuard AI is an enterprise-grade, explainable cybersecurity web application designed to analyze, score, and explain suspicious URL threats before they become security incidents.

---

## 🎯 Core Architectural Philosophy

**The LLM is NOT the primary classifier.** 
Rather than delegating probabilistic security verdicts to a generative language model, PhishGuard AI implements an authoritative, defense-in-depth pipeline:

```text
URL Input
   ↓
URL Normalization & SSRF Defense (Blocks RFC1918 / Metadata)
   ↓
Lexical & Host Feature Extraction (26 features)
   ↓
XGBoost ML Ensemble Classifier (Trained Champion Model)
   ↓
Threat Intelligence Provider Abstraction
   ↓
Calibrated Risk Engine (Score: 0–100, Verdict: SAFE → CRITICAL)
   ↓
Empirical Evidence Formulation
   ↓
Explainable AI (Grounds explanation strictly in detected signals)
   ↓
Interactive Telemetry & Audit Logs
```

---

## ⚡ Features

* **Authoritative ML Model**: Champion XGBoost ensemble compared against Logistic Regression and Random Forest with verifiable evaluation metrics (F1, Accuracy, Precision, Recall, ROC-AUC).
* **26+ Extracted Features**: Lexical statistics, Shannon entropy, disposable TLDs, raw IP hostnames, URL shorteners, embedded delimiters (`@`), and targeting keywords.
* **Calibrated Risk Engine**:
  * `0 – 20`: **SAFE**
  * `21 – 40`: **LOW RISK**
  * `41 – 60`: **SUSPICIOUS**
  * `61 – 80`: **HIGH RISK**
  * `81 – 100`: **CRITICAL**
* **Explainable AI**: Plain-English synthesis grounded solely in detected evidence—never hallucinating WHOIS or domain reputation.
* **Safe URL Handling**: Backend does **not** fetch arbitrary external links, preventing SSRF, cloud metadata probing, and malicious redirects.
* **Comparative URL Scanner**: Side-by-side URL risk delta breakdown.
* **Batch Scanner**: Bulk CSV/TXT upload with downloadable CSV reports.
* **Admin & Observability Console**: Component health monitoring, dataset inventory, active model feature weights, and audit trails.
* **Modern Dark-Mode SaaS UI**: Built with Next.js 16 (App Router), Tailwind CSS, Recharts, and Lucide icons.

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run ML training pipeline (generates model.joblib and metrics.json)
python ml/train.py

# Seed initial database
python app/seed.py

# Start FastAPI server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup

```bash
# In project root or frontend directory
cd frontend

# Install packages
npm install

# Start Next.js development server
npm run dev
```
Open `http://localhost:3000` to access the application.

---

## 🧪 Testing

Run backend feature and API test suite:

```bash
python -m pytest backend/tests
```

---

## 🐳 Docker Deployment

Spin up PostgreSQL, FastAPI backend, and Next.js frontend with one command:

```bash
docker-compose up --build
```

---

## 📚 Documentation

* [Architecture Overview](docs/architecture.md)
* [Machine Learning Pipeline](docs/ml-pipeline.md)
* [Security & SSRF Hardening](docs/security.md)
* [REST API Specification](docs/api.md)
* [Production Deployment](docs/deployment.md)

---

## ⚠️ Cybersecurity Disclaimer

> PhishGuard AI provides automated risk analysis and should not be treated as an absolute guarantee of safety. Security classifications may contain false positives or false negatives. Never submit confidential credentials to untrusted web destinations.
