import re

with open('frontend/src/pages/PetDetail.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(r"\s*let staleStatusText = '在庫中';\s*let staleColor = '#2b6cb0';\s*let staleBg = '#ebf8ff';", '', code)

with open('frontend/src/pages/PetDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
