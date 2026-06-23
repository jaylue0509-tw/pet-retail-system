from pydantic import BaseModel, computed_field
from typing import List, Optional
from datetime import datetime

class PetBase(BaseModel):
    pet_code: str
    name: Optional[str] = None
    category: str # '犬' or '貓'
    breed: str
    gender: str # '公' or '母'
    color: Optional[str] = None
    birth_date: str # YYYY-MM-DD
    chip_number: Optional[str] = None
    entry_date: str # YYYY-MM-DD
    price: int = 0
    supplier: Optional[str] = None
    status: str = "在庫"
    cover_photo: Optional[str] = None
    other_photos: Optional[str] = None # JSON string
    features: Optional[str] = None
    special_notes: Optional[str] = None
    publish_status: str = "上架中" # '草稿', '上架中', '洽詢中', '暫停上架', '已下架'

class PetCreate(PetBase):
    pass

class PetUpdate(BaseModel):
    # 門市補充修改時使用的 Schema
    cover_photo: Optional[str] = None
    other_photos: Optional[str] = None
    features: Optional[str] = None
    special_notes: Optional[str] = None
    publish_status: Optional[str] = None
    unpublish_reason: Optional[str] = None
    unpublish_note: Optional[str] = None
    operator: Optional[str] = None # 提供給狀態異動紀錄使用

class Pet(PetBase):
    id: int
    store_id: int
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True

class PetStatusLogBase(BaseModel):
    pet_code: str
    operator: str
    old_status: Optional[str] = None
    new_status: str
    unpublish_reason: Optional[str] = None
    unpublish_note: Optional[str] = None

class PetStatusLogCreate(PetStatusLogBase):
    pass


class PetStatusLog(PetStatusLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

    @computed_field
    @property
    def current_age_months(self) -> int:
        """
        計算出生日期到當前日期的即時月齡
        """
        try:
            birth = datetime.strptime(self.birth_date, "%Y-%m-%d")
            now = datetime.now()
            months = (now.year - birth.year) * 12 + now.month - birth.month
            return max(0, months)
        except Exception:
            return 0

    @computed_field
    @property
    def days_in_store(self) -> int:
        """
        計算進貨日期到目前的在庫天數
        """
        try:
            entry = datetime.strptime(self.entry_date, "%Y-%m-%d")
            now = datetime.now()
            delta = now - entry
            return max(0, delta.days)
        except Exception:
            return 0

class StoreBase(BaseModel):
    name: str
    address: str
    phone: str
    business_hours: str
    grooming_hours: Optional[str] = None
    map_url: Optional[str] = None
    license_number: Optional[str] = None
    can_trade_dog: bool = False
    can_trade_cat: bool = False
    can_board_dog: bool = False
    can_board_cat: bool = False
    can_board_small_animal: bool = False

class StoreCreate(StoreBase):
    pass

class Store(StoreBase):
    id: int
    pets: List[Pet] = []

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class PaginatedPets(BaseModel):
    total_count: int
    total_pages: int
    current_page: int
    items: List[Pet]

class PaginatedStores(BaseModel):
    total_count: int
    total_pages: int
    current_page: int
    items: List[Store]

class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None
    role: str
    store_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    store_id: Optional[int] = None
    password: Optional[str] = None

class User(UserBase):
    id: int
    plain_password: Optional[str] = None

    class Config:
        from_attributes = True
