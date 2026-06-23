from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from service import dashboard_service

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    獲取儀表板統計與 KPI 指標數據
    """
    return dashboard_service.get_dashboard_stats(db)
