"""
routers/scores.py
  GET  /api/v1/scores              → list latest score per ward
  GET  /api/v1/scores/{ward_id}    → latest score for one ward
  GET  /api/v1/scores/{ward_id}/explain   → full indicator decomposition
  GET  /api/v1/scores/history      → 90-day trend for a ward
"""
from datetime import date, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Ward, ScoreCache
from app.schemas import (
    ExplainOut,
    IndicatorContribution,
    PillarScores,
    ScoreHistoryOut,
    ScoreHistoryPoint,
    ScoreOut,
)
from app.scoring.engine import compute_score
from app.scoring.normalise import CATALOGUE_BY_ID, status_from_normalised

router = APIRouter(prefix="/api/v1/scores", tags=["scores"])


def _latest_date(ward_id: str, db: Session) -> date:
    """Return most recent date that has a cached score for this ward."""
    row = (
        db.query(ScoreCache)
        .filter(ScoreCache.ward_id == ward_id)
        .order_by(ScoreCache.score_date.desc())
        .first()
    )
    return row.score_date if row else date.today()


def _cache_to_score_out(row: ScoreCache, ward_name: str) -> ScoreOut:
    return ScoreOut(
        ward_id=row.ward_id,
        ward_name=ward_name,
        date=row.score_date,
        total=row.total_score,
        grade=row.grade,
        pillar_scores=PillarScores(
            environmental_quality=row.environmental_quality,
            infrastructure_efficiency=row.infrastructure_efficiency,
            public_services=row.public_services,
            mobility=row.mobility,
            community_wellbeing=row.community_wellbeing,
        ),
        data_completeness=row.data_completeness,
        computed_at=row.computed_at,
    )


# ── GET /api/v1/scores ────────────────────────────────────────────────────────
@router.get("", response_model=list[ScoreOut])
def list_scores(
    score_date: Optional[date] = Query(None, description="ISO date, defaults to latest"),
    db: Session = Depends(get_db),
):
    """Return the latest score for every ward."""
    wards = db.query(Ward).all()
    results = []
    for ward in wards:
        target_date = score_date or _latest_date(ward.id, db)
        row = (
            db.query(ScoreCache)
            .filter(ScoreCache.ward_id == ward.id, ScoreCache.score_date == target_date)
            .first()
        )
        if row:
            results.append(_cache_to_score_out(row, ward.name))
        else:
            # Compute on-demand and cache
            result = compute_score(ward.id, target_date, db)
            from app.scoring.engine import upsert_score_cache
            upsert_score_cache(result, db)
            results.append(
                ScoreOut(
                    ward_id=result.ward_id,
                    ward_name=result.ward_name,
                    date=result.score_date,
                    total=result.total,
                    grade=result.grade,
                    pillar_scores=PillarScores(**result.pillar_scores),
                    data_completeness=result.data_completeness,
                    computed_at=__import__("datetime").datetime.utcnow(),
                )
            )
    return results


# ── GET /api/v1/scores/{ward_id} ──────────────────────────────────────────────
@router.get("/{ward_id}", response_model=ScoreOut)
def get_score(
    ward_id: str,
    score_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail=f"Ward '{ward_id}' not found.")

    target_date = score_date or _latest_date(ward_id, db)
    row = (
        db.query(ScoreCache)
        .filter(ScoreCache.ward_id == ward_id, ScoreCache.score_date == target_date)
        .first()
    )
    if row:
        return _cache_to_score_out(row, ward.name)

    result = compute_score(ward_id, target_date, db)
    from app.scoring.engine import upsert_score_cache
    upsert_score_cache(result, db)
    import datetime
    return ScoreOut(
        ward_id=result.ward_id,
        ward_name=result.ward_name,
        date=result.score_date,
        total=result.total,
        grade=result.grade,
        pillar_scores=PillarScores(**result.pillar_scores),
        data_completeness=result.data_completeness,
        computed_at=datetime.datetime.utcnow(),
    )


# ── GET /api/v1/scores/{ward_id}/explain ─────────────────────────────────────
@router.get("/{ward_id}/explain", response_model=ExplainOut)
def explain_score(
    ward_id: str,
    score_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail=f"Ward '{ward_id}' not found.")

    target_date = score_date or _latest_date(ward_id, db)
    result = compute_score(ward_id, target_date, db)

    contributions = [
        IndicatorContribution(
            indicator_id=r.indicator_id,
            label=r.label,
            pillar=r.pillar,
            raw_value=r.raw_value,
            unit=r.unit,
            normalized_value=round(r.normalized_value, 2),
            weight=r.weight,
            contribution=round(r.contribution, 4),
            direction="positive" if r.normalized_value >= 50 else "negative",
            status=r.status,
        )
        for r in sorted(result.indicator_results, key=lambda x: -x.contribution)
    ]

    top_pos = [c for c in contributions if c.direction == "positive"][:2]
    top_neg = [c for c in contributions if c.direction == "negative"][:2]

    pos_str = " and ".join(f"{c.label} ({c.normalized_value:.0f}/100)" for c in top_pos) or "no strong positives"
    neg_str = " and ".join(f"{c.label} ({c.normalized_value:.0f}/100)" for c in top_neg) or "no critical gaps"
    narrative = (
        f"{ward.name} scores {result.total:.1f}/100 (Grade {result.grade}). "
        f"Key strengths: {pos_str}. "
        f"Improvement areas: {neg_str}. "
        f"Data completeness: {result.data_completeness*100:.0f}%."
    )

    return ExplainOut(
        ward_id=ward_id,
        ward_name=ward.name,
        date=target_date,
        total=result.total,
        indicator_contributions=contributions,
        narrative=narrative,
    )


# ── GET /api/v1/scores/history ────────────────────────────────────────────────
@router.get("/history", response_model=ScoreHistoryOut)
def score_history(
    ward_id: str = Query(..., description="Ward ID"),
    days: int = Query(90, ge=7, le=365),
    db: Session = Depends(get_db),
):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail=f"Ward '{ward_id}' not found.")

    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    rows = (
        db.query(ScoreCache)
        .filter(
            ScoreCache.ward_id == ward_id,
            ScoreCache.score_date >= start_date,
            ScoreCache.score_date <= end_date,
        )
        .order_by(ScoreCache.score_date.asc())
        .all()
    )

    history = [
        ScoreHistoryPoint(
            date=row.score_date,
            total=row.total_score,
            environmental_quality=row.environmental_quality,
            infrastructure_efficiency=row.infrastructure_efficiency,
            public_services=row.public_services,
            mobility=row.mobility,
            community_wellbeing=row.community_wellbeing,
        )
        for row in rows
    ]

    return ScoreHistoryOut(ward_id=ward_id, ward_name=ward.name, days=days, history=history)
