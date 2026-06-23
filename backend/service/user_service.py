from sqlalchemy.orm import Session
from passlib.context import CryptContext
from repository import user_repo
from model import models
from schema import schemas
from fastapi import HTTPException

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def create_user(db: Session, user_in: schemas.UserCreate):
    db_user = user_repo.get_user_by_username(db, username=user_in.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user_in.password)
    user = models.User(
        username=user_in.username,
        full_name=user_in.full_name,
        role=user_in.role,
        store_id=user_in.store_id,
        password_hash=hashed_password,
        plain_password=user_in.password
    )
    return user_repo.create_user(db, user)

def update_user(db: Session, db_user: models.User, user_update: schemas.UserUpdate):
    if user_update.full_name is not None:
        db_user.full_name = user_update.full_name
    if user_update.role is not None:
        db_user.role = user_update.role
    if user_update.store_id is not None:
        db_user.store_id = user_update.store_id
    if user_update.password is not None and user_update.password != "":
        db_user.password_hash = get_password_hash(user_update.password)
        db_user.plain_password = user_update.password
        
    return user_repo.update_user(db, db_user)

def get_all_users(db: Session):
    return user_repo.get_all_users(db)

def delete_user(db: Session, db_user: models.User):
    user_repo.delete_user(db, db_user)
