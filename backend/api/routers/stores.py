from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from schema import schemas
from repository import store_repo

router = APIRouter()

@router.get("", response_model=schemas.PaginatedStores)
def get_stores(page: int = 1, size: int = 12, db: Session = Depends(get_db)):
    total, stores = store_repo.get_stores(db, page=page, size=size)
    total_pages = (total + size - 1) // size if size > 0 else 0
    return {
        "total_count": total,
        "total_pages": total_pages,
        "current_page": page,
        "items": stores
    }

@router.get("/{store_id}", response_model=schemas.Store)
def get_store(store_id: int, db: Session = Depends(get_db)):
    store = store_repo.get_store(db, store_id)
    if store is None:
        raise HTTPException(status_code=404, detail="找不到該門市")
    return store
