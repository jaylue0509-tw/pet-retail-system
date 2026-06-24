import sqlite3
from sqlalchemy import create_engine
from model.models import Base

sqlite_url = "petsystem.db"
neon_url = "postgresql://neondb_owner:npg_3UNBtaikxWe7@ep-late-credit-ate5mpw7.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"

print("Connecting to Neon...")
neon_engine = create_engine(neon_url, pool_pre_ping=True)
print("Creating tables...")
Base.metadata.create_all(neon_engine)
print("Tables ready.")

conn_sqlite = sqlite3.connect(sqlite_url)
cur_sqlite = conn_sqlite.cursor()

def migrate():
    with neon_engine.begin() as conn_neon:
        dbapi_conn = conn_neon.connection
        dbapi_cur = dbapi_conn.cursor()
        print("Migrating stores...")
        cur_sqlite.execute("SELECT id, name, address, phone FROM stores")
        stores = cur_sqlite.fetchall()
        if stores:
            dbapi_cur.executemany(
                "INSERT INTO stores (id, name, address, phone) VALUES (%s, %s, %s, %s) ON CONFLICT (id) DO NOTHING",
                stores
            )
        print(f"Stores done: {len(stores)}")

        print("Migrating pets...")
        cur_sqlite.execute("""
            SELECT id, pet_code, store_id, name, category, breed, gender, color, birth_date, chip_number, entry_date, price, supplier, status, cover_photo, other_photos, features, special_notes, created_at, published_at, updated_at, created_by, updated_by 
            FROM pets
        """)
        pets = cur_sqlite.fetchall()
        if pets:
            # chunk by 100
            for i in range(0, len(pets), 100):
                chunk = pets[i:i+100]
                dbapi_cur.executemany(
                    "INSERT INTO pets (id, pet_code, store_id, name, category, breed, gender, color, birth_date, chip_number, entry_date, price, supplier, status, cover_photo, other_photos, features, special_notes, created_at, published_at, updated_at, created_by, updated_by) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING",
                    chunk
                )
                print(f"Inserted pets {i} to {i+len(chunk)}")
        print(f"Pets done: {len(pets)}")

if __name__ == "__main__":
    migrate()
    print("Migration completely finished!")
