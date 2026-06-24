import urllib.request, re
html = urllib.request.urlopen('https://pet-retail-system.vercel.app/').read().decode('utf-8')
match = re.search(r'src=\"(/assets/index-[^\"]+\.js)\"', html)
if match:
    js_url = 'https://pet-retail-system.vercel.app' + match.group(1)
    js = urllib.request.urlopen(js_url).read().decode('utf-8')
    if 'can_trade_dog!==!1' in js or 'can_trade_dog !== false' in js or 'can_trade_dog!==false' in js:
        print('NEW LOGIC FOUND')
    elif 'can_trade_dog?' in js or 'can_trade_dog ?' in js:
        print('OLD LOGIC FOUND')
    else:
        print('Logic not found. Length:', len(js))
else:
    print('JS not found')
