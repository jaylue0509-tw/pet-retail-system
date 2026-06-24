import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from database import SessionLocal
from service.dashboard_service import get_dashboard_stats

def run_test():
    db = SessionLocal()
    try:
        stats = get_dashboard_stats(db)
        print("Success:")
        print(stats)
    except Exception as e:
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    run_test()
