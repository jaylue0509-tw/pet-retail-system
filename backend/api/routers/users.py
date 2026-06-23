from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schema import schemas
from model import models
from api.deps import get_current_user
from service import user_service
from repository import user_repo

router = APIRouter()

def require_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="您沒有權限執行此操作")
    return current_user

@router.get("/", response_model=List[schemas.User])
def read_users(db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    return user_service.get_all_users(db)

@router.post("/", response_model=schemas.User)
def create_user(user_in: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    return user_service.create_user(db, user_in)

@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user_in: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="找不到此使用者")
    return user_service.update_user(db, db_user, user_in)

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(require_admin)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="找不到此使用者")
    user_service.delete_user(db, db_user)
    return {"detail": "已刪除使用者"}
