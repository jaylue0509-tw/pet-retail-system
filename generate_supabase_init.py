# -*- coding: utf-8 -*-
"""
產生完整的 Supabase 初始化 SQL：先建表格，再匯入資料
"""
import sqlite3

# SQLite 用 0/1 儲存布林值，但 PostgreSQL 需要 TRUE/FALSE
BOOLEAN_COLUMNS = {
    'stores': {'can_trade_dog', 'can_trade_cat', 'can_board_dog', 'can_board_cat', 'can_board_small_animal'},
}

def escape_sql(val, col_name=None, table_name=None):
    """將 Python 值轉換為 PostgreSQL 相容的 SQL 字面值"""
    # 處理 NULL
    if val is None:
        return "NULL"
    # 布林欄位：將 SQLite 的 0/1 轉換為 PostgreSQL 的 TRUE/FALSE
    if table_name and col_name:
        bool_cols = BOOLEAN_COLUMNS.get(table_name, set())
        if col_name in bool_cols:
            return "TRUE" if val else "FALSE"
    # 整數 / 浮點數
    if isinstance(val, (int, float)):
        return str(int(val)) if isinstance(val, float) and val == int(val) else str(val)
    # 字串（跳脫單引號）
    if isinstance(val, str):
        escaped = val.replace("'", "''")
        return f"'{escaped}'"
    return f"'{val}'"

conn = sqlite3.connect('backend/petsystem.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

lines = []
lines.append("-- ============================================================")
lines.append("-- Supabase 初始化腳本：建立資料表 + 匯入資料")
lines.append("-- 請在 Supabase SQL Editor 貼上後點 Run 執行")
lines.append("-- ============================================================")
lines.append("")

# ===== CREATE TABLES =====
lines.append("-- ===== 建立資料表結構 =====")
lines.append("")
lines.append("""CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    address VARCHAR,
    phone VARCHAR,
    business_hours VARCHAR,
    grooming_hours VARCHAR,
    map_url VARCHAR,
    license_number VARCHAR,
    can_trade_dog BOOLEAN DEFAULT FALSE,
    can_trade_cat BOOLEAN DEFAULT FALSE,
    can_board_dog BOOLEAN DEFAULT FALSE,
    can_board_cat BOOLEAN DEFAULT FALSE,
    can_board_small_animal BOOLEAN DEFAULT FALSE
);""")
lines.append("")

lines.append("""CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE,
    password_hash VARCHAR,
    plain_password VARCHAR,
    full_name VARCHAR,
    role VARCHAR,
    store_id INTEGER REFERENCES stores(id)
);""")
lines.append("")

lines.append("""CREATE TABLE IF NOT EXISTS pets (
    id SERIAL PRIMARY KEY,
    pet_code VARCHAR UNIQUE NOT NULL,
    store_id INTEGER NOT NULL REFERENCES stores(id),
    name VARCHAR,
    category VARCHAR NOT NULL,
    breed VARCHAR NOT NULL,
    gender VARCHAR NOT NULL,
    color VARCHAR,
    birth_date VARCHAR NOT NULL,
    chip_number VARCHAR UNIQUE,
    entry_date VARCHAR NOT NULL,
    price INTEGER DEFAULT 0,
    supplier VARCHAR,
    status VARCHAR DEFAULT '在庫',
    cover_photo VARCHAR,
    other_photos TEXT,
    features TEXT,
    special_notes TEXT,
    publish_status VARCHAR DEFAULT '上架中',
    created_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR,
    updated_by VARCHAR
);""")
lines.append("")

lines.append("""CREATE TABLE IF NOT EXISTS pet_status_logs (
    id SERIAL PRIMARY KEY,
    pet_code VARCHAR NOT NULL,
    operator VARCHAR NOT NULL,
    old_status VARCHAR,
    new_status VARCHAR NOT NULL,
    unpublish_reason VARCHAR,
    unpublish_note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);""")
lines.append("")

# ===== CLEAR DATA =====
lines.append("-- ===== 清除舊資料（如有）=====")
lines.append("TRUNCATE TABLE pet_status_logs CASCADE;")
lines.append("TRUNCATE TABLE pets CASCADE;")
lines.append("TRUNCATE TABLE users CASCADE;")
lines.append("TRUNCATE TABLE stores CASCADE;")
lines.append("")

# ===== INSERT stores =====
lines.append("-- ===== 匯入門市資料 =====")
c.execute("SELECT * FROM stores")
stores = c.fetchall()
for row in stores:
    d = dict(row)
    cols = ', '.join(d.keys())
    vals = ', '.join(escape_sql(v, col_name=k, table_name='stores') for k, v in d.items())
    lines.append(f"INSERT INTO stores ({cols}) VALUES ({vals});")

lines.append("")

# ===== INSERT users =====
lines.append("-- ===== 匯入使用者資料 =====")
c.execute("SELECT * FROM users")
users = c.fetchall()
for row in users:
    d = dict(row)
    cols = ', '.join(d.keys())
    vals = ', '.join(escape_sql(v) for v in d.values())
    lines.append(f"INSERT INTO users ({cols}) VALUES ({vals});")

lines.append("")

# ===== INSERT pets =====
lines.append("-- ===== 匯入活體資料 =====")
c.execute("SELECT * FROM pets")
pets = c.fetchall()
for row in pets:
    d = dict(row)
    cols = ', '.join(d.keys())
    vals = ', '.join(escape_sql(v) for v in d.values())
    lines.append(f"INSERT INTO pets ({cols}) VALUES ({vals});")

lines.append("")

# ===== INSERT pet_status_logs =====
lines.append("-- ===== 匯入活體狀態記錄 =====")
try:
    c.execute("SELECT * FROM pet_status_logs")
    logs = c.fetchall()
    if logs:
        for row in logs:
            d = dict(row)
            cols = ', '.join(d.keys())
            vals = ', '.join(escape_sql(v) for v in d.values())
            lines.append(f"INSERT INTO pet_status_logs ({cols}) VALUES ({vals});")
    else:
        lines.append("-- 無 pet_status_logs 資料")
except Exception as e:
    lines.append(f"-- 無 pet_status_logs 資料: {e}")

lines.append("")

# ===== RESET SEQUENCES =====
lines.append("-- ===== 重設 Sequence（讓新增資料 ID 不衝突）=====")
lines.append("SELECT setval('stores_id_seq', (SELECT MAX(id) FROM stores));")
lines.append("SELECT setval('pets_id_seq', (SELECT MAX(id) FROM pets));")
lines.append("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));")

conn.close()

sql_content = '\n'.join(lines)
with open('supabase_full_init.sql', 'w', encoding='utf-8') as f:
    f.write(sql_content)

print(f"完成！已產生 supabase_full_init.sql")
print(f"  門市: {len(stores)} 筆")
print(f"  使用者: {len(users)} 筆")
print(f"  活體: {len(pets)} 筆")
print(f"  請開啟 Supabase SQL Editor，貼上此檔案內容後執行！")
