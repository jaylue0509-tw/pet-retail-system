from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from model import models

def get_pets(
    db: Session,
    category: Optional[str] = None,
    breed: Optional[str] = None,
    gender: Optional[str] = None,
    store_id: Optional[int] = None,
    color: Optional[str] = None,
    status_filter: Optional[str] = None,
    publish_status_filter: Optional[str] = None
) -> List[models.Pet]:
    query = db.query(models.Pet)

    if category:
        query = query.filter(models.Pet.category == category)
    if breed:
        query = query.filter(models.Pet.breed.like(f"%{breed}%"))
    if gender:
        query = query.filter(models.Pet.gender == gender)
    if store_id:
        query = query.filter(models.Pet.store_id == store_id)
    if color:
        query = query.filter(models.Pet.color.like(f"%{color}%"))
    if status_filter and status_filter != "all":
        query = query.filter(models.Pet.status == status_filter)
        
    if publish_status_filter == "前台展示":
        query = query.filter(models.Pet.publish_status.in_(["上架中", "洽詢中"]))
    elif publish_status_filter and publish_status_filter != "all":
        query = query.filter(models.Pet.publish_status == publish_status_filter)

    return query.all()

def get_pet_by_code(db: Session, pet_code: str) -> Optional[models.Pet]:
    return db.query(models.Pet).filter(models.Pet.pet_code == pet_code).first()

def create_pet(db: Session, pet: models.Pet) -> models.Pet:
    db.add(pet)
    db.commit()
    db.refresh(pet)
    return pet

def create_pet_status_log(db: Session, log: models.PetStatusLog) -> models.PetStatusLog:
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def get_pet_status_logs(db: Session, pet_code: str) -> List[models.PetStatusLog]:
    return db.query(models.PetStatusLog).filter(
        models.PetStatusLog.pet_code == pet_code
    ).order_by(models.PetStatusLog.created_at.desc()).all()

# --- Dashboard Queries ---
def count_active_stores(db: Session) -> int:
    return db.query(func.count(func.distinct(models.Pet.store_id))).filter(
        models.Pet.publish_status == "上架中",
        models.Pet.status == "在庫"
    ).scalar() or 0

def count_published_pets(db: Session) -> int:
    return db.query(models.Pet).filter(
        models.Pet.publish_status == "上架中",
        models.Pet.status == "在庫"
    ).count()

def count_published_pets_by_category(db: Session, category: str) -> int:
    return db.query(models.Pet).filter(
        models.Pet.publish_status == "上架中",
        models.Pet.status == "在庫",
        models.Pet.category == category
    ).count()

def count_new_pets_since(db: Session, since: datetime) -> int:
    return db.query(models.Pet).filter(
        models.Pet.publish_status == "上架中",
        models.Pet.created_at >= since
    ).count()

def count_sold_pets_since(db: Session, since: datetime) -> int:
    return db.query(models.Pet).filter(
        models.Pet.status == "已成交",
        models.Pet.updated_at >= since
    ).count()

def count_stale_pets(db: Session, until: datetime) -> int:
    return db.query(models.Pet).filter(
        models.Pet.publish_status == "上架中",
        models.Pet.status == "在庫",
        models.Pet.updated_at <= until
    ).count()

from sqlalchemy.orm import joinedload

def get_active_pets_with_store(db: Session) -> List[models.Pet]:
    return db.query(models.Pet).options(joinedload(models.Pet.store)).filter(
        models.Pet.publish_status == "上架中",
        models.Pet.status == "在庫"
    ).all()

def count_northstar_metric(db: Session, since: datetime) -> int:
    return db.query(models.Pet).filter(
        models.Pet.status == "在庫",
        models.Pet.publish_status == "上架中",
        models.Pet.cover_photo != None,
        models.Pet.cover_photo != "",
        models.Pet.updated_at >= since
    ).count()

def count_total_active_pets(db: Session) -> int:
    return db.query(models.Pet).filter(models.Pet.status == "在庫").count()

def count_pets_with_photo(db: Session) -> int:
    return db.query(models.Pet).filter(
        models.Pet.status == "在庫",
        models.Pet.publish_status == "上架中",
        models.Pet.cover_photo != None,
        models.Pet.cover_photo != ""
    ).count()

def count_sold_but_published(db: Session) -> int:
    return db.query(models.Pet).filter(
        models.Pet.status == "已成交",
        models.Pet.publish_status == "上架中"
    ).count()

def count_total_sold_pets(db: Session) -> int:
    return db.query(models.Pet).filter(models.Pet.status == "已成交").count()
