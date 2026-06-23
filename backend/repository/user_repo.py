from sqlalchemy.orm import Session
from model import models

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_all_users(db: Session):
    return db.query(models.User).all()

def create_user(db: Session, user: models.User):
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def update_user(db: Session, user: models.User):
    db.commit()
    db.refresh(user)
    return user

def delete_user(db: Session, user: models.User):
    db.delete(user)
    db.commit()
