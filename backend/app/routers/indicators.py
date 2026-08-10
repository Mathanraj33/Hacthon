"""
routers/indicators.py — GET /api/v1/indicators
"""
from fastapi import APIRouter
from app.schemas import IndicatorOut, IndicatorListOut
from app.scoring.normalise import INDICATOR_CATALOGUE

router = APIRouter(prefix="/api/v1/indicators", tags=["indicators"])


@router.get("", response_model=IndicatorListOut)
def list_indicators():
    """Return the full indicator catalogue (config-driven, not DB-dependent)."""
    items = [IndicatorOut(**cat) for cat in INDICATOR_CATALOGUE]
    return IndicatorListOut(indicators=items, total=len(items))
