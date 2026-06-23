from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    address = Column(String)
    phone = Column(String)
    business_hours = Column(String)
    grooming_hours = Column(String, nullable=True)
    map_url = Column(String, nullable=True)
    license_number = Column(String, nullable=True)

    # Licenses
    can_trade_dog = Column(Boolean, default=False)
    can_trade_cat = Column(Boolean, default=False)
    can_board_dog = Column(Boolean, default=False)
    can_board_cat = Column(Boolean, default=False)
    can_board_small_animal = Column(Boolean, default=False)

    users = relationship("User", back_populates="store")
    pets = relationship("Pet", back_populates="store")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    plain_password = Column(String, nullable=True) # 測試與最高權限檢視用
    full_name = Column(String, nullable=True)      # 門市人員真實姓名
    role = Column(String) # 'admin' or 'store_manager'
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)

    store = relationship("Store", back_populates="users")

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    pet_code = Column(String, unique=True, index=True, nullable=False) # NOTE：活體編號為唯一主鍵識別
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    name = Column(String, index=True, nullable=True)
    category = Column(String, index=True, nullable=False) # '犬' or '貓'
    breed = Column(String, index=True, nullable=False)
    gender = Column(String, index=True, nullable=False) # '公' or '母'
    color = Column(String, nullable=True)
    birth_date = Column(String, nullable=False) # 格式 YYYY-MM-DD
    chip_number = Column(String, unique=True, index=True, nullable=True) # 第二辨識條件
    entry_date = Column(String, nullable=False) # 格式 YYYY-MM-DD
    price = Column(Integer, default=0)
    supplier = Column(String, nullable=True)
    status = Column(String, index=True, default="在庫") # '在庫', '已預約', '已成交', '已退貨'
    
    # 門市補充
    cover_photo = Column(String, nullable=True)
    other_photos = Column(Text, nullable=True) # 儲存 JSON array 字串
    features = Column(Text, nullable=True) # 門市個體特色說明 (50-100字)
    special_notes = Column(Text, nullable=True) # 特殊注意事項
    publish_status = Column(String, index=True, default="上架中") # '草稿', '上架中', '洽詢中', '暫停上架', '已下架'

    # 系統自動產生
    created_at = Column(DateTime, default=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by = Column(String, nullable=True)
    updated_by = Column(String, nullable=True)

    store = relationship("Store", back_populates="pets")

class PetStatusLog(Base):
    __tablename__ = "pet_status_logs"

    id = Column(Integer, primary_key=True, index=True)
    pet_code = Column(String, index=True, nullable=False)
    operator = Column(String, nullable=False)
    old_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    unpublish_reason = Column(String, nullable=True)
    unpublish_note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

