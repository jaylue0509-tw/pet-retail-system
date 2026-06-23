from fastapi.testclient import TestClient
import pytest
import os
import sys

# 確保能導入同目錄下的模組
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

def test_login_success():
    """
    測試使用正確的管理員帳密登入，應回傳 JWT Token
    """
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_failed():
    """
    測試使用錯誤的帳密登入，應回傳 401 錯誤
    """
    response = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"})
    assert response.status_code == 401
    assert response.json()["detail"] == "帳號或密碼錯誤"

def test_pet_features_limit_prevention():
    """
    測試門市編輯個體特色時的字數防呆機制 (必須在 50~100 字之間)
    """
    # 1. 先登入獲取 admin token
    login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. 測試特色字數過少（例如 10 字），應回傳 400 Bad Request
    invalid_short_features = "溫順親人。"
    response = client.put(
        "/api/pets/D112001", 
        json={"features": invalid_short_features}, 
        headers=headers
    )
    assert response.status_code == 400
    assert "個體特色說明必須在 50 至 100 字之間" in response.json()["detail"]

    # 3. 測試特色字數過多（例如 110 字），應回傳 400 Bad Request
    invalid_long_features = "這個活體個體非常溫順而且十分地親人，抱持接受度非常良好，食慾與活動力也完全正常；初到陌生環境時可能會有稍微慢熟的情況發生，但一旦跟同仁熟悉之後互動性就非常好，是一隻特別乖巧而且極度適合陪伴的溫柔犬隻，非常推薦！"
    response = client.put(
        "/api/pets/D112001", 
        json={"features": invalid_long_features}, 
        headers=headers
    )
    assert response.status_code == 400
    assert "個體特色說明必須在 50 至 100 字之間" in response.json()["detail"]

    # 4. 測試特色字數合規（例如 60 字），應回傳 200 OK
    valid_features = "個性溫和、極度親人，抱持接受度佳，食慾與活動力良好；初到陌生環境時可能會稍微慢熟，一旦熟悉之後互動性非常好，非常乖巧且適合陪伴。"
    response = client.put(
        "/api/pets/D112001", 
        json={"features": valid_features}, 
        headers=headers
    )
    assert response.status_code == 200
    assert response.json()["features"] == valid_features

def test_store_manager_isolation():
    """
    測試店長權限隔離：台北曼哈頓店長 (store_id: 1) 無權修改士林文林店 (D112003) 的活體
    """
    # 1. 登入台北曼哈頓店長 (manhattan / store123)
    login_res = client.post("/api/auth/login", json={"username": "manhattan", "password": "store123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. 嘗試修改士林文林店 (D112003) 的特色說明，應回傳 403 Forbidden
    valid_features = "個性溫和、極度親人，抱持接受度佳，食慾與活動力良好；初到陌生環境時可能會稍微慢熟，一旦熟悉之後互動性非常好，非常乖巧且適合陪伴。"
    response = client.put(
        "/api/pets/D112003", 
        json={"features": valid_features}, 
        headers=headers
    )
    assert response.status_code == 403
    assert "您無權修改其他門市的活體資料" in response.json()["detail"]

def test_dashboard_stats():
    """
    測試儀表板統計 API，應回傳北極星指標及各項 KPI 達成率
    """
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    
    # 驗證包含規格中要求的所有指標欄位
    assert "active_stores" in data
    assert "total_pets" in data
    assert "dogs_count" in data
    assert "cats_count" in data
    assert "northstar_metric" in data
    assert "store_activation_rate" in data
    assert "pet_publish_rate" in data
    assert "photo_completeness_rate" in data
    assert "sold_not_unpublished_rate" in data
