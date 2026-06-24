from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import time
import random
from io import BytesIO
from PIL import Image
from supabase import create_client, Client

from database import get_db
from schema import schemas
from model import models
from api.deps import get_current_user
from repository import pet_repo
from service import pet_service, erp_service

router = APIRouter()

@router.get("", response_model=schemas.PaginatedPets)
def get_pets(
    category: Optional[str] = None,
    breed: Optional[str] = None,
    gender: Optional[str] = None,
    store_id: Optional[int] = None,
    color: Optional[str] = None,
    status_filter: Optional[str] = "在庫",
    publish_status_filter: Optional[str] = "上架中",
    min_age_months: Optional[int] = None,
    max_age_months: Optional[int] = None,
    min_days: Optional[int] = None,
    max_days: Optional[int] = None,
    sort_by: Optional[str] = None,
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db)
):
    total, pets = pet_service.get_filtered_pets(
        db, category, breed, gender, store_id, color, status_filter, publish_status_filter,
        min_age_months, max_age_months, min_days, max_days, sort_by, page, size
    )
    total_pages = (total + size - 1) // size if size > 0 else 0
    return {
        "total_count": total,
        "total_pages": total_pages,
        "current_page": page,
        "items": pets
    }

@router.get("/{pet_code}", response_model=schemas.Pet)
def get_pet(pet_code: str, db: Session = Depends(get_db)):
    pet = pet_repo.get_pet_by_code(db, pet_code)
    if pet is None:
        raise HTTPException(status_code=404, detail="找不到該活體資料")
    return pet

@router.put("/{pet_code}", response_model=schemas.Pet)
def update_pet(
    pet_code: str, 
    pet_update: schemas.PetUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    db_pet = pet_repo.get_pet_by_code(db, pet_code)
    if not db_pet:
        raise HTTPException(status_code=404, detail="找不到該活體資料")

    if current_user.role == "store_manager" and current_user.store_id != db_pet.store_id:
        raise HTTPException(status_code=403, detail="您無權修改其他門市的活體資料")

    if pet_update.features:
        char_count = len(pet_update.features.strip())
        if char_count < 50 or char_count > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="個體特色說明必須在 50 至 100 字之間！"
            )

    return pet_service.update_pet_info(db, db_pet, pet_update, current_user)

@router.get("/{pet_code}/status-logs", response_model=List[schemas.PetStatusLog])
def get_pet_status_logs(pet_code: str, db: Session = Depends(get_db)):
    return pet_repo.get_pet_status_logs(db, pet_code)

@router.post("/upload-photo")
async def upload_photo(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    if not SUPABASE_URL or not SUPABASE_KEY:
        raise HTTPException(status_code=500, detail="系統未設定 Supabase Storage 憑證 (SUPABASE_URL, SUPABASE_KEY)，請聯繫管理員。")

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    ext = os.path.splitext(file.filename)[1]
    if ext.lower() not in [".jpg", ".jpeg", ".png", ".webp", ".heic"]:
        raise HTTPException(status_code=400, detail="不支援的檔案格式，請上傳 JPG, PNG 或 WEBP。")

    try:
        content = await file.read()
        img = Image.open(BytesIO(content))

        # Convert to RGB if necessary
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")

        # Resize if width > 1200
        max_width = 1200
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

        # Compress to WebP
        out_buffer = BytesIO()
        img.save(out_buffer, format="WebP", quality=80)
        out_bytes = out_buffer.getvalue()

        # Upload to Supabase
        filename = f"{int(time.time())}_{random.randint(1000, 9999)}.webp"
        supabase.storage.from_("pet-images").upload(
            path=filename,
            file=out_bytes,
            file_options={"content-type": "image/webp"}
        )
        
        public_url = supabase.storage.from_("pet-images").get_public_url(filename)
        return {"url": public_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上傳圖片失敗: {str(e)}")

@router.post("/import")
async def import_erp_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="只有系統管理員可以執行 ERP 資料同步")

    try:
        contents = await file.read()
        result = erp_service.import_csv_data(db, contents, current_user.username)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
