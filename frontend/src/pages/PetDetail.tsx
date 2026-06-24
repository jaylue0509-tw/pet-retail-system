import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api';

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
  cover_photo?: string | null;
  other_photos?: string | null; // JSON String
  features?: string | null;
  special_notes?: string;
  publish_status: string;
  created_at: string;
  current_age_months: number;
  days_in_store: number;
  updated_at: string;
  store_id: number;
}

interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  business_hours: string;
  grooming_hours: string | null;
  map_url: string | null;
}

const PetDetail: React.FC = () => {
  const { pet_code } = useParams<{ pet_code: string }>();
  const navigate = useNavigate();

  const [pet, setPet] = useState<Pet | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 輪播圖片狀態
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    const fetchPetDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/pets/${pet_code}`);
        setPet(res.data);

        // 獲取所屬門市資訊
        const storeRes = await api.get(`/stores/${res.data.store_id}`);
        setStore(storeRes.data);
      } catch (err: any) {
        console.error('獲取活體詳情失敗：', err);
        setError('找不到該活體資料，或伺服器連線中斷。');
      } finally {
        setLoading(false);
      }
    };

    if (pet_code) fetchPetDetail();
  }, [pet_code]);

  if (loading) return <div style={{ textAlign: 'center', padding: '6rem', color: 'var(--primary)' }}>活體詳情載入中...</div>;
  if (error || !pet) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '16px', boxShadow: 'var(--shadow)' }}>
        <p style={{ color: '#e53e3e', fontSize: '1.2rem', marginBottom: '1.5rem' }}>{error || '活體不存在'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/pets')}>返回列表</button>
      </div>
    );
  }

  // 解析所有照片
  let otherPhotos: string[] = [];
  if (pet.other_photos) {
    try {
      otherPhotos = JSON.parse(pet.other_photos);
    } catch {
      otherPhotos = [];
    }
  }

  const allPhotos: string[] = [];
  if (pet.cover_photo) allPhotos.push(pet.cover_photo);
  otherPhotos.forEach(url => {
    if (url && !allPhotos.includes(url)) allPhotos.push(url);
  });

  // 處理門市電話複製
  const handleCopyPhone = () => {
    if (store?.phone) {
      navigator.clipboard.writeText(store.phone);
      alert('門市電話號碼已複製！');
    }
  };

  // 在店天數警示判斷
  let staleStatusText = '新進活體';
  let staleColor = '#2b6cb0';
  let staleBg = '#ebf8ff';
  
  if (pet.days_in_store >= 120) {
    staleStatusText = '滯店警示 (120天以上高齡)';
    staleColor = '#c53030';
    staleBg = '#fff5f5';
  } else if (pet.days_in_store >= 90) {
    staleStatusText = '滯店警示 (90天以上特寵關注)';
    staleColor = '#dd6b20';
    staleBg = '#fffaf0';
  } else if (pet.days_in_store >= 60) {
    staleStatusText = '滯店警示 (60天以上區主管檢視)';
    staleColor = '#b7791f';
    staleBg = '#fefcbf';
  } else if (pet.days_in_store >= 30) {
    staleStatusText = '在店觀察 (30天以上)';
    staleColor = '#4a5568';
    staleBg = '#edf2f7';
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* 麵包屑導覽 */}
      <div style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        <span style={{ color: 'var(--ink-light)', cursor: 'pointer' }} onClick={() => navigate('/')}>門市列表</span>
        <span style={{ color: 'var(--ink-light)' }}> / </span>
        <span style={{ color: 'var(--ink-light)', cursor: 'pointer' }} onClick={() => navigate(`/pets?store_id=${pet.store_id}`)}>{store?.name}</span>
        <span style={{ color: 'var(--ink-light)' }}> / </span>
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{pet.breed} ({pet.pet_code})</span>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '2rem',
        background: '#fff',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        {/* 左側：相片輪播與展示 */}
        <div>
          {/* 大圖展示 */}
          <div style={{ 
            height: '380px', 
            width: '100%', 
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'var(--warm-white)',
            backgroundImage: allPhotos.length > 0 ? `url(${getImageUrl(allPhotos[activePhotoIdx])})` : `url(/pet_placeholder.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {allPhotos.length === 0 && (
              <span style={{ fontSize: '5rem' }}>{pet.category === '貓' ? '🐱' : '🐶'}</span>
            )}
            
            {/* 上架狀態 Badge */}
            <div style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', gap: '8px' }}>
              <span style={{ 
                background: pet.publish_status === '上架中' ? '#48bb78' : pet.publish_status === '洽詢中' ? '#ecc94b' : '#cbd5e0', 
                color: pet.publish_status === '洽詢中' ? '#744210' : '#fff', 
                padding: '4px 12px', 
                borderRadius: '20px', 
                fontSize: '0.8rem', 
                fontWeight: 600 
              }}>
                {pet.publish_status}
              </span>
              <span style={{ background: staleBg, color: staleColor, padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                {staleStatusText}
              </span>
            </div>
          </div>

          {/* 縮圖選單 */}
          {allPhotos.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', overflowX: 'auto', paddingBottom: '5px' }}>
              {allPhotos.map((photo, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '8px',
                    backgroundImage: `url(${getImageUrl(photo)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    border: activePhotoIdx === idx ? '3px solid var(--primary)' : '1px solid var(--border)',
                    transition: 'border 0.1s'
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 右側：活體基本資訊 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>
            <span className="badge" style={{ margin: 0, background: 'var(--primary-light)', color: 'var(--primary-dark)', fontWeight: 600 }}>
              {pet.category}隻 · {pet.breed}
            </span>
            <h1 style={{ fontSize: '2.2rem', color: 'var(--ink)', margin: '0.5rem 0', fontWeight: 800 }}>
              {pet.breed}
            </h1>
            <div style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginBottom: '1.5rem' }}>
              活體編號：<strong style={{ color: 'var(--ink)' }}>{pet.pet_code}</strong>
              {pet.chip_number && <span style={{ marginLeft: '1.5rem' }}>晶片號碼：<strong style={{ color: 'var(--ink)' }}>{pet.chip_number}</strong></span>}
            </div>
          </div>

          {/* 基本參數欄位表 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '1rem', 
            background: 'var(--warm-white)', 
            padding: '1.2rem', 
            borderRadius: '16px',
            marginBottom: '1.5rem'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)', display: 'block' }}>性別</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>{pet.gender}性</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)', display: 'block' }}>毛色</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>{pet.color || '未登錄'}</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)', display: 'block' }}>即時月齡</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>{pet.current_age_months} 個月大</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)', display: 'block' }}>在庫天數</span>
              <strong style={{ fontSize: '1.1rem', color: staleColor }}>{pet.days_in_store} 天</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)', display: 'block' }}>出生日期</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{pet.birth_date}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)', display: 'block' }}>進貨日期</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--ink)' }}>{pet.entry_date}</span>
            </div>
          </div>

          {/* 售價 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--ink-light)' }}>建議售價</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: pet.price > 0 ? '#e53e3e' : 'var(--ink)' }}>
              {pet.price > 0 ? `$${pet.price.toLocaleString()}` : '請洽門市'}
            </div>
          </div>
        </div>
      </div>

      {/* 下方：特色說明與門市聯絡資訊 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '2rem',
        marginTop: '2rem'
      }}>
        {/* 左側：介紹內容 */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '1.2rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', fontWeight: 700 }}>🐾 活體簡介</h3>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--primary-dark)', marginBottom: '0.5rem', fontWeight: 600 }}>門市個體特色 (50-100字)</h4>
            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '12px', 
              fontSize: '0.95rem', 
              lineHeight: '1.8', 
              color: 'var(--ink-mid)', 
              borderLeft: '4px solid var(--primary)',
              fontStyle: 'italic'
            }}>
              {pet.features || '門市尚未填寫個體特色說明。'}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', color: '#dd6b20', marginBottom: '0.5rem', fontWeight: 600 }}>⚠ 特殊注意事項</h4>
            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--ink-mid)' }}>
              {pet.special_notes || '目前無特殊注意事項與照護提醒。'}
            </p>
          </div>
        </div>

        {/* 右側：門市聯絡資訊 */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--ink)', marginBottom: '1.2rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem', fontWeight: 700 }}>🏬 門市聯絡資訊</h3>
          
          {store ? (
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ color: 'var(--ink-mid)', fontSize: '0.95rem', lineHeight: '2' }}>
                <div style={{ fontSize: '1.25rem', color: 'var(--ink)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  東森寵物 - {store.name}
                </div>
                <div>📍 門市地址：{store.address}</div>
                <div>📞 門市電話：<strong>{store.phone}</strong></div>
                <div>🕒 營業時間：{store.business_hours}</div>
                <div>✂ 美容時間：{store.grooming_hours || '無美容服務'}</div>
              </div>

              {/* 手機行動裝置優化按鈕 */}
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <a 
                  href={`tel:${store.phone}`} 
                  className="btn btn-primary" 
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', borderRadius: '10px' }}
                >
                  📞 一鍵撥號
                </a>
                <button 
                  onClick={handleCopyPhone} 
                  className="btn" 
                  style={{ flex: 1, background: '#edf2f7', color: '#2d3748', borderRadius: '10px', fontWeight: 600 }}
                >
                  📋 複製號碼
                </button>
                {store.map_url && (
                  <a 
                    href={store.map_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn" 
                    style={{ width: '100%', background: '#ebf8ff', color: '#2b6cb0', textDecoration: 'none', textAlign: 'center', borderRadius: '10px', fontWeight: 600, border: '1px solid #bee3f8', marginTop: '0.5rem' }}
                  >
                    🗺 導航到店
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--ink-light)' }}>正在獲取門市聯絡資訊...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetDetail;
