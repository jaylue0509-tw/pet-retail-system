from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from database import engine
from model import models
from api.routers import auth, stores, pets, dashboard, users

# 確保靜態檔案上傳目錄存在
try:
    os.makedirs("static/uploads", exist_ok=True)
except OSError:
    # 支援 Vercel 等 Serverless 唯讀環境下的啟動
    pass

# 建立資料庫表格
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pet System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 掛載靜態檔案目錄
app.mount("/static", StaticFiles(directory="static"), name="static")

# 註冊 Routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(stores.router, prefix="/api/stores", tags=["stores"])
app.include_router(pets.router, prefix="/api/pets", tags=["pets"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
