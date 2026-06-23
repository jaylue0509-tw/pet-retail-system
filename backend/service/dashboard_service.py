from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from repository import pet_repo, store_repo
from model import models

def get_dashboard_stats(db: Session):
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1)
    seven_days_ago = now - timedelta(days=7)

    stores_active_count = pet_repo.count_active_stores(db)
    pets_published_count = pet_repo.count_published_pets(db)
    dogs_count = pet_repo.count_published_pets_by_category(db, "犬")
    cats_count = pet_repo.count_published_pets_by_category(db, "貓")
    new_pets_count = pet_repo.count_new_pets_since(db, start_of_month)
    sold_pets_count = pet_repo.count_sold_pets_since(db, start_of_month)
    stale_pets_count = pet_repo.count_stale_pets(db, seven_days_ago)
    
    north_cities = ['台北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣', '宜蘭縣']
    central_cities = ['苗栗縣', '台中市', '彰化縣', '南投縣', '雲林縣']
    south_cities = ['嘉義市', '嘉義縣', '台南市', '高雄市', '屏東縣']
    east_cities = ['花蓮縣', '台東縣']

    active_pets = pet_repo.get_active_pets_with_store(db)
    regional_stats = {"北部": 0, "中部": 0, "南部": 0, "東部": 0}
    
    for pet in active_pets:
        addr = pet.store.address or ""
        norm_addr = addr.replace("臺", "台")
        if any(city in norm_addr for city in north_cities):
            regional_stats["北部"] += 1
        elif any(city in norm_addr for city in central_cities):
            regional_stats["中部"] += 1
        elif any(city in norm_addr for city in south_cities):
            regional_stats["南部"] += 1
        elif any(city in norm_addr for city in east_cities):
            regional_stats["東部"] += 1

    northstar_count = pet_repo.count_northstar_metric(db, seven_days_ago)

    total_stores = store_repo.count_total_stores_with_license(db)
    store_activation_rate = round((stores_active_count / total_stores * 100), 1) if total_stores > 0 else 0

    total_active_pets = pet_repo.count_total_active_pets(db)
    pet_publish_rate = round((pets_published_count / total_active_pets * 100), 1) if total_active_pets > 0 else 0

    pets_with_photo = pet_repo.count_pets_with_photo(db)
    photo_completeness_rate = round((pets_with_photo / pets_published_count * 100), 1) if pets_published_count > 0 else 0

    sold_but_published = pet_repo.count_sold_but_published(db)
    total_sold = pet_repo.count_total_sold_pets(db)
    sold_not_unpublished_rate = round((sold_but_published / total_sold * 100), 1) if total_sold > 0 else 0

    return {
        "active_stores": stores_active_count,
        "total_pets": pets_published_count,
        "dogs_count": dogs_count,
        "cats_count": cats_count,
        "new_pets_this_month": new_pets_count,
        "sold_pets_this_month": sold_pets_count,
        "stale_pets_count": stale_pets_count,
        "regional_stats": regional_stats,
        "northstar_metric": northstar_count,
        "store_activation_rate": store_activation_rate,
        "pet_publish_rate": pet_publish_rate,
        "photo_completeness_rate": photo_completeness_rate,
        "sold_not_unpublished_rate": sold_not_unpublished_rate
    }
