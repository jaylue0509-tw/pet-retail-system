import urllib.request
import json
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

pets_req = urllib.request.urlopen('https://pet-retail-system.vercel.app/api/pets?size=10')
pets_data = json.loads(pets_req.read().decode('utf-8'))
for p in pets_data['items'][:10]:
    print(f"Pet: {p.get('category')} {p.get('breed')}, Color: {p.get('color')}, Price: {p.get('price')}, Store ID: {p.get('store_id')}")
