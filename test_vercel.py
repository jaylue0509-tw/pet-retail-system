import urllib.request
import urllib.error
import json
try:
    req = urllib.request.Request('https://pet-retail-system.vercel.app/api/pets')
    req.add_header('User-Agent', 'Mozilla/5.0')
    res = urllib.request.urlopen(req)
    raw = res.read()
    print('Response:', raw.decode('utf-8', errors='ignore')[:500])
except urllib.error.HTTPError as e:
    print(e.code, e.read().decode('utf-8', errors='ignore'))
