import re

with open('frontend/src/pages/PetDetail.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove stale status badge logic
stale_logic = re.search(r"\s*let staleStatusText = '在庫中';\s*let staleColor = '#2b6cb0';\s*let staleBg = '#ebf8ff';\s*if \(pet\.days_in_store >= 120\).*?\}\s*", code, flags=re.DOTALL)
if stale_logic:
    code = code.replace(stale_logic.group(0), '')

# Remove "在店天數" (days_in_store) from the info grid
info_grid_item = re.search(r"\s*<div>\s*<span[^>]*>在庫天數</span>\s*<strong[^>]*>\{pet\.days_in_store\} 天</strong>\s*</div>", code, flags=re.DOTALL)
if info_grid_item:
    code = code.replace(info_grid_item.group(0), '')

# Remove stale status text from header if it exists
header_badge = re.search(r"\s*<span[^>]*style=\{\{[^}]*background: staleBg[^}]*\}\}[^>]*>\s*\{staleStatusText\}\s*</span>", code, flags=re.DOTALL)
if header_badge:
    code = code.replace(header_badge.group(0), '')

with open('frontend/src/pages/PetDetail.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
