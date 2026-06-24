import psycopg2
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

neon_url = 'postgresql://neondb_owner:npg_3UNBtaikxWe7@ep-late-credit-ate5mpw7.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require'
conn = psycopg2.connect(neon_url)
cur = conn.cursor()

# Find 桃園巨蛋店
cur.execute("SELECT id, name FROM stores WHERE name LIKE '%桃園巨蛋%'")
store = cur.fetchone()
if not store:
    print("Store not found")
    sys.exit(0)

store_id = store[0]
print('Store ID:', store_id, 'Name:', store[1])

cur.execute('SELECT category, breed, status, publish_status, pet_code FROM pets WHERE store_id = %s', (store_id,))
pets = cur.fetchall()

print('Total pets in DB:', len(pets))

active = [p for p in pets if p[3] == '上架中']
print('Active pets:', len(active))

dogs = [p for p in active if p[0] == '犬']
cats = [p for p in active if p[0] == '貓']
print(f'Active Dogs: {len(dogs)}, Active Cats: {len(cats)}')

print("\n--- ACTIVE PET LIST ---")
for p in active:
    print(f"Code: {p[4]}, Category: {p[0]}, Breed: {p[1]}, Status: {p[2]}, Publish: {p[3]}")
