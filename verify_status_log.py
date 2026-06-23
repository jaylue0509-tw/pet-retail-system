import urllib.request
import json

def test():
    # 1. 取得所有的 pets 找第一個
    resp = urllib.request.urlopen("http://127.0.0.1:8000/api/pets?limit=1")
    data = json.loads(resp.read())
    pet = data[0]
    pet_code = pet["pet_code"]
    print(f"Target Pet: {pet_code}, current status: {pet.get('publish_status')}")

    # 1.5 登入取得 token
    req_login = urllib.request.Request(
        "http://127.0.0.1:8000/api/auth/login",
        method="POST",
        headers={"Content-Type": "application/json"},
        data=json.dumps({"username": "admin", "password": "admin123"}).encode('utf-8')
    )
    resp_login = urllib.request.urlopen(req_login)
    token = json.loads(resp_login.read())["access_token"]

    # 2. 變更狀態為 "已下架" 並加入原因
    req = urllib.request.Request(
        f"http://127.0.0.1:8000/api/pets/{pet_code}",
        method="PUT",
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        data=json.dumps({
            "publish_status": "已下架",
            "unpublish_reason": "已成交",
            "unpublish_note": "測試下架 API 自動產生紀錄",
            "operator": "admin",
            "features": "個性溫和、親人，抱持接受度佳，食慾與活動力正常；初到陌生環境時較慢熟，熟悉後互動性良好。" # 符合 50-100 字
        }).encode('utf-8')
    )
    urllib.request.urlopen(req)
    print(f"✅ Successfully updated {pet_code} to 已下架")

    # 3. 獲取狀態 Log
    resp = urllib.request.urlopen(f"http://127.0.0.1:8000/api/pets/{pet_code}/status-logs")
    logs = json.loads(resp.read())
    print(f"Status Logs for {pet_code}:")
    for log in logs:
        print(f" - [{log['created_at']}] {log['operator']}: {log.get('old_status')} -> {log['new_status']} (Reason: {log.get('unpublish_reason')}, Note: {log.get('unpublish_note')})")

if __name__ == "__main__":
    test()
