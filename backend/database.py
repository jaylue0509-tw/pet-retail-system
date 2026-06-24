import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# è¼‰å…¥ .env ?°å?è®Šæ•¸
load_dotenv()

# ?–å? DATABASE_URLï¼Œå??œæœªè¨­å??‡å„ª?ˆæ‰¾ Vercel ?ä???POSTGRES_URLï¼Œå? fallback ??SQLite
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("POSTGRES_URL", "postgresql://neondb_owner:npg_3UNBtaikxWe7@ep-late-credit-ate5mpw7.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require")

# ?¤æ–·?¯å¦??SQLite ä»¥æ±ºå®šæ˜¯?¦é?è¦?check_same_thread
connect_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
# SQLAlchemy 1.4+ å»ºè­°ä½¿ç”¨ postgresql:// ?Œé? postgres://
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
