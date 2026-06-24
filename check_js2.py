import urllib.request, re
html = urllib.request.urlopen('https://pet-retail-system.vercel.app/').read().decode('utf-8')
match = re.search(r'src=\"(/assets/index-[^\"]+\.js)\"', html)
if match:
    js_url = 'https://pet-retail-system.vercel.app' + match.group(1)
    js = urllib.request.urlopen(js_url).read().decode('utf-8')
    if 'can_trade_dog!==undefined' in js or 'can_trade_dog !== undefined' in js or 'can_trade_dog!==void 0' in js:
        print('NEW LOGIC FOUND')
    else:
        print('OLD LOGIC FOUND! Snippet:')
        idx = js.find('can_trade_dog')
        print(js[idx:idx+150])
else:
    print('JS not found')
