import re

with open('frontend/src/pages/PetList.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove useStores
code = code.replace("import { useStores } from '../hooks/useStores';\n", '')
code = code.replace("  const { stores } = useStores();\n", '')

# Add storeMap state
state_block = '''  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState<string>('');
  const [storeMap, setStoreMap] = useState<Record<number, string>>({});'''
code = code.replace("  const [pets, setPets] = useState<Pet[]>([]);\n  const [loading, setLoading] = useState(true);\n  const [storeName, setStoreName] = useState<string>('');", state_block)

# Add storeMap fetch
effect_block = '''  useEffect(() => {
    // 當 URL 參數改變時同步更新狀態
    if (urlCategory) setCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    api.get('/stores?size=500').then(res => {
      if (res.data && res.data.items) {
        const map: Record<number, string> = {};
        res.data.items.forEach((s: any) => { map[s.id] = s.name; });
        setStoreMap(map);
      }
    }).catch(err => console.error('無法載入全台門市名稱對應表', err));
  }, []);'''
code = code.replace("""  useEffect(() => {
    // 當 URL 參數改變時同步更新狀態
    if (urlCategory) setCategory(urlCategory);
  }, [urlCategory]);""", effect_block)

# Remove days in store filter state and payload
code = re.sub(r"\s*const \[daysRange, setDaysRange\] = useState<string>\('all'\);[^\n]*\n", '\n', code)
code = re.sub(r"\s*let min_days: number \| undefined;\n\s*let max_days: number \| undefined;\n", '\n', code)
code = re.sub(r"\s*if \(daysRange === 'under30'\) \{.*?\}\n", '\n', code, flags=re.DOTALL)
code = re.sub(r"\s*min_days,\n\s*max_days,\n", '\n', code)
code = code.replace("daysRange, ", "")

# Remove days in store filter UI
days_ui = re.search(r"\s*\{\/\* 在店天數篩選 \*\/}.*?<\/div>", code, flags=re.DOTALL)
if days_ui:
    code = code.replace(days_ui.group(0), '')

# Remove days in store sorting UI
code = re.sub(r"\s*<option value=\"days_asc\">在店天數少到多<\/option>\n\s*<option value=\"days_desc\">在店天數多到少 \(滯店警示\)<\/option>", '', code)

# Remove days warning badge logic
badge_logic = re.search(r"\s*\/\/ 在店天數久置警告樣式.*?daysBadgeBg = '#fefcbf';\n\s*\}", code, flags=re.DOTALL)
if badge_logic:
    code = code.replace(badge_logic.group(0), '')

# Remove days badge render
badge_render = re.search(r"\s*\{\/\* 在店天數浮動標籤 \*\/}.*?<\/span>", code, flags=re.DOTALL)
if badge_render:
    code = code.replace(badge_render.group(0), '')

# Update store mapping
code = code.replace("stores.find(s => s.id === pet.store_id)?.name || '尋找門市中...'", "storeMap[pet.store_id] || '讀取門市中...'")

with open('frontend/src/pages/PetList.tsx', 'w', encoding='utf-8') as f:
    f.write(code)
