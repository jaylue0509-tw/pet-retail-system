import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';
import { useStores } from '../hooks/useStores';

interface Pet {
  id: number;
  pet_code: string;
  name?: string | null;
  category: string;
  breed: string;
  gender: string;
  color?: string | null;
  birth_date: string;
  chip_number?: string | null;
  entry_date: string;
  price: number;
  supplier?: string | null;
  status: string;
  publish_status: string;
  cover_photo?: string | null;
  current_age_months: number;
  days_in_store: number;
  updated_at: string;
  store_id: number;
}

const PetList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  // 獲取門市資料以轉換門市名稱
  const { stores } = useStores();
  
  // URL 帶入的初階篩選
  const urlCategory = searchParams.get('category');
  const urlStoreId = searchParams.get('store_id');

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState<string>('');

  // 進階篩選與排序 State
  const [category, setCategory] = useState<string>(urlCategory || 'all');
  const [breed, setBreed] = useState<string>('');
  const [gender, setGender] = useState<string>('all');
  const [color, setColor] = useState<string>('');
  const [ageRange, setAgeRange] = useState<string>('all'); // 'all', 'baby', 'young', 'adult', 'senior'
  const [daysRange, setDaysRange] = useState<string>('all'); // 'all', 'under30', '30to60', '60to90', 'over90'
  const [sortBy, setSortBy] = useState<string>('updated_desc'); // 'days_asc', 'days_desc', 'price_asc', 'price_desc', 'updated_desc'

  useEffect(() => {
    // 當 URL 參數改變時同步更新狀態
    if (urlCategory) setCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      try {
        // 解析年齡與在店天數篩選範圍，傳遞給後端 API
        let min_age_months: number | undefined;
        let max_age_months: number | undefined;
        let min_days: number | undefined;
        let max_days: number | undefined;

        if (ageRange === 'baby') {
          max_age_months = 3;
        } else if (ageRange === 'young') {
          min_age_months = 3;
          max_age_months = 12;
        } else if (ageRange === 'adult') {
          min_age_months = 12;
          max_age_months = 36;
        } else if (ageRange === 'senior') {
          min_age_months = 36;
        }

        if (daysRange === 'under30') {
          max_days = 30;
        } else if (daysRange === '30to60') {
          min_days = 30;
          max_days = 60;
        } else if (daysRange === '60to90') {
          min_days = 60;
          max_days = 90;
        } else if (daysRange === 'over90') {
          min_days = 90;
        }

        // 調用 FastAPI 接口
        const params: any = {
          category: category !== 'all' ? category : undefined,
          breed: breed || undefined,
          gender: gender !== 'all' ? gender : undefined,
          color: color || undefined,
          store_id: urlStoreId ? parseInt(urlStoreId, 10) : undefined,
          min_age_months,
          max_age_months,
          min_days,
          max_days,
          sort_by: sortBy,
          publish_status_filter: '上架中',
          status_filter: '在庫'
        };

        const res = await api.get('/pets', { params });
        setPets(res.data.items || []);

        // 如果篩選了特定門市，獲取門市名稱顯示在標題
        if (urlStoreId) {
          const storeRes = await api.get(`/stores/${urlStoreId}`);
          setStoreName(storeRes.data.name);
        } else {
          setStoreName('');
        }
      } catch (err) {
        console.error('獲取活體列表失敗，使用 Fallback 模擬資料', err);
        // Fallback
        let fallback: Pet[] = [
          { id: 1, pet_code: 'D112001', name: '小福', category: '犬', breed: '米克斯犬', gender: '公', color: '黑色', birth_date: '2024-06-01', entry_date: '2026-05-01', price: 0, status: '在庫', publish_status: '上架中', current_age_months: 24, days_in_store: 40, updated_at: '2026-06-01', store_id: 1 },
          { id: 2, pet_code: 'C112002', name: '月月', category: '貓', breed: '橘貓', gender: '母', color: '橘白', birth_date: '2023-06-01', entry_date: '2026-04-10', price: 15000, status: '在庫', publish_status: '上架中', current_age_months: 36, days_in_store: 62, updated_at: '2026-06-02', store_id: 1 },
          { id: 3, pet_code: 'D112003', name: '豆豆', category: '犬', breed: '柴犬', gender: '公', color: '赤色', birth_date: '2025-06-01', entry_date: '2026-05-20', price: 25000, status: '在庫', publish_status: '上架中', current_age_months: 12, days_in_store: 22, updated_at: '2026-06-05', store_id: 2 },
          { id: 4, pet_code: 'C112004', name: '花生', category: '貓', breed: '三花貓', gender: '母', color: '三色', birth_date: '2026-02-01', entry_date: '2026-05-28', price: 18000, status: '在庫', publish_status: '上架中', current_age_months: 4, days_in_store: 14, updated_at: '2026-06-08', store_id: 3 }
        ];

        // 套用前端過濾，以防後端掛掉時有展示
        if (category !== 'all') fallback = fallback.filter(p => p.category === category);
        if (urlStoreId) fallback = fallback.filter(p => p.store_id === parseInt(urlStoreId, 10));
        if (breed) fallback = fallback.filter(p => p.breed.includes(breed));
        if (gender !== 'all') fallback = fallback.filter(p => p.gender === gender);
        if (color) fallback = fallback.filter(p => p.color?.includes(color) || false);

        setPets(fallback);
        if (urlStoreId === '1') setStoreName('台北曼哈頓');
        if (urlStoreId === '2') setStoreName('士林文林店');
        if (urlStoreId === '3') setStoreName('北投中和店');
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [category, breed, gender, color, ageRange, daysRange, sortBy, urlStoreId, urlCategory]);

  let title = '全台在庫活體查詢';
  if (category === '犬') title = '犬隻查詢';
  if (category === '貓') title = '貓咪查詢';
  if (storeName) title = `${storeName} - ${title}`;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        {urlStoreId && (
          <Link to="/" className="btn btn-cancel" style={{ padding: '0.4rem 0.8rem' }}>
            ← 返回門市列表
          </Link>
        )}
        <h2 style={{ color: 'var(--ink)', margin: 0, fontWeight: 700 }}>{title}</h2>
      </div>

      {/* 進階篩選與排序面板 */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--ink)', marginBottom: '1rem', fontWeight: 600 }}>🔍 進階篩選條件</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {/* 分類篩選（未鎖定時顯示） */}
          {!urlCategory && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8rem' }}>犬貓分類</label>
              <select className="form-input" style={{ background: '#f8fafc' }} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="all">全部</option>
                <option value="犬">犬隻</option>
                <option value="貓">貓咪</option>
              </select>
            </div>
          )}

          {/* 品種篩選 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>品種名稱</label>
            <input type="text" className="form-input" style={{ background: '#f8fafc' }} placeholder="例如：柴犬、橘貓" value={breed} onChange={e => setBreed(e.target.value)} />
          </div>

          {/* 性別篩選 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>性別</label>
            <select className="form-input" style={{ background: '#f8fafc' }} value={gender} onChange={e => setGender(e.target.value)}>
              <option value="all">不限</option>
              <option value="公">公</option>
              <option value="母">母</option>
            </select>
          </div>

          {/* 毛色篩選 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>毛色</label>
            <input type="text" className="form-input" style={{ background: '#f8fafc' }} placeholder="例如：赤色、白、三色" value={color} onChange={e => setColor(e.target.value)} />
          </div>

          {/* 年齡區間篩選 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>月齡區間</label>
            <select className="form-input" style={{ background: '#f8fafc' }} value={ageRange} onChange={e => setAgeRange(e.target.value)}>
              <option value="all">不限</option>
              <option value="baby">幼體 (3個月以下)</option>
              <option value="young">幼年 (3~12個月)</option>
              <option value="adult">成年 (1~3歲)</option>
              <option value="senior">熟齡 (3歲以上)</option>
            </select>
          </div>

          {/* 在店天數篩選 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>在店天數</label>
            <select className="form-input" style={{ background: '#f8fafc' }} value={daysRange} onChange={e => setDaysRange(e.target.value)}>
              <option value="all">不限</option>
              <option value="under30">30天以下</option>
              <option value="30to60">30~60天</option>
              <option value="60to90">60~90天</option>
              <option value="over90">90天以上</option>
            </select>
          </div>

          {/* 排序方式 */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>排序方式</label>
            <select className="form-input" style={{ background: '#f8fafc' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="updated_desc">最新更新</option>
              <option value="days_asc">在店天數少到多</option>
              <option value="days_desc">在店天數多到少 (滯店警示)</option>
              <option value="price_asc">建議售價低到高</option>
              <option value="price_desc">建議售價高到低</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary)' }}>搜尋中...</div>
      ) : pets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-light)', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          找不到符合條件的毛孩，請嘗試放寬篩選條件。
        </div>
      ) : (
        <div className="grid">
          {pets.map(pet => {
            const photoSrc = pet.cover_photo 
              ? getImageUrl(pet.cover_photo)
              : '/pet_placeholder.png';

            // 在店天數久置警告樣式
            let daysWarningColor = 'var(--ink-mid)';
            let daysBadgeBg = '#f3f4f6';
            if (pet.days_in_store >= 120) {
              daysWarningColor = '#e53e3e'; // 120天以上高齡活體
              daysBadgeBg = '#fff5f5';
            } else if (pet.days_in_store >= 90) {
              daysWarningColor = '#dd6b20'; // 90天以上特寵關注
              daysBadgeBg = '#fffaf0';
            } else if (pet.days_in_store >= 60) {
              daysWarningColor = '#b7791f'; // 60天以上區主管檢視
              daysBadgeBg = '#fefcbf';
            }

            return (
              <div 
                key={pet.id} 
                className="card" 
                style={{ display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', borderRadius: '16px', overflow: 'hidden' }}
                onClick={() => navigate(`/pets/${pet.pet_code}`)}
              >
                {/* 封面照片 */}
                <div style={{ 
                  height: '220px', 
                  width: '100%', 
                  backgroundImage: photoSrc ? `url(${photoSrc})` : `url(/pet_placeholder.png)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '10px',
                  position: 'relative'
                }}>
                  {/* 品種小徽章 */}
                  <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {pet.category}
                  </span>
                  
                  {/* 在店天數浮動標籤 */}
                  <span style={{ 
                    background: daysBadgeBg, 
                    color: daysWarningColor, 
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: 700,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    在店 {pet.days_in_store} 天
                  </span>

                  {!photoSrc && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', background: 'rgba(74, 180, 230, 0.1)' }}>
                      {pet.category === '貓' ? '🐱' : '🐶'}
                    </div>
                  )}
                </div>

                <div className="card-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
                  {/* 標題列：品種與性別 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 className="card-title" style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--ink)' }}>
                      {pet.breed}
                    </h3>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: pet.gender === '公' ? '#3182ce' : '#e53e3e' }}>
                      {pet.gender === '公' ? '♂ 公' : '♀ 母'}
                    </span>
                  </div>

                  {/* 活體編號與特色 */}
                  <div style={{ color: 'var(--ink-light)', fontSize: '0.85rem', marginBottom: '0.75rem', display: 'flex', gap: '10px' }}>
                    <span>編號: <strong>{pet.pet_code}</strong></span>
                    {pet.color && <span>毛色: {pet.color}</span>}
                    <span>月齡: {pet.current_age_months} 個月</span>
                  </div>

                  {/* 門市資訊 */}
                  <div style={{ color: 'var(--ink-mid)', fontSize: '0.9rem', marginBottom: '1rem', flexGrow: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📍</span>
                      <strong>{stores.find(s => s.id === pet.store_id)?.name || '尋找門市中...'}</strong>
                    </div>
                  </div>

                  {/* 價格與最後更新 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #edf2f7', paddingTop: '0.75rem', marginTop: 'auto' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)' }}>建議售價</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: pet.price > 0 ? '#e53e3e' : 'var(--ink)' }}>
                        {pet.price > 0 ? `$${pet.price.toLocaleString()}` : '請洽門市'}
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--ink-light)', display: 'block' }}>更新日期</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--ink-mid)' }}>
                        {new Date(pet.updated_at).toLocaleDateString('zh-TW')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PetList;
