"""
seed.py — Populate the database with 10 Chennai wards × 90 days × 20 indicators.

Usage:
    cd backend
    python seed.py

What it does:
  1. Creates all tables (idempotent)
  2. Inserts 10 ward records for Chennai
  3. Inserts 20 indicator definitions
  4. Generates 90 days × 10 wards × 20 indicators = 18,000 readings with
     realistic variance and occasional anomaly spikes
  5. Pre-computes and caches scores for all wards × all dates

Expected output:
  ✅  Tables created
  ✅  10 wards inserted
  ✅  20 indicators inserted
  ✅  18,000 indicator_readings inserted
  ✅  900 score rows cached (10 wards × 90 days)
  ✅  Checkpoint: SELECT COUNT(*) FROM indicator_readings → 18000

Run time: ~10–30 seconds depending on machine.
"""
import os, sys, random, math
from datetime import date, timedelta
from pathlib import Path

# ── Make sure we can import from app/ regardless of cwd ──────────────────────
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv()

from app.database import SessionLocal, engine
from app.models import Base, Ward, Indicator, IndicatorReading, ScoreCache
from app.scoring.normalise import INDICATOR_CATALOGUE, CATALOGUE_BY_ID, normalise, score_to_grade
from app.scoring.engine import PILLARS

# ─────────────────────────────────────────────────────────────────────────────
# WARD MASTER DATA — 10 Chennai wards
# ─────────────────────────────────────────────────────────────────────────────
WARDS = [
    {"id": "ward-001", "name": "Anna Nagar",       "lat": 13.0850, "lon": 80.2101, "population": 125000, "area_km2": 8.5},
    {"id": "ward-002", "name": "T. Nagar",          "lat": 13.0418, "lon": 80.2341, "population": 180000, "area_km2": 6.2},
    {"id": "ward-003", "name": "Adyar",             "lat": 13.0012, "lon": 80.2565, "population": 95000,  "area_km2": 7.8},
    {"id": "ward-004", "name": "Velachery",         "lat": 12.9815, "lon": 80.2180, "population": 140000, "area_km2": 9.1},
    {"id": "ward-005", "name": "Tambaram",          "lat": 12.9249, "lon": 80.1000, "population": 160000, "area_km2": 12.3},
    {"id": "ward-006", "name": "Perambur",          "lat": 13.1158, "lon": 80.2329, "population": 110000, "area_km2": 5.9},
    {"id": "ward-007", "name": "Sholinganallur",    "lat": 12.9010, "lon": 80.2279, "population": 85000,  "area_km2": 14.2},
    {"id": "ward-008", "name": "Guindy",            "lat": 13.0067, "lon": 80.2206, "population": 75000,  "area_km2": 10.5},
    {"id": "ward-009", "name": "Mylapore",          "lat": 13.0368, "lon": 80.2676, "population": 130000, "area_km2": 4.8},
    {"id": "ward-010", "name": "Kodambakkam",       "lat": 13.0521, "lon": 80.2222, "population": 115000, "area_km2": 5.6},
]

# ─────────────────────────────────────────────────────────────────────────────
# WARD INDICATOR BASE VALUES (realistic Chennai data, Day-0 baseline)
# Variance is added daily with a slight slow-drift trend.
# ─────────────────────────────────────────────────────────────────────────────
WARD_PROFILES = {
    "ward-001": {  # Anna Nagar — residential, good green cover
        "pm25": 44,  "aqi": 86,  "no2_ppb": 40,  "green_cover_pct": 29,
        "co2_ppm": 426, "water_treated_pct": 89, "energy_renewable_pct": 34,
        "road_quality_score": 73, "water_quality_score": 82,
        "waste_diversion_pct": 68, "hospitals_per_km2": 2.1, "schools_per_km2": 4.8,
        "avg_commute_min": 32, "transit_coverage_pct": 72, "road_density": 18.2,
        "public_transport_trips": 148, "green_space_per_capita": 8.4,
        "literacy_rate": 93, "park_area_pct": 12, "noise_db": 62,
    },
    "ward-002": {  # T. Nagar — commercial, heavy traffic, poor air
        "pm25": 78,  "aqi": 142, "no2_ppb": 81,  "green_cover_pct": 11,
        "co2_ppm": 468, "water_treated_pct": 82, "energy_renewable_pct": 18,
        "road_quality_score": 58, "water_quality_score": 74,
        "waste_diversion_pct": 54, "hospitals_per_km2": 2.8, "schools_per_km2": 5.2,
        "avg_commute_min": 54, "transit_coverage_pct": 88, "road_density": 22.1,
        "public_transport_trips": 312, "green_space_per_capita": 2.1,
        "literacy_rate": 91, "park_area_pct": 4,  "noise_db": 78,
    },
    "ward-003": {  # Adyar — coastal, moderate, good water quality
        "pm25": 38,  "aqi": 72,  "no2_ppb": 36,  "green_cover_pct": 33,
        "co2_ppm": 418, "water_treated_pct": 91, "energy_renewable_pct": 31,
        "road_quality_score": 69, "water_quality_score": 88,
        "waste_diversion_pct": 71, "hospitals_per_km2": 1.8, "schools_per_km2": 3.9,
        "avg_commute_min": 28, "transit_coverage_pct": 68, "road_density": 16.4,
        "public_transport_trips": 118, "green_space_per_capita": 11.2,
        "literacy_rate": 94, "park_area_pct": 15, "noise_db": 58,
    },
    "ward-004": {  # Velachery — tech hub, moderate, flooding risk zone
        "pm25": 52,  "aqi": 98,  "no2_ppb": 48,  "green_cover_pct": 22,
        "co2_ppm": 438, "water_treated_pct": 85, "energy_renewable_pct": 28,
        "road_quality_score": 65, "water_quality_score": 79,
        "waste_diversion_pct": 62, "hospitals_per_km2": 1.5, "schools_per_km2": 3.4,
        "avg_commute_min": 41, "transit_coverage_pct": 74, "road_density": 17.8,
        "public_transport_trips": 195, "green_space_per_capita": 5.8,
        "literacy_rate": 92, "park_area_pct": 8,  "noise_db": 66,
    },
    "ward-005": {  # Tambaram — suburban, lower green cover, longer commute
        "pm25": 58,  "aqi": 108, "no2_ppb": 54,  "green_cover_pct": 18,
        "co2_ppm": 444, "water_treated_pct": 78, "energy_renewable_pct": 22,
        "road_quality_score": 61, "water_quality_score": 72,
        "waste_diversion_pct": 55, "hospitals_per_km2": 0.9, "schools_per_km2": 2.8,
        "avg_commute_min": 48, "transit_coverage_pct": 58, "road_density": 13.2,
        "public_transport_trips": 142, "green_space_per_capita": 4.2,
        "literacy_rate": 88, "park_area_pct": 6,  "noise_db": 64,
    },
    "ward-006": {  # Perambur — industrial, worst air quality
        "pm25": 92,  "aqi": 168, "no2_ppb": 98,  "green_cover_pct": 8,
        "co2_ppm": 488, "water_treated_pct": 76, "energy_renewable_pct": 12,
        "road_quality_score": 52, "water_quality_score": 68,
        "waste_diversion_pct": 48, "hospitals_per_km2": 1.2, "schools_per_km2": 2.4,
        "avg_commute_min": 45, "transit_coverage_pct": 62, "road_density": 14.8,
        "public_transport_trips": 108, "green_space_per_capita": 1.8,
        "literacy_rate": 84, "park_area_pct": 2,  "noise_db": 82,
    },
    "ward-007": {  # Sholinganallur — IT corridor, new development, good but sparse transit
        "pm25": 42,  "aqi": 80,  "no2_ppb": 38,  "green_cover_pct": 26,
        "co2_ppm": 422, "water_treated_pct": 88, "energy_renewable_pct": 42,
        "road_quality_score": 78, "water_quality_score": 85,
        "waste_diversion_pct": 74, "hospitals_per_km2": 0.8, "schools_per_km2": 2.1,
        "avg_commute_min": 38, "transit_coverage_pct": 52, "road_density": 15.6,
        "public_transport_trips": 98,  "green_space_per_capita": 9.8,
        "literacy_rate": 96, "park_area_pct": 11, "noise_db": 55,
    },
    "ward-008": {  # Guindy — industrial/commercial mix
        "pm25": 68,  "aqi": 122, "no2_ppb": 72,  "green_cover_pct": 16,
        "co2_ppm": 454, "water_treated_pct": 83, "energy_renewable_pct": 24,
        "road_quality_score": 67, "water_quality_score": 76,
        "waste_diversion_pct": 58, "hospitals_per_km2": 1.4, "schools_per_km2": 2.9,
        "avg_commute_min": 36, "transit_coverage_pct": 78, "road_density": 19.4,
        "public_transport_trips": 186, "green_space_per_capita": 3.8,
        "literacy_rate": 90, "park_area_pct": 5,  "noise_db": 74,
    },
    "ward-009": {  # Mylapore — heritage, dense, good services
        "pm25": 48,  "aqi": 91,  "no2_ppb": 44,  "green_cover_pct": 21,
        "co2_ppm": 432, "water_treated_pct": 87, "energy_renewable_pct": 26,
        "road_quality_score": 71, "water_quality_score": 83,
        "waste_diversion_pct": 66, "hospitals_per_km2": 3.2, "schools_per_km2": 6.4,
        "avg_commute_min": 31, "transit_coverage_pct": 84, "road_density": 20.8,
        "public_transport_trips": 228, "green_space_per_capita": 4.8,
        "literacy_rate": 95, "park_area_pct": 7,  "noise_db": 70,
    },
    "ward-010": {  # Kodambakkam — dense residential, moderate across indicators
        "pm25": 56,  "aqi": 104, "no2_ppb": 52,  "green_cover_pct": 19,
        "co2_ppm": 442, "water_treated_pct": 81, "energy_renewable_pct": 21,
        "road_quality_score": 63, "water_quality_score": 77,
        "waste_diversion_pct": 60, "hospitals_per_km2": 1.9, "schools_per_km2": 4.1,
        "avg_commute_min": 39, "transit_coverage_pct": 76, "road_density": 18.6,
        "public_transport_trips": 176, "green_space_per_capita": 3.4,
        "literacy_rate": 89, "park_area_pct": 6,  "noise_db": 68,
    },
}

# Daily noise parameters (realistic day-to-day variation)
INDICATOR_NOISE = {
    "pm25": 8.0,              "aqi": 15.0,             "no2_ppb": 10.0,
    "green_cover_pct": 0.3,   "co2_ppm": 6.0,          "water_treated_pct": 1.5,
    "energy_renewable_pct": 2.0, "road_quality_score": 1.0, "water_quality_score": 1.5,
    "waste_diversion_pct": 2.0,  "hospitals_per_km2": 0.05, "schools_per_km2": 0.1,
    "avg_commute_min": 4.0,   "transit_coverage_pct": 2.0, "road_density": 0.2,
    "public_transport_trips": 12.0, "green_space_per_capita": 0.3,
    "literacy_rate": 0.2,     "park_area_pct": 0.1,    "noise_db": 4.0,
}

# Slow improvement trend over 90 days (positive = improving over time)
INDICATOR_TREND = {
    "pm25": -0.05,            "aqi": -0.08,            "no2_ppb": -0.04,
    "green_cover_pct": 0.01,  "co2_ppm": -0.02,        "water_treated_pct": 0.02,
    "energy_renewable_pct": 0.04, "road_quality_score": 0.02, "water_quality_score": 0.02,
    "waste_diversion_pct": 0.03,  "hospitals_per_km2": 0.0,  "schools_per_km2": 0.0,
    "avg_commute_min": -0.02, "transit_coverage_pct": 0.02, "road_density": 0.0,
    "public_transport_trips": 0.1, "green_space_per_capita": 0.01,
    "literacy_rate": 0.01,    "park_area_pct": 0.005,  "noise_db": -0.03,
}


def _generate_value(ind_id: str, base: float, day_offset: int, rng: random.Random) -> float:
    """Generate a realistic reading for a given indicator, ward, and day."""
    cat = CATALOGUE_BY_ID[ind_id]
    trend_delta = INDICATOR_TREND.get(ind_id, 0) * day_offset
    noise = rng.gauss(0, INDICATOR_NOISE.get(ind_id, 1.0))
    # Occasional anomaly spike (2% chance)
    if rng.random() < 0.02:
        noise *= rng.uniform(3, 6) * (1 if rng.random() > 0.5 else -1)
    raw = base + trend_delta + noise
    clamped = max(cat["min_val"], min(cat["max_val"], raw))
    return round(clamped, 3)


def _compute_pillar_scores(readings: dict) -> dict:
    """Compute pillar-level scores from a readings dict {indicator_id: value}."""
    from app.scoring.normalise import INDICATOR_CATALOGUE as CAT
    pillar_weighted_sum = {p: 0.0 for p in PILLARS}
    pillar_weight_sum   = {p: 0.0 for p in PILLARS}
    for cat in CAT:
        raw = readings.get(cat["id"])
        norm = normalise(raw, cat["min_val"], cat["max_val"], cat["direction"])
        if norm is None:
            # impute with pillar average (simplified: use 50)
            norm = 50.0
        pillar_weighted_sum[cat["pillar"]] += norm * cat["weight"]
        pillar_weight_sum[cat["pillar"]]   += cat["weight"]
    pillar_scores = {}
    for p in PILLARS:
        w = pillar_weight_sum[p]
        pillar_scores[p] = round(pillar_weighted_sum[p] / w if w > 0 else 0, 2)
    return pillar_scores


def main():
    print("=" * 60)
    print("USAS seed.py — Day 3 Checkpoint")
    print("=" * 60)

    # ── 1. Create tables ─────────────────────────────────────────────────────
    Base.metadata.create_all(bind=engine)
    print("✅  Tables created")

    db = SessionLocal()
    try:
        # ── 2. Wards ─────────────────────────────────────────────────────────
        existing_wards = db.query(Ward).count()
        if existing_wards == 0:
            for w in WARDS:
                db.add(Ward(
                    id=w["id"], name=w["name"],
                    city="Chennai", state="Tamil Nadu",
                    lat=w["lat"], lon=w["lon"],
                    population=w["population"], area_km2=w["area_km2"],
                ))
            db.commit()
            print(f"✅  {len(WARDS)} wards inserted")
        else:
            print(f"ℹ️   Wards already present ({existing_wards} rows) — skipping")

        # ── 3. Indicators ─────────────────────────────────────────────────────
        existing_inds = db.query(Indicator).count()
        if existing_inds == 0:
            for cat in INDICATOR_CATALOGUE:
                db.add(Indicator(**cat))
            db.commit()
            print(f"✅  {len(INDICATOR_CATALOGUE)} indicators inserted")
        else:
            print(f"ℹ️   Indicators already present ({existing_inds} rows) — skipping")

        # ── 4. Readings ───────────────────────────────────────────────────────
        existing_readings = db.query(IndicatorReading).count()
        if existing_readings > 0:
            print(f"ℹ️   Readings already present ({existing_readings} rows) — skipping")
        else:
            today = date.today()
            start_date = today - timedelta(days=89)  # 90 days inclusive

            readings_batch = []
            ind_ids = [cat["id"] for cat in INDICATOR_CATALOGUE]

            for ward in WARDS:
                ward_id = ward["id"]
                profile = WARD_PROFILES[ward_id]
                rng = random.Random(hash(ward_id))  # deterministic per ward

                for day_offset in range(90):
                    current_date = start_date + timedelta(days=day_offset)
                    for ind_id in ind_ids:
                        base = profile.get(ind_id, 50.0)
                        value = _generate_value(ind_id, base, day_offset, rng)
                        is_anomaly = abs(value - base) > 3 * INDICATOR_NOISE.get(ind_id, 1.0)
                        readings_batch.append(IndicatorReading(
                            ward_id=ward_id,
                            indicator_id=ind_id,
                            reading_date=current_date,
                            value=value,
                            is_anomaly=is_anomaly,
                            source="seed",
                        ))

            # Bulk insert in chunks of 1000 for speed
            CHUNK = 1000
            for i in range(0, len(readings_batch), CHUNK):
                db.bulk_save_objects(readings_batch[i:i+CHUNK])
                db.commit()
                print(f"   → {min(i+CHUNK, len(readings_batch))}/{len(readings_batch)} readings inserted...", end="\r")

            total_readings = db.query(IndicatorReading).count()
            print(f"\n✅  {total_readings} indicator_readings inserted")

        # ── 5. Pre-compute score cache ─────────────────────────────────────────
        existing_scores = db.query(ScoreCache).count()
        if existing_scores > 0:
            print(f"ℹ️   Scores already cached ({existing_scores} rows) — skipping")
        else:
            from app.scoring.normalise import INDICATOR_CATALOGUE as CAT
            today = date.today()
            start_date = today - timedelta(days=89)
            score_batch = []

            for ward in WARDS:
                ward_id = ward["id"]
                for day_offset in range(90):
                    current_date = start_date + timedelta(days=day_offset)

                    # Pull readings for this ward × date
                    rows = (
                        db.query(IndicatorReading)
                        .filter(
                            IndicatorReading.ward_id == ward_id,
                            IndicatorReading.reading_date == current_date,
                        )
                        .all()
                    )
                    readings_map = {r.indicator_id: r.value for r in rows}

                    # Compute total score
                    total_contribution = 0.0
                    present = 0
                    for cat in CAT:
                        raw = readings_map.get(cat["id"])
                        if raw is not None:
                            present += 1
                        norm = normalise(raw, cat["min_val"], cat["max_val"], cat["direction"])
                        if norm is None:
                            norm = 50.0  # impute
                        total_contribution += norm * cat["weight"]

                    total_score = round(total_contribution, 2)
                    completeness = round(present / len(CAT), 4)
                    pillar_scores = _compute_pillar_scores(readings_map)

                    score_batch.append(ScoreCache(
                        ward_id=ward_id,
                        score_date=current_date,
                        total_score=total_score,
                        grade=score_to_grade(total_score),
                        environmental_quality=pillar_scores["environmental_quality"],
                        infrastructure_efficiency=pillar_scores["infrastructure_efficiency"],
                        public_services=pillar_scores["public_services"],
                        mobility=pillar_scores["mobility"],
                        community_wellbeing=pillar_scores["community_wellbeing"],
                        data_completeness=completeness,
                    ))

            CHUNK = 200
            for i in range(0, len(score_batch), CHUNK):
                db.bulk_save_objects(score_batch[i:i+CHUNK])
                db.commit()
                print(f"   → {min(i+CHUNK, len(score_batch))}/{len(score_batch)} scores cached...", end="\r")

            total_scores = db.query(ScoreCache).count()
            print(f"\n✅  {total_scores} score rows cached (10 wards × 90 days)")

        # ── 6. Checkpoint verification ────────────────────────────────────────
        print("\n" + "─" * 60)
        print("CHECKPOINT VERIFICATION")
        print("─" * 60)

        n_wards     = db.query(Ward).count()
        n_inds      = db.query(Indicator).count()
        n_readings  = db.query(IndicatorReading).count()
        n_scores    = db.query(ScoreCache).count()
        n_anomalies = db.query(IndicatorReading).filter(IndicatorReading.is_anomaly == True).count()

        print(f"  wards              : {n_wards}  (expected 10)")
        print(f"  indicators         : {n_inds}  (expected 20)")
        print(f"  indicator_readings : {n_readings}  (expected 18,000)")
        print(f"  scores_cache       : {n_scores}  (expected 900)")
        print(f"  anomalies flagged  : {n_anomalies}")

        assert n_wards    == 10,    f"FAIL: expected 10 wards, got {n_wards}"
        assert n_inds     == 20,    f"FAIL: expected 20 indicators, got {n_inds}"
        assert n_readings == 18000, f"FAIL: expected 18000 readings, got {n_readings}"
        assert n_scores   == 900,   f"FAIL: expected 900 score rows, got {n_scores}"

        print("\n✅  All assertions passed.")
        print("✅  API contract: frozen-day3")
        print("✅  Seed complete — M3 can build against the mocks with confidence.\n")

    finally:
        db.close()


if __name__ == "__main__":
    main()
