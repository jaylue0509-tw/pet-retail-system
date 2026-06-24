import sqlite3
from sqlalchemy import create_engine

sqlite_url = "petsystem.db"
neon_url = "postgresql://neondb_owner:npg_3UNBtaikxWe7@ep-late-credit-ate5mpw7.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"

neon_engine = create_engine(neon_url)

conn_sqlite = sqlite3.connect(sqlite_url)
cur_sqlite = conn_sqlite.cursor()

def fix_data():
    with neon_engine.begin() as conn_neon:
        dbapi_conn = conn_neon.connection
        dbapi_cur = dbapi_conn.cursor()

        print("Migrating users...")
        # SQLite users schema: id, username, password_hash, role, store_id
        # Neon users schema: id, username, hashed_password, full_name, role, store_id, created_at, updated_at
        # Let's check Neon users schema:
        cur_sqlite.execute("SELECT id, username, password_hash, role, store_id FROM users")
        users = cur_sqlite.fetchall()
        if users:
            # We must map to the Neon users table
            # Let's just use raw SQL to insert them
            dbapi_cur.executemany(
                "INSERT INTO users (id, username, password_hash, full_name, role, store_id) VALUES (%s, %s, %s, 'Admin', %s, %s) ON CONFLICT (id) DO NOTHING",
                users
            )
        print(f"Users done: {len(users)}")

        print("Updating publish_status for all pets...")
        # They should be '上架中' by default according to the model
        dbapi_cur.execute("UPDATE pets SET publish_status = '上架中' WHERE publish_status IS NULL")
        
        print("Done!")

if __name__ == "__main__":
    fix_data()
