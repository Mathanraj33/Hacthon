"""
engine.py — Composite Sustainability Score computation.

compute_score(ward_id, score_date, db) → ScoreResult

Algorithm:
  1. Pull all indicator_readings for (ward_id, score_date)
  2. For each indicator, normalise raw value → 0–100
  3. Multiply by weight → indicator contribution
  4. Sum contributions → total score (0–100)
  5. Group contributions by pillar → pillar scores
  6. Compute data completeness (non-null readings / total indicators)

Data completeness < 0.5 → score is flagged unreliable (still computed).
Missing indicators receive their pillar's average as imputation.
"""
from __future__ import annotations
from dataclasses import dataclass, field
from datetime import date
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.models import IndicatorReading, Ward, ScoreCache
from app.scoring.normalise import (
    INDICATOR_CATALOGUE,
    CATALOGUE_BY_ID,
    normalise,
    score_to_grade,
    status_from_normalised,
)

PILLARS = [
    "environmental_quality",
    "infrastructure_efficiency",
    "public_services",
    "mobility",
    "community_wellbeing",
]


@dataclass
class IndicatorResult:
    indicator_id:     str
    label:            str
    pillar:           str
    raw_value:        Optional[float]
    unit:             str
    normalized_value: float        # 0–100 (imputed if missing)
    weight:           float
    contribution:     float        # = normalized_value * weight
    direction:        str
    status:           str


@dataclass
class ScoreResult:
    ward_id:          str
    ward_name:        str
    score_date:       date
    total:            float
    grade:            str
    pillar_scores:    Dict[str, float]
    indicator_results: List[IndicatorResult]
    data_completeness: float


def _pillar_average(results: List[IndicatorResult], pillar: str) -> float:
    """Average normalised value across non-missing indicators in a pillar."""
    vals = [r.normalized_value for r in results if r.pillar == pillar and r.raw_value is not None]
    return sum(vals) / len(vals) if vals else 50.0  # neutral fallback


def compute_score(
    ward_id: str,
    score_date: date,
    db: Session,
    weights_override: Optional[Dict[str, float]] = None,
    raw_overrides: Optional[Dict[str, float]] = None,
) -> ScoreResult:
    """
    Compute the composite sustainability score for a given ward and date.

    Args:
        ward_id:         Ward primary key string.
        score_date:      The date to compute the score for.
        db:              SQLAlchemy session.
        weights_override: Optional dict of {indicator_id: new_weight} (for simulator).
        raw_overrides:   Optional dict of {indicator_id: delta} added to raw value (for simulator).

    Returns:
        ScoreResult dataclass with all decomposition data.
    """
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if ward is None:
        raise ValueError(f"Ward '{ward_id}' not found.")

    # Fetch readings from DB
    readings_rows = (
        db.query(IndicatorReading)
        .filter(
            IndicatorReading.ward_id == ward_id,
            IndicatorReading.reading_date == score_date,
        )
        .all()
    )
    readings_map: Dict[str, Optional[float]] = {r.indicator_id: r.value for r in readings_rows}

    # Apply simulator overrides (absolute delta on raw value)
    if raw_overrides:
        for ind_id, delta in raw_overrides.items():
            base = readings_map.get(ind_id) or 0.0
            cat = CATALOGUE_BY_ID.get(ind_id)
            if cat:
                clamped = max(cat["min_val"], min(cat["max_val"], base + delta))
                readings_map[ind_id] = clamped

    # ── First pass: normalise all indicators ──────────────────────────────────
    indicator_results: List[IndicatorResult] = []
    for cat in INDICATOR_CATALOGUE:
        ind_id = cat["id"]
        raw = readings_map.get(ind_id)
        weight = weights_override.get(ind_id, cat["weight"]) if weights_override else cat["weight"]
        norm = normalise(raw, cat["min_val"], cat["max_val"], cat["direction"])
        indicator_results.append(
            IndicatorResult(
                indicator_id=ind_id,
                label=cat["label"],
                pillar=cat["pillar"],
                raw_value=raw,
                unit=cat["unit"],
                normalized_value=norm if norm is not None else 0.0,  # placeholder
                weight=weight,
                contribution=0.0,  # filled below
                direction=cat["direction"],
                status="moderate",  # placeholder
            )
        )

    # ── Impute missing values with pillar average ─────────────────────────────
    for pillar in PILLARS:
        avg = _pillar_average(indicator_results, pillar)
        for r in indicator_results:
            if r.pillar == pillar and r.raw_value is None:
                r.normalized_value = avg

    # ── Second pass: compute contributions and status ─────────────────────────
    total = 0.0
    for r in indicator_results:
        r.contribution = round(r.normalized_value * r.weight, 4)
        r.status = status_from_normalised(r.normalized_value)
        total += r.contribution

    total = round(total, 2)

    # ── Pillar scores ─────────────────────────────────────────────────────────
    pillar_scores: Dict[str, float] = {}
    for pillar in PILLARS:
        pillar_inds = [r for r in indicator_results if r.pillar == pillar]
        pillar_weight = sum(r.weight for r in pillar_inds)
        pillar_contribution = sum(r.contribution for r in pillar_inds)
        # Normalise pillar score to 0–100 (contribution / pillar_weight * 100)
        pillar_score = round((pillar_contribution / pillar_weight) * 1, 2) if pillar_weight else 0.0
        # pillar_score is already on 0-100 scale since normalized_value is 0-100
        # contribution = normalised * weight; pillar_score = sum(contribution) / pillar_weight
        # = weighted_avg(normalised) which is already 0-100 ✓
        pillar_scores[pillar] = round(pillar_contribution / pillar_weight * 1.0, 2) if pillar_weight else 0.0

    # ── Data completeness ─────────────────────────────────────────────────────
    present = sum(1 for r in indicator_results if r.raw_value is not None)
    completeness = round(present / len(indicator_results), 4)

    return ScoreResult(
        ward_id=ward_id,
        ward_name=ward.name,
        score_date=score_date,
        total=total,
        grade=score_to_grade(total),
        pillar_scores=pillar_scores,
        indicator_results=indicator_results,
        data_completeness=completeness,
    )


def upsert_score_cache(result: ScoreResult, db: Session) -> None:
    """Persist a ScoreResult into scores_cache (insert or update)."""
    existing = (
        db.query(ScoreCache)
        .filter(ScoreCache.ward_id == result.ward_id, ScoreCache.score_date == result.score_date)
        .first()
    )
    if existing:
        obj = existing
    else:
        obj = ScoreCache(ward_id=result.ward_id, score_date=result.score_date)
        db.add(obj)

    obj.total_score               = result.total
    obj.grade                     = result.grade
    obj.environmental_quality     = result.pillar_scores.get("environmental_quality", 0)
    obj.infrastructure_efficiency = result.pillar_scores.get("infrastructure_efficiency", 0)
    obj.public_services           = result.pillar_scores.get("public_services", 0)
    obj.mobility                  = result.pillar_scores.get("mobility", 0)
    obj.community_wellbeing       = result.pillar_scores.get("community_wellbeing", 0)
    obj.data_completeness         = result.data_completeness
    db.commit()
