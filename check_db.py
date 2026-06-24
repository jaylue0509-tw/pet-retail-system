# -*- coding: utf-8 -*-
import sqlite3

conn = sqlite3.connect('backend/petsystem.db')
conn.row_factory = sqlite3.Row
c = conn.cursor()

# 確認有 license 的門市（前台才顯示）
c.execute("SELECT COUNT(*) FROM stores WHERE license_number != '' AND license_number IS NOT NULL")
print("有許可證門市數:", c.fetchone()[0])

# 確認活體狀態分布
c.execute("SELECT status, COUNT(*) FROM pets GROUP BY status")
rows = c.fetchall()
print("活體狀態分布:")
for r in rows:
    status = r[0]
    count = r[1]
    print(f"  {status}: {count}")

# 確認上架狀態
c.execute("SELECT publish_status, COUNT(*) FROM pets GROUP BY publish_status")
rows = c.fetchall()
print("上架狀態分布:")
for r in rows:
    print(f"  {r[0]}: {r[1]}")

# 抓 3 筆門市資料確認
c.execute("SELECT id, name, address, license_number, can_trade_dog, can_trade_cat FROM stores WHERE license_number != '' AND license_number IS NOT NULL AND (can_trade_dog=1 OR can_trade_cat=1) LIMIT 3")
rows = c.fetchall()
print("\n有許可＆有交易資格的門市:")
for r in rows:
    print(dict(r))

conn.close()
print("完成！")
