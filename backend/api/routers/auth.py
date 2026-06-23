from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schema import schemas
from service import auth_service

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = auth_service.authenticate_user(db, user.username, user.password)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="帳號或密碼錯誤",
        )
    access_token = auth_service.create_access_token(
        data={"sub": db_user.username, "role": db_user.role, "store_id": db_user.store_id, "full_name": db_user.full_name}
    )
    return {"access_token": access_token, "token_type": "bearer"}
