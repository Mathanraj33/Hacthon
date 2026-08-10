"""
routers/recommendations.py
  GET /api/v1/recommendations/{ward_id}
"""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Ward
from app.schemas import RecommendationItem, RecommendationsOut
from app.scoring.engine import compute_score
from app.scoring.normalise import CATALOGUE_BY_ID

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])

# Intervention catalogue — maps weak indicators to actionable recommendations
INTERVENTIONS: dict[str, dict] = {
    "pm25": {
        "title": "Expand low-emission zone",
        "detail": "Projected 11% reduction in PM2.5 during peak hours within two quarters.",
        "cost_band": "medium",
        "time_to_effect_months": 3,
        "score_uplift_per_10pct": 0.8,
    },
    "aqi": {
        "title": "Deploy continuous AQI monitoring & public alerts",
        "detail": "Real-time alerts cut population exposure by redirecting foot traffic.",
        "cost_band": "low",
        "time_to_effect_months": 1,
        "score_uplift_per_10pct": 0.6,
    },
    "no2_ppb": {
        "title": "Retrofit diesel buses with CNG/EV fleet",
        "detail": "Fleet electrification reduces roadside NO2 by up to 30%.",
        "cost_band": "high",
        "time_to_effect_months": 12,
        "score_uplift_per_10pct": 0.6,
    },
    "green_cover_pct": {
        "title": "Plant 12,000 shade trees along transit routes",
        "detail": "Reduces surface heat island effect by up to 2.4°C and improves AQI.",
        "cost_band": "low",
        "time_to_effect_months": 6,
        "score_uplift_per_10pct": 0.5,
    },
    "co2_ppm": {
        "title": "Install rooftop solar on public buildings",
        "detail": "Displaces 6.2 GWh/year of grid power and reduces local CO₂ by ~2,100 tonnes.",
        "cost_band": "medium",
        "time_to_effect_months": 9,
        "score_uplift_per_10pct": 0.5,
    },
    "water_treated_pct": {
        "title": "Upgrade the Kodungaiyur STP tertiary treatment",
        "detail": "Bringing treatment to 95%+ protects downstream water quality.",
        "cost_band": "high",
        "time_to_effect_months": 18,
        "score_uplift_per_10pct": 0.6,
    },
    "energy_renewable_pct": {
        "title": "Mandate solar-ready rooftop standards for new construction",
        "detail": "City-wide mandate raises renewable share by 8–12% in 18 months.",
        "cost_band": "low",
        "time_to_effect_months": 18,
        "score_uplift_per_10pct": 0.5,
    },
    "road_quality_score": {
        "title": "Prioritise pothole repair in the worst-rated ward zones",
        "detail": "Targeted repair of bottom-quartile roads improves score by 15 points.",
        "cost_band": "medium",
        "time_to_effect_months": 3,
        "score_uplift_per_10pct": 0.5,
    },
    "water_quality_score": {
        "title": "Chlorination audit and pipe replacement in aging network",
        "detail": "Aged pipes are the primary driver of drinking water quality failures.",
        "cost_band": "medium",
        "time_to_effect_months": 6,
        "score_uplift_per_10pct": 0.4,
    },
    "waste_diversion_pct": {
        "title": "Add 4 organic waste drop-off hubs",
        "detail": "Raises diversion rate above the 75% national benchmark.",
        "cost_band": "low",
        "time_to_effect_months": 2,
        "score_uplift_per_10pct": 0.6,
    },
    "hospitals_per_km2": {
        "title": "Convert one government building into a 24-hour health centre",
        "detail": "Increases hospital density by 0.3/km² and improves emergency response time.",
        "cost_band": "medium",
        "time_to_effect_months": 6,
        "score_uplift_per_10pct": 0.7,
    },
    "schools_per_km2": {
        "title": "Open satellite learning centres in under-served sub-wards",
        "detail": "Addresses the school gap in the eastern growth corridors.",
        "cost_band": "medium",
        "time_to_effect_months": 9,
        "score_uplift_per_10pct": 0.7,
    },
    "avg_commute_min": {
        "title": "Introduce dedicated bus rapid transit lanes",
        "detail": "BRT reduces average commute by 8–12 minutes on primary corridors.",
        "cost_band": "high",
        "time_to_effect_months": 12,
        "score_uplift_per_10pct": 0.5,
    },
    "transit_coverage_pct": {
        "title": "Add 6 new bus stops in the northern residential zone",
        "detail": "Closes the last-mile gap and brings coverage above the 80% SDG target.",
        "cost_band": "low",
        "time_to_effect_months": 2,
        "score_uplift_per_10pct": 0.5,
    },
    "road_density": {
        "title": "Complete the ring road connecting sub-ward clusters",
        "detail": "Reduces vehicle kilometres travelled and distributes traffic load.",
        "cost_band": "high",
        "time_to_effect_months": 24,
        "score_uplift_per_10pct": 0.3,
    },
    "public_transport_trips": {
        "title": "Subsidise monthly transit passes for low-income residents",
        "detail": "Similar schemes increased ridership by 18% in comparable Indian cities.",
        "cost_band": "medium",
        "time_to_effect_months": 3,
        "score_uplift_per_10pct": 0.2,
    },
    "green_space_per_capita": {
        "title": "Convert 3 vacant lots into pocket parks",
        "detail": "Adds 4,200 m² of green space and meets WHO 9 m²/person target.",
        "cost_band": "low",
        "time_to_effect_months": 4,
        "score_uplift_per_10pct": 0.5,
    },
    "literacy_rate": {
        "title": "Launch adult literacy programme in partnership with NGOs",
        "detail": "Six-month intensive programme has shown 5% improvement in comparable wards.",
        "cost_band": "low",
        "time_to_effect_months": 6,
        "score_uplift_per_10pct": 0.5,
    },
    "park_area_pct": {
        "title": "Designate 2 heritage open spaces as protected parks",
        "detail": "Low-cost policy change immediately raises park area percentage.",
        "cost_band": "low",
        "time_to_effect_months": 1,
        "score_uplift_per_10pct": 0.3,
    },
    "noise_db": {
        "title": "Enforce night-time noise ordinance and install noise barriers",
        "detail": "Reduces residential noise exposure by 4–6 dB within 3 months.",
        "cost_band": "low",
        "time_to_effect_months": 3,
        "score_uplift_per_10pct": 0.2,
    },
}

IMPACT_MAP = {
    "high":   lambda uplift: uplift >= 2.0,
    "medium": lambda uplift: 0.8 <= uplift < 2.0,
    "low":    lambda uplift: uplift < 0.8,
}


def _impact_label(uplift: float) -> str:
    if uplift >= 2.0: return "high"
    if uplift >= 0.8: return "medium"
    return "low"


def _pillar_label(pillar: str) -> str:
    return pillar.replace("_", " ").title()


@router.get("/{ward_id}", response_model=RecommendationsOut)
def get_recommendations(ward_id: str, db: Session = Depends(get_db)):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail=f"Ward '{ward_id}' not found.")

    target_date = date.today()
    result = compute_score(ward_id, target_date, db)

    # Sort indicators by normalised score ascending (weakest first)
    sorted_inds = sorted(result.indicator_results, key=lambda r: r.normalized_value)

    recs = []
    for i, ind in enumerate(sorted_inds):
        intervention = INTERVENTIONS.get(ind.indicator_id)
        if not intervention:
            continue
        # Projected uplift: how much the total score would rise if this indicator improved 10 pts
        projected_uplift = round(intervention["score_uplift_per_10pct"] * ind.weight * 100, 2)
        cat = CATALOGUE_BY_ID.get(ind.indicator_id, {})
        recs.append(
            RecommendationItem(
                id=f"rec-{ward_id}-{i+1:03d}",
                title=intervention["title"],
                detail=intervention["detail"],
                impact=_impact_label(projected_uplift),
                category=_pillar_label(ind.pillar),
                indicator=ind.indicator_id,
                projected_score_uplift=projected_uplift,
                cost_band=intervention["cost_band"],
                time_to_effect_months=intervention["time_to_effect_months"],
            )
        )

    # Return top 6, sorted by projected uplift descending
    recs.sort(key=lambda r: -r.projected_score_uplift)
    return RecommendationsOut(ward_id=ward_id, ward_name=ward.name, recommendations=recs[:6])
