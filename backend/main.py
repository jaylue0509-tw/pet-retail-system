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
static_dir = "static"
if not os.path.exists(static_dir):
    static_dir = "/tmp/static"
    try:
        os.makedirs(static_dir, exist_ok=True)
    except OSError:
        pass

app.mount("/static", StaticFiles(directory=static_dir), name="static")

# 註冊 Routers
# NOTE：Vercel experimentalServices routePrefix=/api 會將 /api 前綴剈除後再傳給 FastAPI
# 所以此處 Router prefix 不需要包含 /api
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(stores.router, prefix="/stores", tags=["stores"])
app.include_router(pets.router, prefix="/pets", tags=["pets"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
app.include_router(users.router, prefix="/users", tags=["users"])

from fastapi.responses import JSONResponse
from fastapi import Request
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "details": traceback.format_exc()}
    )
