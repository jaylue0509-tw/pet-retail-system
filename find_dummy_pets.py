import psycopg2

neon_url = 'postgresql://neondb_owner:npg_3UNBtaikxWe7@ep-late-credit-ate5mpw7.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require'
conn = psycopg2.connect(neon_url)
cur = conn.cursor()

cur.execute("SELECT id, pet_code, store_id FROM pets WHERE pet_code NOT LIKE 'ET%'")
dummy_pets = cur.fetchall()

print('Dummy pets count:', len(dummy_pets))
for p in dummy_pets:
    print(p)
