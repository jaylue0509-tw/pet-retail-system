import urllib.request
import json
try:
    req = urllib.request.Request('http://127.0.0.1:8088/pets')
    res = urllib.request.urlopen(req)
    data = json.loads(res.read())
    print(f'Total: {data.get("total_count")}, Items: {len(data.get("items", []))}')
except Exception as e:
    print(f"Error: {e}")
