# PhishGuard AI — Deployment Guide

## 1. Local Development

### Backend
```bash
cd backend
python -m pip install -r requirements.txt
python ml/train.py
python app/seed.py
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 2. Docker Compose (Full Stack)

To run the entire production-ready system with PostgreSQL:

```bash
docker-compose up --build -d
```

Services:
- **Frontend**: `http://localhost:3000`
- **FastAPI Backend**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432`

---

## 3. Production Environment Variables

Configure `.env` for production deployments:

```env
DATABASE_URL=postgresql+psycopg2://user:password@prod-db-host:5432/phishguard
JWT_SECRET=generate_with_openssl_rand_hex_32
AI_API_KEY=your_gemini_or_openai_key_optional
THREAT_INTELLIGENCE_API_KEY=your_virustotal_key_optional
CORS_ORIGINS=["https://phishguard.yourdomain.com"]
NEXT_PUBLIC_API_URL=https://api.phishguard.yourdomain.com/api
```
