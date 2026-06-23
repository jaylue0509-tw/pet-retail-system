from sqlalchemy.orm import Session
from typing import List
from model import models

def get_stores(db: Session, page: int = 1, size: int = 12):
    skip = (page - 1) * size
    total = db.query(models.Store).count()
    stores = db.query(models.Store).offset(skip).limit(size).all()
    return total, stores

def get_store(db: Session, store_id: int):
    return db.query(models.Store).filter(models.Store.id == store_id).first()

def get_store_by_name(db: Session, store_name: str):
    return db.query(models.Store).filter(models.Store.name.like(f"%{store_name}%")).first()

def count_total_stores_with_license(db: Session) -> int:
    return db.query(models.Store).filter(models.Store.license_number != None).count()
