"""
main.py — FastAPI application entry point.
Run with: uvicorn app.main:app --reload --port 8000
Docs at:  http://localhost:8000/docs
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine, get_db
from app.schemas import HealthOut
from app.routers import wards, indicators, scores, recommendations, simulate

# Create all tables on startup (idempotent — safe to call repeatedly)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Urban Sustainability Assessment System — API",
    description=(
        "REST API for S-50 HackNova'26. "
        "Provides sustainability scores, indicator data, recommendations, and policy simulation "
        "for 10 Chennai wards across 5 SDG-11 pillars. "
        "**API contract frozen Day 3 — changes require team sign-off.**"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/api/v1/openapi.json",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(wards.router)
app.include_router(indicators.router)
app.include_router(scores.router)
app.include_router(recommendations.router)
app.include_router(simulate.router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthOut, tags=["health"])
def health(db: Session = Depends(get_db)):
    try:
        row_count = db.execute(text("SELECT COUNT(*) FROM indicator_readings")).scalar()
        db_ok = True
    except Exception:
        row_count = 0
        db_ok = False
    return HealthOut(
        status="ok" if db_ok else "degraded",
        db_ok=db_ok,
        row_count=row_count or 0,
    )


@app.get("/", tags=["health"])
def root():
    return {
        "message": "USAS API v1.0.0 — Urban Sustainability Assessment System",
        "docs": "/docs",
        "health": "/health",
        "contract": "frozen-day3",
    }
