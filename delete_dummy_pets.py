import psycopg2

neon_url = 'postgresql://neondb_owner:npg_3UNBtaikxWe7@ep-late-credit-ate5mpw7.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require'
conn = psycopg2.connect(neon_url)
cur = conn.cursor()

cur.execute("SELECT count(*) FROM pets WHERE pet_code LIKE 'D11%' OR pet_code LIKE 'C11%'")
count = cur.fetchone()[0]
print(f"Found {count} dummy pets to delete.")

cur.execute("DELETE FROM pets WHERE pet_code LIKE 'D11%' OR pet_code LIKE 'C11%'")
conn.commit()

print(f"Deleted dummy pets.")
