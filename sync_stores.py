import sqlite3
import psycopg2

sqlite_url = "backend/petsystem.db"
neon_url = "postgresql://neondb_owner:npg_3UNBtaikxWe7@ep-late-credit-ate5mpw7.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"

def sync_stores():
    conn_sqlite = sqlite3.connect(sqlite_url)
    conn_sqlite.row_factory = sqlite3.Row
    cur_sqlite = conn_sqlite.cursor()

    conn_neon = psycopg2.connect(neon_url)
    cur_neon = conn_neon.cursor()

    cur_sqlite.execute("SELECT id, name, license_number, can_trade_dog, can_trade_cat, can_board_dog, can_board_cat, can_board_small_animal FROM stores")
    stores = cur_sqlite.fetchall()

    print(f"Found {len(stores)} stores in local SQLite.")
    
    update_count = 0
    for store in stores:
        # SQLite booleans are 1/0, convert to True/False for Postgres
        can_trade_dog = bool(store['can_trade_dog'])
        can_trade_cat = bool(store['can_trade_cat'])
        can_board_dog = bool(store['can_board_dog'])
        can_board_cat = bool(store['can_board_cat'])
        can_board_small_animal = bool(store['can_board_small_animal'])
        license_number = store['license_number']

        # Update neon
        cur_neon.execute("""
            UPDATE stores 
            SET license_number = %s, 
                can_trade_dog = %s, 
                can_trade_cat = %s, 
                can_board_dog = %s, 
                can_board_cat = %s, 
                can_board_small_animal = %s 
            WHERE id = %s
        """, (license_number, can_trade_dog, can_trade_cat, can_board_dog, can_board_cat, can_board_small_animal, store['id']))
        update_count += 1

    conn_neon.commit()
    print(f"Updated {update_count} stores in Neon DB.")

    cur_neon.close()
    conn_neon.close()
    cur_sqlite.close()
    conn_sqlite.close()

if __name__ == "__main__":
    sync_stores()
