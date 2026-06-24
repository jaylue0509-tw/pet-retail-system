import urllib.request
import json
import io
import sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print('--- API DATA CHECK ---')
try:
    stores_req = urllib.request.urlopen('https://pet-retail-system.vercel.app/api/stores?size=5')
    stores_data = json.loads(stores_req.read().decode('utf-8'))
    print(f"Total stores: {stores_data['total_count']}")
    for s in stores_data['items'][:3]:
        print(f"Store: {s.get('name')}, Phone: {s.get('phone')}, License: {s.get('license_number')}")
except Exception as e:
    print(f"Stores error: {e}")

print('---')
try:
    pets_req = urllib.request.urlopen('https://pet-retail-system.vercel.app/api/pets?size=5')
    pets_data = json.loads(pets_req.read().decode('utf-8'))
    print(f"Total pets: {pets_data['total_count']}")
    for p in pets_data['items'][:3]:
        print(f"Pet: {p.get('species')}, Color: {p.get('color')}, Price: {p.get('price')}, Status: {p.get('status')}")
except Exception as e:
    print(f"Pets error: {e}")
