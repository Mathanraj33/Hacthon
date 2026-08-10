"""
routers/wards.py — GET /api/v1/wards and GET /api/v1/wards/{ward_id}
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Ward
from app.schemas import WardOut, WardListOut

router = APIRouter(prefix="/api/v1/wards", tags=["wards"])


@router.get("", response_model=WardListOut)
def list_wards(db: Session = Depends(get_db)):
    wards = db.query(Ward).order_by(Ward.id).all()
    return WardListOut(wards=[WardOut.model_validate(w) for w in wards], total=len(wards))


@router.get("/{ward_id}", response_model=WardOut)
def get_ward(ward_id: str, db: Session = Depends(get_db)):
    ward = db.query(Ward).filter(Ward.id == ward_id).first()
    if not ward:
        raise HTTPException(status_code=404, detail=f"Ward '{ward_id}' not found.")
    return WardOut.model_validate(ward)
