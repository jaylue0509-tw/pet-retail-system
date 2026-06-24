from sqlalchemy.orm import Session
from datetime import datetime
from repository import pet_repo
from model import models
from schema import schemas

def get_filtered_pets(
    db: Session,
    category: str = None,
    breed: str = None,
    gender: str = None,
    store_id: int = None,
    color: str = None,
    status_filter: str = "在庫",
    publish_status_filter: str = "前台展示",
    min_age_months: int = None,
    max_age_months: int = None,
    min_days: int = None,
    max_days: int = None,
    sort_by: str = None,
    page: int = 1,
    size: int = 20
):
    skip = (page - 1) * size
    pets = pet_repo.get_pets(
        db, category, breed, gender, store_id, color, status_filter, publish_status_filter
    )

    now = datetime.now()
    filtered_pets = []
    
    for pet in pets:
        try:
            birth = datetime.strptime(pet.birth_date, "%Y-%m-%d")
            age_months = (now.year - birth.year) * 12 + now.month - birth.month
        except:
            age_months = 0

        try:
            entry = datetime.strptime(pet.entry_date, "%Y-%m-%d")
            days_in_store = (now - entry).days
        except:
            days_in_store = 0

        if min_age_months is not None and age_months < min_age_months:
            continue
        if max_age_months is not None and age_months > max_age_months:
            continue
        if min_days is not None and days_in_store < min_days:
            continue
        if max_days is not None and days_in_store > max_days:
            continue

        filtered_pets.append(pet)

    if sort_by == 'days_asc':
        filtered_pets.sort(key=lambda p: p.entry_date, reverse=True)
    elif sort_by == 'days_desc':
        filtered_pets.sort(key=lambda p: p.entry_date)
    elif sort_by == 'price_asc':
        filtered_pets.sort(key=lambda p: p.price)
    elif sort_by == 'price_desc':
        filtered_pets.sort(key=lambda p: p.price, reverse=True)
    elif sort_by == 'updated_desc':
        filtered_pets.sort(key=lambda p: p.updated_at or p.created_at, reverse=True)

    total = len(filtered_pets)
    return total, filtered_pets[skip : skip + size]

def update_pet_info(db: Session, db_pet: models.Pet, pet_update: schemas.PetUpdate, current_user: models.User):
    old_status = db_pet.publish_status
    base_name = current_user.full_name if current_user.full_name else current_user.username
    if current_user.role == 'admin':
        operator_name = f"{base_name} (總部)"
    elif current_user.store:
        operator_name = f"{base_name} ({current_user.store.name})"
    else:
        operator_name = base_name

    if pet_update.publish_status is not None and pet_update.publish_status != old_status:
        new_status = pet_update.publish_status
        operator = pet_update.operator or operator_name
        status_log = models.PetStatusLog(
            pet_code=db_pet.pet_code,
            operator=operator,
            old_status=old_status,
            new_status=new_status,
            unpublish_reason=pet_update.unpublish_reason if new_status == "已下架" else None,
            unpublish_note=pet_update.unpublish_note if new_status == "已下架" else None,
            created_at=datetime.utcnow()
        )
        pet_repo.create_pet_status_log(db, status_log)

    update_data = pet_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key not in ["operator", "unpublish_reason", "unpublish_note"]:
            setattr(db_pet, key, value)

    db_pet.updated_at = datetime.utcnow()
    db_pet.updated_by = operator_name
    if db_pet.publish_status in ["上架中", "洽詢中"] and db_pet.published_at is None:
        db_pet.published_at = datetime.utcnow()

    db.commit()
    db.refresh(db_pet)
    return db_pet
