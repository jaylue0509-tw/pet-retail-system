-- 1. 建立 pets 資料表
create table pets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  breed text,
  age text,
  gender text,
  store_id text not null,
  is_published boolean default true,
  description text,
  photo_url text
);

-- 2. 建立 pet-images 儲存桶 (Storage Bucket) 並設為公開
insert into storage.buckets (id, name, public) 
values ('pet-images', 'pet-images', true);

-- 3. 設定儲存桶的權限：允許任何人讀取圖片 (這樣前台才看得到照片)
create policy "公開讀取圖片" 
on storage.objects for select 
using ( bucket_id = 'pet-images' );

-- 4. 設定儲存桶的權限：允許任何人上傳圖片 (方便您現在從後台無縫上傳)
create policy "允許上傳圖片" 
on storage.objects for insert 
with check ( bucket_id = 'pet-images' );
