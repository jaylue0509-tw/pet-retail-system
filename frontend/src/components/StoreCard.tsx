import React from 'react';
import { Link } from 'react-router-dom';
import type { Store } from '../hooks/useStores';
import { API_BASE_URL } from '../api';

interface StoreCardProps {
  store: Store;
}

const StoreCard: React.FC<StoreCardProps> = ({ store }) => {
  const activePets = store.pets.filter(p => 
    p.status === '在庫' && 
    (p.publish_status === '上架中' || p.publish_status === '洽詢中')
  );

  const dogsCount = activePets.filter(p => p.category === '犬').length;
  const catsCount = activePets.filter(p => p.category === '貓').length;
  
  // 只計算有許可的活體，避免因為假資料或錯誤輸入導致數字不吻合
  const validDogsCount = store.can_trade_dog ? dogsCount : 0;
  const validCatsCount = store.can_trade_cat ? catsCount : 0;
  const displayTotalCount = validDogsCount + validCatsCount;

  const firstPetWithPhoto = activePets.find(p => p.cover_photo);
  const bgImage = firstPetWithPhoto 
    ? `${API_BASE_URL}${firstPetWithPhoto.cover_photo}` 
    : '/pet_placeholder.png';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}>
      <div style={{ 
        height: '180px', 
        width: '100%', 
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
          活體總在庫：{displayTotalCount}
        </div>
      </div>
      
      <div className="card-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <h3 className="card-title" style={{ fontSize: '1.3rem', margin: '0 0 0.3rem 0', fontWeight: 700 }}>
            <Link to={`/pets?store_id=${store.id}`} style={{ color: 'var(--ink)', textDecoration: 'none' }}>
              {store.name}
            </Link>
          </h3>
          {store.license_number && <div style={{ fontSize: '0.8rem', color: '#718096', fontWeight: 500 }}>許可證號：{store.license_number}</div>}
        </div>
        
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ background: '#edf2f7', color: '#4a5568', padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 600 }}>用品銷售</span>
          {store.grooming_hours && store.grooming_hours !== '無美容服務' && <span style={{ background: '#edf2f7', color: '#4a5568', padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 600 }}>寵物美容</span>}
          {store.can_trade_dog && <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 600 }}>🐶 許可犬隻買賣</span>}
          {store.can_trade_cat && <span style={{ background: '#fffaf0', color: '#dd6b20', padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 600 }}>🐱 許可貓咪買賣</span>}
        </div>

        <div style={{ color: 'var(--ink-mid)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--primary)' }}>📍</span>
            <span>{store.address}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--primary)' }}>📞</span>
            <span>{store.phone}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <span style={{ color: 'var(--primary)' }}>🕒</span>
            <div style={{ fontSize: '0.85rem' }}>
              <div>門市：{store.business_hours}</div>
              <div>美容：{store.grooming_hours || '無美容服務'}</div>
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #edf2f7' }}>
          {store.can_trade_dog ? (
            validDogsCount > 0 ? (
              <Link to={`/pets?category=犬&store_id=${store.id}`} className="badge" style={{ background: '#ebf8ff', color: '#2b6cb0', margin: 0, textDecoration: 'none', border: '1px solid #bee3f8', flex: 1, textAlign: 'center', padding: '0.4rem', fontWeight: 600 }}>
                🐶 犬隻查詢 ({validDogsCount})
              </Link>
            ) : (
              <span className="badge" style={{ background: '#f7fafc', color: '#718096', margin: 0, border: '1px solid #cbd5e0', flex: 1, textAlign: 'center', padding: '0.4rem', fontSize: '0.8rem' }}>有許可/無在庫狗</span>
            )
          ) : (
            <span className="badge" style={{ background: '#f7fafc', color: '#a0aec0', margin: 0, border: '1px solid #e2e8f0', flex: 1, textAlign: 'center', padding: '0.4rem', fontSize: '0.8rem', opacity: 0.6 }}>無犬隻買賣許可</span>
          )}

          {store.can_trade_cat ? (
            validCatsCount > 0 ? (
              <Link to={`/pets?category=貓&store_id=${store.id}`} className="badge" style={{ background: '#fffaf0', color: '#dd6b20', margin: 0, textDecoration: 'none', border: '1px solid #feebc8', flex: 1, textAlign: 'center', padding: '0.4rem', fontWeight: 600 }}>
                🐱 貓咪查詢 ({validCatsCount})
              </Link>
            ) : (
              <span className="badge" style={{ background: '#f7fafc', color: '#718096', margin: 0, border: '1px solid #cbd5e0', flex: 1, textAlign: 'center', padding: '0.4rem', fontSize: '0.8rem' }}>有許可/無在庫貓</span>
            )
          ) : (
            <span className="badge" style={{ background: '#f7fafc', color: '#a0aec0', margin: 0, border: '1px solid #e2e8f0', flex: 1, textAlign: 'center', padding: '0.4rem', fontSize: '0.8rem', opacity: 0.6 }}>無貓咪買賣許可</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
