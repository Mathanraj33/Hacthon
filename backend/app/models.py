"""
models.py — SQLAlchemy ORM models.
Schema:
  wards              → city ward master table
  indicators         → indicator catalogue (metadata only)
  indicator_readings → time-series readings (the big table, ~18k rows seeded)
  scores_cache       → pre-computed composite scores per ward per day
"""
from __future__ import annotations
from datetime import date, datetime
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, Date, DateTime,
    ForeignKey, UniqueConstraint, Text, func,
)
from app.database import Base


class Ward(Base):
    __tablename__ = "wards"

    id          = Column(String(20),  primary_key=True)  # e.g. "ward-001"
    name        = Column(String(100), nullable=False)
    city        = Column(String(100), nullable=False, default="Chennai")
    state       = Column(String(100), nullable=False, default="Tamil Nadu")
    lat         = Column(Float,       nullable=False)
    lon         = Column(Float,       nullable=False)
    population  = Column(Integer,     nullable=False)
    area_km2    = Column(Float,       nullable=False)
    created_at  = Column(DateTime,    server_default=func.now())

    def __repr__(self) -> str:
        return f"<Ward {self.id} {self.name}>"


class Indicator(Base):
    __tablename__ = "indicators"

    id          = Column(String(50),  primary_key=True)  # e.g. "pm25"
    label       = Column(String(100), nullable=False)
    unit        = Column(String(30),  nullable=False)
    pillar      = Column(String(50),  nullable=False)    # one of 5 S-50 pillars
    direction   = Column(String(10),  nullable=False)    # "lower_better" | "higher_better"
    weight      = Column(Float,       nullable=False)    # contribution weight (sums to 1.0)
    min_val     = Column(Float,       nullable=False)    # normalisation lower bound
    max_val     = Column(Float,       nullable=False)    # normalisation upper bound
    who_target  = Column(Float,       nullable=True)     # WHO/SDG benchmark
    source      = Column(String(50),  nullable=False)    # "open-meteo" | "cpcb" | "osm" | "seed"
    description = Column(Text,        nullable=True)

    def __repr__(self) -> str:
        return f"<Indicator {self.id}>"


class IndicatorReading(Base):
    __tablename__ = "indicator_readings"

    id           = Column(Integer,    primary_key=True, autoincrement=True)
    ward_id      = Column(String(20), ForeignKey("wards.id",       ondelete="CASCADE"), nullable=False)
    indicator_id = Column(String(50), ForeignKey("indicators.id",  ondelete="CASCADE"), nullable=False)
    reading_date = Column(Date,       nullable=False)
    value        = Column(Float,      nullable=True)    # NULL = missing / sensor fault
    is_anomaly   = Column(Boolean,    nullable=False, default=False)
    source       = Column(String(50), nullable=False, default="seed")
    created_at   = Column(DateTime,   server_default=func.now())

    __table_args__ = (
        UniqueConstraint("ward_id", "indicator_id", "reading_date", name="uq_reading"),
    )

    def __repr__(self) -> str:
        return f"<Reading ward={self.ward_id} ind={self.indicator_id} date={self.reading_date} val={self.value}>"


class ScoreCache(Base):
    """
    Pre-computed scores per ward per day.
    Re-computed whenever readings change or on demand.
    """
    __tablename__ = "scores_cache"

    id                          = Column(Integer,    primary_key=True, autoincrement=True)
    ward_id                     = Column(String(20), ForeignKey("wards.id", ondelete="CASCADE"), nullable=False)
    score_date                  = Column(Date,       nullable=False)
    total_score                 = Column(Float,      nullable=False)
    grade                       = Column(String(5),  nullable=False)
    environmental_quality       = Column(Float,      nullable=False)
    infrastructure_efficiency   = Column(Float,      nullable=False)
    public_services             = Column(Float,      nullable=False)
    mobility                    = Column(Float,      nullable=False)
    community_wellbeing         = Column(Float,      nullable=False)
    data_completeness           = Column(Float,      nullable=False)  # 0.0–1.0
    computed_at                 = Column(DateTime,   server_default=func.now())

    __table_args__ = (
        UniqueConstraint("ward_id", "score_date", name="uq_score"),
    )
