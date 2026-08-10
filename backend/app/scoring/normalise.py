"""
normalise.py — Indicator normalisation to 0–100 scale.

Formula:
  For "higher_better" indicators:
    normalised = clamp((raw - min_val) / (max_val - min_val) * 100, 0, 100)

  For "lower_better" indicators:
    normalised = clamp((max_val - raw) / (max_val - min_val) * 100, 0, 100)

The indicator catalogue (min/max/direction) lives in INDICATOR_CATALOGUE below —
this is the single source of truth.  It mirrors what's in the DB indicators table.
"""
from __future__ import annotations
from typing import Optional


def _clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def normalise(
    raw_value: Optional[float],
    min_val: float,
    max_val: float,
    direction: str,  # "lower_better" | "higher_better"
) -> Optional[float]:
    """
    Convert a raw measurement to a 0–100 sustainability sub-score.
    Returns None if raw_value is None (missing data).
    """
    if raw_value is None:
        return None
    if max_val == min_val:
        return 50.0  # degenerate range — return neutral
    if direction == "lower_better":
        score = (max_val - raw_value) / (max_val - min_val) * 100
    else:  # higher_better
        score = (raw_value - min_val) / (max_val - min_val) * 100
    return round(_clamp(score), 4)


def score_to_grade(score: float) -> str:
    """Convert a 0–100 score to a letter grade."""
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 75: return "B+"
    if score >= 70: return "B"
    if score >= 65: return "B-"
    if score >= 55: return "C+"
    if score >= 45: return "C"
    if score >= 35: return "D"
    return "F"


def status_from_normalised(norm: float, direction: str = "higher_better") -> str:
    """Return good / moderate / poor from a normalised score."""
    if norm >= 70: return "good"
    if norm >= 40: return "moderate"
    return "poor"


# ─── Frozen indicator catalogue ───────────────────────────────────────────────
# Matches the indicators table seeded by seed.py.
# DO NOT change weights without team sign-off (they must sum to 1.00).

INDICATOR_CATALOGUE: list[dict] = [
    # ── Environmental Quality (pillar weight 0.30) ──
    {
        "id":         "pm25",
        "label":      "PM2.5 Concentration",
        "unit":       "μg/m³",
        "pillar":     "environmental_quality",
        "direction":  "lower_better",
        "weight":     0.08,
        "min_val":    0.0,
        "max_val":    250.0,
        "who_target": 15.0,
        "source":     "cpcb",
        "description": "Fine particulate matter averaged across monitoring stations.",
    },
    {
        "id":         "aqi",
        "label":      "Air Quality Index",
        "unit":       "AQI",
        "pillar":     "environmental_quality",
        "direction":  "lower_better",
        "weight":     0.06,
        "min_val":    0.0,
        "max_val":    500.0,
        "who_target": 50.0,
        "source":     "cpcb",
        "description": "Composite AQI from CPCB stations in the ward.",
    },
    {
        "id":         "no2_ppb",
        "label":      "Nitrogen Dioxide",
        "unit":       "ppb",
        "pillar":     "environmental_quality",
        "direction":  "lower_better",
        "weight":     0.06,
        "min_val":    0.0,
        "max_val":    200.0,
        "who_target": 21.0,
        "source":     "open-meteo",
        "description": "NO2 concentration from air quality monitoring.",
    },
    {
        "id":         "green_cover_pct",
        "label":      "Green Cover",
        "unit":       "%",
        "pillar":     "environmental_quality",
        "direction":  "higher_better",
        "weight":     0.05,
        "min_val":    0.0,
        "max_val":    60.0,
        "who_target": 30.0,
        "source":     "osm",
        "description": "Tree canopy and park coverage as % of ward area.",
    },
    {
        "id":         "co2_ppm",
        "label":      "CO₂ Concentration",
        "unit":       "ppm",
        "pillar":     "environmental_quality",
        "direction":  "lower_better",
        "weight":     0.05,
        "min_val":    400.0,
        "max_val":    800.0,
        "who_target": 415.0,
        "source":     "open-meteo",
        "description": "Ambient CO₂ level indicating local emissions.",
    },

    # ── Infrastructure Efficiency (pillar weight 0.20) ──
    {
        "id":         "water_treated_pct",
        "label":      "Water Treatment Coverage",
        "unit":       "%",
        "pillar":     "infrastructure_efficiency",
        "direction":  "higher_better",
        "weight":     0.06,
        "min_val":    0.0,
        "max_val":    100.0,
        "who_target": 95.0,
        "source":     "municipal",
        "description": "Percentage of wastewater treated before discharge.",
    },
    {
        "id":         "energy_renewable_pct",
        "label":      "Renewable Energy Share",
        "unit":       "%",
        "pillar":     "infrastructure_efficiency",
        "direction":  "higher_better",
        "weight":     0.05,
        "min_val":    0.0,
        "max_val":    100.0,
        "who_target": 50.0,
        "source":     "municipal",
        "description": "Fraction of total energy consumption from renewable sources.",
    },
    {
        "id":         "road_quality_score",
        "label":      "Road Quality Index",
        "unit":       "score",
        "pillar":     "infrastructure_efficiency",
        "direction":  "higher_better",
        "weight":     0.05,
        "min_val":    0.0,
        "max_val":    100.0,
        "who_target": 80.0,
        "source":     "municipal",
        "description": "Composite road surface quality score (0–100).",
    },
    {
        "id":         "water_quality_score",
        "label":      "Drinking Water Quality",
        "unit":       "score",
        "pillar":     "infrastructure_efficiency",
        "direction":  "higher_better",
        "weight":     0.04,
        "min_val":    0.0,
        "max_val":    100.0,
        "who_target": 90.0,
        "source":     "municipal",
        "description": "Drinking water safety composite score.",
    },

    # ── Public Services (pillar weight 0.20) ──
    {
        "id":         "waste_diversion_pct",
        "label":      "Waste Diversion Rate",
        "unit":       "%",
        "pillar":     "public_services",
        "direction":  "higher_better",
        "weight":     0.06,
        "min_val":    0.0,
        "max_val":    100.0,
        "who_target": 75.0,
        "source":     "municipal",
        "description": "Fraction of municipal waste recycled or composted.",
    },
    {
        "id":         "hospitals_per_km2",
        "label":      "Hospital Density",
        "unit":       "per km²",
        "pillar":     "public_services",
        "direction":  "higher_better",
        "weight":     0.07,
        "min_val":    0.0,
        "max_val":    5.0,
        "who_target": 1.5,
        "source":     "osm",
        "description": "Number of hospitals and clinics per square kilometre.",
    },
    {
        "id":         "schools_per_km2",
        "label":      "School Density",
        "unit":       "per km²",
        "pillar":     "public_services",
        "direction":  "higher_better",
        "weight":     0.07,
        "min_val":    0.0,
        "max_val":    10.0,
        "who_target": 3.0,
        "source":     "osm",
        "description": "Number of schools per square kilometre.",
    },

    # ── Mobility (pillar weight 0.15) ──
    {
        "id":         "avg_commute_min",
        "label":      "Average Commute Time",
        "unit":       "minutes",
        "pillar":     "mobility",
        "direction":  "lower_better",
        "weight":     0.05,
        "min_val":    5.0,
        "max_val":    90.0,
        "who_target": 30.0,
        "source":     "municipal",
        "description": "Average peak-hour commute across primary corridors.",
    },
    {
        "id":         "transit_coverage_pct",
        "label":      "Public Transit Coverage",
        "unit":       "%",
        "pillar":     "mobility",
        "direction":  "higher_better",
        "weight":     0.05,
        "min_val":    0.0,
        "max_val":    100.0,
        "who_target": 80.0,
        "source":     "osm",
        "description": "% of ward area within 500m of a public transit stop.",
    },
    {
        "id":         "road_density",
        "label":      "Road Network Density",
        "unit":       "km/km²",
        "pillar":     "mobility",
        "direction":  "higher_better",
        "weight":     0.03,
        "min_val":    0.0,
        "max_val":    30.0,
        "who_target": 15.0,
        "source":     "osm",
        "description": "Total road length per square kilometre of ward area.",
    },
    {
        "id":         "public_transport_trips",
        "label":      "Daily Transit Ridership",
        "unit":       "thousands",
        "pillar":     "mobility",
        "direction":  "higher_better",
        "weight":     0.02,
        "min_val":    0.0,
        "max_val":    500.0,
        "who_target": 100.0,
        "source":     "municipal",
        "description": "Daily public transit trips originating from the ward (thousands).",
    },

    # ── Community Well-being (pillar weight 0.15) ──
    {
        "id":         "green_space_per_capita",
        "label":      "Green Space per Capita",
        "unit":       "m²/person",
        "pillar":     "community_wellbeing",
        "direction":  "higher_better",
        "weight":     0.05,
        "min_val":    0.0,
        "max_val":    100.0,
        "who_target": 9.0,
        "source":     "osm",
        "description": "Public green space area per resident (WHO recommends ≥9 m²).",
    },
    {
        "id":         "literacy_rate",
        "label":      "Literacy Rate",
        "unit":       "%",
        "pillar":     "community_wellbeing",
        "direction":  "higher_better",
        "weight":     0.05,
        "min_val":    50.0,
        "max_val":    100.0,
        "who_target": 95.0,
        "source":     "census",
        "description": "Adult literacy rate in the ward (census-based).",
    },
    {
        "id":         "park_area_pct",
        "label":      "Park Coverage",
        "unit":       "%",
        "pillar":     "community_wellbeing",
        "direction":  "higher_better",
        "weight":     0.03,
        "min_val":    0.0,
        "max_val":    30.0,
        "who_target": 10.0,
        "source":     "osm",
        "description": "Percentage of ward area designated as public parks.",
    },
    {
        "id":         "noise_db",
        "label":      "Ambient Noise Level",
        "unit":       "dB",
        "pillar":     "community_wellbeing",
        "direction":  "lower_better",
        "weight":     0.02,
        "min_val":    30.0,
        "max_val":    90.0,
        "who_target": 55.0,
        "source":     "municipal",
        "description": "Average daytime ambient noise level in the ward.",
    },
]

# Build lookup dict for fast access
CATALOGUE_BY_ID: dict[str, dict] = {ind["id"]: ind for ind in INDICATOR_CATALOGUE}

# Verify weights sum to 1.0
_total_weight = sum(ind["weight"] for ind in INDICATOR_CATALOGUE)
assert abs(_total_weight - 1.0) < 1e-9, f"Indicator weights must sum to 1.0, got {_total_weight}"
