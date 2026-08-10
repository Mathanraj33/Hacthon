"""
routers/simulate.py
  POST /api/v1/simulate  — stateless what-if policy simulation

Request body:
  { "ward_id": "ward-001", "adjustments": {"green_cover_pct": 5.0, "avg_commute_min": -8.0} }

Adjustments are ABSOLUTE deltas on raw indicator values (clamped to min/max).
Returns baseline vs simulated scores with per-pillar deltas.

Critical property: zero adjustments MUST return exactly the baseline score.
"""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Ward
from app.schemas import PillarDelta, SimulateOut, SimulateRequest
from app.scoring.engine import compute_score
from app.scoring.normalise import score_to_grade

router = APIRouter(prefix="/api/v1/simulate", tags=["simulate"])

PILLARS = [
    "environmental_quality",
    "infrastructure_efficiency",
    "public_services",
    "mobility",
    "community_wellbeing",
]


@router.post("", response_model=SimulateOut)
def simulate(payload: SimulateRequest, db: Session = Depends(get_db)):
    ward = db.query(Ward).filter(Ward.id == payload.ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail=f"Ward '{payload.ward_id}' not found.")

    target_date = date.today()

    # Baseline — no overrides
    baseline = compute_score(payload.ward_id, target_date, db)

    # Simulated — with adjustments applied as raw-value deltas
    simulated = compute_score(payload.ward_id, target_date, db, raw_overrides=payload.adjustments)

    pillar_deltas = {
        p: PillarDelta(
            baseline=round(baseline.pillar_scores.get(p, 0), 2),
            simulated=round(simulated.pillar_scores.get(p, 0), 2),
            delta=round(simulated.pillar_scores.get(p, 0) - baseline.pillar_scores.get(p, 0), 2),
        )
        for p in PILLARS
    }

    return SimulateOut(
        ward_id=payload.ward_id,
        ward_name=ward.name,
        baseline_score=baseline.total,
        simulated_score=simulated.total,
        delta=round(simulated.total - baseline.total, 2),
        grade_before=score_to_grade(baseline.total),
        grade_after=score_to_grade(simulated.total),
        pillar_deltas=pillar_deltas,
        adjustments_applied=payload.adjustments,
    )
