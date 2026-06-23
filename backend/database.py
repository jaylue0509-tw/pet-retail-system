import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# 載入 .env 環境變數
load_dotenv()

# 取得 DATABASE_URL，如果未設定則預設 fallback 到原本的 SQLite (開發時容錯)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./petsystem.db")

# 判斷是否為 SQLite 以決定是否需要 check_same_thread
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
# SQLAlchemy 1.4+ 建議使用 postgresql:// 而非 postgres://
if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
