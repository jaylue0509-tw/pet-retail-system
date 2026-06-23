import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// 讀取 .env.local 變數
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 找不到 Supabase 環境變數，請確認 .env.local 已設定');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function importStores() {
  try {
    const csvPath = path.resolve(process.cwd(), '../storedata/store.csv');
    const csvData = fs.readFileSync(csvPath, 'utf8');
    
    // 依據換行符號分割，並過濾空行
    const lines = csvData.split(/\r?\n/).map(l => l.trim()).filter(l => l);
    
    const stores = [];
    
    // CSV 的前 3 行是標題與統計，真正的資料從第 4 行 (index 3) 開始
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',');
      
      const name = parts[0]?.trim();
      if (!name) continue;
      
      const has_dog = parts[1]?.trim() === '1';
      const has_cat = parts[2]?.trim() === '1';
      const license_number = parts[3]?.trim() || null;

      stores.push({
        name,
        has_dog,
        has_cat,
        license_number
      });
    }

    console.log(`📦 準備匯入 ${stores.length} 間門市資料...`);

    // Supabase 支援陣列批次寫入 (Bulk Insert)
    const { error } = await supabase.from('stores').insert(stores);

    if (error) {
      console.error('❌ 匯入失敗：', error.message);
    } else {
      console.log('✅ 所有門市資料匯入成功！');
    }
    
  } catch (err) {
    console.error('❌ 發生錯誤：', err);
  }
}

importStores();
