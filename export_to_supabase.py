# -*- coding: utf-8 -*-
"""
從本地 SQLite 匯出資料，產生適合 PostgreSQL (Supabase) 的 INSERT SQL
"""
import sqlite3
import json
import sys

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, str):
        # escape single quotes
        escaped = val.replace("'", "''")
        return f"'{escaped}'"
    return f"'{val}'"

conn = sqlite3.connect('backend/petsystem.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

lines = []
lines.append("-- Supabase / PostgreSQL INSERT SQL (從本地 SQLite 匯出)")
lines.append("-- 在 Supabase SQL Editor 執行本腳本")
lines.append("")

# ===== stores =====
lines.append("-- ===== stores =====")
lines.append("TRUNCATE TABLE stores CASCADE;")
c.execute("SELECT * FROM stores")
stores = c.fetchall()
for row in stores:
    d = dict(row)
    cols = ', '.join(d.keys())
    vals = ', '.join(escape_sql(v) for v in d.values())
    lines.append(f"INSERT INTO stores ({cols}) VALUES ({vals});")

lines.append("")

# ===== users =====
lines.append("-- ===== users =====")
lines.append("TRUNCATE TABLE users CASCADE;")
c.execute("SELECT * FROM users")
users = c.fetchall()
for row in users:
    d = dict(row)
    cols = ', '.join(d.keys())
    vals = ', '.join(escape_sql(v) for v in d.values())
    lines.append(f"INSERT INTO users ({cols}) VALUES ({vals});")

lines.append("")

# ===== pets =====
lines.append("-- ===== pets =====")
lines.append("TRUNCATE TABLE pets CASCADE;")
c.execute("SELECT * FROM pets")
pets = c.fetchall()
for row in pets:
    d = dict(row)
    cols = ', '.join(d.keys())
    vals = ', '.join(escape_sql(v) for v in d.values())
    lines.append(f"INSERT INTO pets ({cols}) VALUES ({vals});")

lines.append("")

# ===== pet_status_logs =====
lines.append("-- ===== pet_status_logs =====")
lines.append("TRUNCATE TABLE pet_status_logs CASCADE;")
try:
    c.execute("SELECT * FROM pet_status_logs")
    logs = c.fetchall()
    for row in logs:
        d = dict(row)
        cols = ', '.join(d.keys())
        vals = ', '.join(escape_sql(v) for v in d.values())
        lines.append(f"INSERT INTO pet_status_logs ({cols}) VALUES ({vals});")
except Exception as e:
    lines.append(f"-- 無 pet_status_logs 資料: {e}")

lines.append("")
lines.append("-- 重設 sequences (PostgreSQL 需要)")
lines.append("SELECT setval('stores_id_seq', (SELECT MAX(id) FROM stores));")
lines.append("SELECT setval('pets_id_seq', (SELECT MAX(id) FROM pets));")
lines.append("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));")

conn.close()

sql_content = '\n'.join(lines)
with open('supabase_import.sql', 'w', encoding='utf-8') as f:
    f.write(sql_content)

print(f"完成！已產生 supabase_import.sql")
print(f"  門市: {len(stores)} 筆")
print(f"  使用者: {len(users)} 筆")
print(f"  活體: {len(pets)} 筆")
