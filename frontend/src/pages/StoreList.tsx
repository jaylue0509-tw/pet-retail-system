import React, { useState, useMemo } from 'react';
import { useStores } from '../hooks/useStores';
import StoreCard from '../components/StoreCard';

const areaMap: Record<string, string[]> = {
  north: ['台北市', '新北市', '基隆市', '桃園市', '新竹市', '新竹縣', '宜蘭縣'],
  central: ['苗栗縣', '台中市', '彰化縣', '南投縣', '雲林縣'],
  south: ['嘉義市', '嘉義縣', '台南市', '高雄市', '屏東縣'],
  east: ['花蓮縣', '台東縣']
};

const StoreList: React.FC = () => {
  const { stores, pagination, loading, error, refetch } = useStores();
  
  const [area, setArea] = useState('all');
  const [region, setRegion] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [filterPets, setFilterPets] = useState<'all' | 'dog' | 'cat'>('all');

  const regions = useMemo(() => {
    const rSet = new Set<string>();
    stores.forEach(s => {
      if (!s.address) return;
      const match = s.address.match(/^(?:台灣省|台灣)?(.*?[縣市])/);
      if (match) {
        const city = match[1].replace('臺', '台');
        if (area !== 'all') {
          if (areaMap[area] && areaMap[area].includes(city)) {
            rSet.add(city);
          }
        } else {
          rSet.add(city);
        }
      }
    });
    return Array.from(rSet);
  }, [stores, area]);

  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setArea(e.target.value);
    setRegion('all');
  };

  const filteredStores = stores.filter(store => {
    if (!store.license_number) return false;

    const match = store.address ? store.address.match(/^(?:台灣省|台灣)?(.*?[縣市])/) : null;
    const city = match ? match[1].replace('臺', '台') : '';

    if (area !== 'all') {
      if (!areaMap[area] || !areaMap[area].includes(city)) return false;
    }

    if (region !== 'all' && city !== region.replace('臺', '台')) return false;
    
    if (keyword && !store.name.includes(keyword) && !store.address.includes(keyword)) return false;

    const activePets = store.pets ? store.pets.filter((p: any) => p.publish_status === '上架中') : [];
    const validDogsCount = activePets.filter((p: any) => p.category === '犬').length;
    const validCatsCount = activePets.filter((p: any) => p.category === '貓').length;
    
    // Hide store if it has 0 active pets
    if (validDogsCount + validCatsCount === 0) return false;

    if (filterPets === 'dog' && validDogsCount === 0) return false;
    if (filterPets === 'cat' && validCatsCount === 0) return false;

    return true;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--primary)' }}>門市載入中...</div>;
  if (error) return <div style={{ textAlign: 'center', padding: '4rem', color: '#e53e3e' }}>載入失敗: {error}</div>;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem', background: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: 'var(--ink)', fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700 }}>門市活體型錄查詢</h2>
        <p style={{ color: 'var(--ink-light)', marginBottom: '2rem' }}>快速尋找全台各門市在庫的犬貓活體資訊</p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '1rem', 
          flexWrap: 'wrap',
          marginBottom: '1.5rem' 
        }}>
          <select 
            className="input-field" 
            style={{ minWidth: '150px', borderRadius: '8px' }}
            value={area}
            onChange={handleAreaChange}
          >
            <option value="all">所有區域</option>
            <option value="north">北部地區</option>
            <option value="central">中部地區</option>
            <option value="south">南部地區</option>
            <option value="east">東部地區</option>
          </select>

          <select 
            className="input-field" 
            style={{ minWidth: '150px', borderRadius: '8px' }}
            value={region}
            onChange={e => setRegion(e.target.value)}
          >
            <option value="all">所有縣市</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>

          <input 
            type="text" 
            className="input-field" 
            placeholder="搜尋門市名稱或地址..." 
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            style={{ minWidth: '250px', borderRadius: '8px' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setFilterPets('all')} className="btn" style={{ borderRadius: '20px', background: filterPets === 'all' ? 'var(--primary)' : '#f3f4f6', color: filterPets === 'all' ? '#fff' : 'var(--ink-mid)' }}>全部門市</button>
          <button onClick={() => setFilterPets('dog')} className="btn" style={{ borderRadius: '20px', background: filterPets === 'dog' ? 'var(--primary)' : '#f3f4f6', color: filterPets === 'dog' ? '#fff' : 'var(--ink-mid)' }}>🐶 有在庫犬隻</button>
          <button onClick={() => setFilterPets('cat')} className="btn" style={{ borderRadius: '20px', background: filterPets === 'cat' ? 'var(--primary)' : '#f3f4f6', color: filterPets === 'cat' ? '#fff' : 'var(--ink-mid)' }}>🐱 有在庫貓咪</button>
        </div>
      </div>

      <div className="grid">
        {filteredStores.map(store => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
      
      {filteredStores.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--ink-light)', background: '#fff', borderRadius: '16px' }}>
          目前沒有符合篩選條件的門市。
        </div>
      )}

      {pagination && pagination.total_pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '3rem', gap: '1rem' }}>
          <button 
            className="btn btn-cancel" 
            disabled={pagination.current_page <= 1}
            onClick={() => refetch({ page: pagination.current_page - 1 })}
          >
            上一頁
          </button>
          <span style={{ fontSize: '1rem', color: 'var(--ink-mid)' }}>
            第 {pagination.current_page} 頁 / 共 {pagination.total_pages} 頁
          </span>
          <button 
            className="btn btn-cancel" 
            disabled={pagination.current_page >= pagination.total_pages}
            onClick={() => refetch({ page: pagination.current_page + 1 })}
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreList;
