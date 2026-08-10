"""
schemas.py — Pydantic v2 response schemas.
These are the FROZEN API contract shapes.  Do NOT change field names or types
without team sign-off and a version bump.  (Contract frozen: Day 3)
"""
from __future__ import annotations
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ─── Wards ───────────────────────────────────────────────────────────────────

class WardOut(BaseModel):
    id:          str
    name:        str
    city:        str
    state:       str
    lat:         float
    lon:         float
    population:  int
    area_km2:    float

    class Config:
        from_attributes = True


class WardListOut(BaseModel):
    wards: List[WardOut]
    total: int


# ─── Indicators ──────────────────────────────────────────────────────────────

class IndicatorOut(BaseModel):
    id:          str
    label:       str
    unit:        str
    pillar:      str
    direction:   str
    weight:      float
    min_val:     float
    max_val:     float
    who_target:  Optional[float]
    source:      str
    description: Optional[str]

    class Config:
        from_attributes = True


class IndicatorListOut(BaseModel):
    indicators: List[IndicatorOut]
    total:      int


# ─── Scores ──────────────────────────────────────────────────────────────────

class PillarScores(BaseModel):
    environmental_quality:      float
    infrastructure_efficiency:  float
    public_services:            float
    mobility:                   float
    community_wellbeing:        float


class ScoreOut(BaseModel):
    ward_id:          str
    ward_name:        str
    date:             date
    total:            float = Field(..., ge=0, le=100)
    grade:            str
    pillar_scores:    PillarScores
    data_completeness: float = Field(..., ge=0, le=1)
    computed_at:      datetime


# ─── Explain ─────────────────────────────────────────────────────────────────

class IndicatorContribution(BaseModel):
    indicator_id:     str
    label:            str
    pillar:           str
    raw_value:        Optional[float]
    unit:             str
    normalized_value: float     # 0–100
    weight:           float
    contribution:     float     # weighted contribution to total score
    direction:        str       # "positive" | "negative" | "neutral"
    status:           str       # "good" | "moderate" | "poor"


class ExplainOut(BaseModel):
    ward_id:                str
    ward_name:              str
    date:                   date
    total:                  float
    indicator_contributions: List[IndicatorContribution]
    narrative:              str


# ─── Score History ────────────────────────────────────────────────────────────

class ScoreHistoryPoint(BaseModel):
    date:                       date
    total:                      float
    environmental_quality:      float
    infrastructure_efficiency:  float
    public_services:            float
    mobility:                   float
    community_wellbeing:        float


class ScoreHistoryOut(BaseModel):
    ward_id:   str
    ward_name: str
    days:      int
    history:   List[ScoreHistoryPoint]


# ─── Recommendations ─────────────────────────────────────────────────────────

class RecommendationItem(BaseModel):
    id:                    str
    title:                 str
    detail:                str
    impact:                str    # "high" | "medium" | "low"
    category:              str
    indicator:             str
    projected_score_uplift: float
    cost_band:             str    # "low" | "medium" | "high"
    time_to_effect_months: int


class RecommendationsOut(BaseModel):
    ward_id:         str
    ward_name:       str
    recommendations: List[RecommendationItem]


# ─── Simulate ─────────────────────────────────────────────────────────────────

class SimulateRequest(BaseModel):
    ward_id:     str
    adjustments: Dict[str, float] = Field(
        ...,
        description="Map of indicator_id → absolute delta (e.g. {'green_cover_pct': 5.0})"
    )


class PillarDelta(BaseModel):
    baseline:  float
    simulated: float
    delta:     float


class SimulateOut(BaseModel):
    ward_id:            str
    ward_name:          str
    baseline_score:     float
    simulated_score:    float
    delta:              float
    grade_before:       str
    grade_after:        str
    pillar_deltas:      Dict[str, PillarDelta]
    adjustments_applied: Dict[str, float]


# ─── Forecast ─────────────────────────────────────────────────────────────────

class ForecastPoint(BaseModel):
    date:      date
    predicted: float
    lower:     float    # 80% confidence lower bound
    upper:     float    # 80% confidence upper bound


class ForecastOut(BaseModel):
    ward_id:   str
    ward_name: str
    pillar:    str
    months:    int
    forecast:  List[ForecastPoint]


# ─── Health ───────────────────────────────────────────────────────────────────

class HealthOut(BaseModel):
    status:      str
    db_ok:       bool
    row_count:   int
    contract:    str = "frozen-day3"
    version:     str = "1.0.0"
