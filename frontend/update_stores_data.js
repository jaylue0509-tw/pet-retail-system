import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateStores() {
  const mdPath = 'C:\\Users\\Jay\\.gemini\\antigravity\\brain\\8cd061e2-33c4-4213-b1ea-86dc62de31d1\\.system_generated\\steps\\203\\content.md';
  const mdContent = fs.readFileSync(mdPath, 'utf8');

  const lines = mdContent.split('\n');
  let currentStore = null;
  const storesToUpdate = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('### ')) {
      if (currentStore) storesToUpdate.push(currentStore);
      currentStore = {
        name: line.replace('### ', '').trim(),
        address: '',
        phone: '',
        business_hours: '',
        grooming_hours: ''
      };
    } else if (currentStore) {
      if (line.startsWith('- [') && !currentStore.address && !line.includes('tel:')) {
        const match = line.match(/- \[(.*?)\]/);
        if (match) currentStore.address = match[1];
      } else if (line.startsWith('- [') && line.includes('tel:')) {
        const match = line.match(/- \[(.*?)\]/);
        if (match) currentStore.phone = match[1];
      } else if (line.startsWith('- 【門市營業】')) {
        currentStore.business_hours = line.replace('- 【門市營業】', '').trim();
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('- 【') && !lines[j].trim().startsWith('[')) {
          if (lines[j].trim()) {
            currentStore.business_hours += ' ' + lines[j].trim();
          }
          j++;
        }
      } else if (line.startsWith('- 【美容營業】')) {
        currentStore.grooming_hours = line.replace('- 【美容營業】', '').trim();
        let j = i + 1;
        while (j < lines.length && !lines[j].trim().startsWith('- 【') && !lines[j].trim().startsWith('[')) {
          if (lines[j].trim()) {
            currentStore.grooming_hours += ' ' + lines[j].trim();
          }
          j++;
        }
      }
    }
  }
  if (currentStore) storesToUpdate.push(currentStore);

  console.log(`🔍 從東森寵物官網分析到 ${storesToUpdate.length} 間門市資訊`);

  let updatedCount = 0;
  for (const store of storesToUpdate) {
    if (!store.address) continue;
    
    // 將名字做微調以對應舊資料庫，例如過濾掉 "店" 之後的字元或是完全比對
    let { data, error } = await supabase
      .from('stores')
      .update({
        address: store.address,
        phone: store.phone,
        business_hours: store.business_hours,
        grooming_hours: store.grooming_hours
      })
      .eq('name', store.name)
      .select();

    if (error) {
      console.error(`更新失敗 ${store.name}:`, error.message);
    } else if (data && data.length > 0) {
      updatedCount++;
    } else {
      // 嘗試模糊比對 (有時候官網叫 "新北八里店"，CSV 叫 "八里店")
      const { data: data2 } = await supabase.from('stores').update({
        address: store.address,
        phone: store.phone,
        business_hours: store.business_hours,
        grooming_hours: store.grooming_hours
      }).ilike('name', `%${store.name.replace('店','').replace('院','').replace('台','臺')}%`).select();
      
      if (data2 && data2.length > 0) {
        updatedCount++;
      } else {
        const { data: data3 } = await supabase.from('stores').update({
          address: store.address,
          phone: store.phone,
          business_hours: store.business_hours,
          grooming_hours: store.grooming_hours
        }).ilike('name', `%${store.name.replace('店','').replace('院','').replace('臺','台')}%`).select();
        if (data3 && data3.length > 0) updatedCount++;
      }
    }
  }

  console.log(`✅ 成功將 ${updatedCount} 間門市的詳細資訊（地址、電話、營業時間）補入資料庫！`);
}

updateStores();
