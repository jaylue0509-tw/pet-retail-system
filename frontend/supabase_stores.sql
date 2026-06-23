-- 1. 建立 stores 資料表
create table stores (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  has_dog boolean default false,
  has_cat boolean default false,
  license_number text
);

-- 2. 允許所有人讀取門市資料 (前台與後台需要讀取)
create policy "公開讀取門市" 
on stores for select 
using (true);

-- 3. 允許從後台寫入門市資料
create policy "允許新增門市" 
on stores for insert 
with check (true);
