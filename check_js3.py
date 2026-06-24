import urllib.request, re
html = urllib.request.urlopen('https://pet-retail-system.vercel.app/').read().decode('utf-8')
match = re.search(r'src=\"(/assets/index-[^\"]+\.js)\"', html)
if match:
    js_url = 'https://pet-retail-system.vercel.app' + match.group(1)
    js = urllib.request.urlopen(js_url).read().decode('utf-8')
    if '/stores?size=500' in js:
        print('YES! /stores?size=500 is in the bundle.')
    else:
        print('NO! /stores?size=500 is NOT in the bundle.')
else:
    print('JS not found')
