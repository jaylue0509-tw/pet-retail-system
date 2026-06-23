import React, { useState, useEffect, useRef } from 'react';
import type { Pet } from '../hooks/usePets';
import api from '../api';

interface Store {
  id: number;
  name: string;
}

interface PetManagementTableProps {
  pets: Pet[];
  stores: Store[];
  userRole: string;
  pagination: { total_count: number, total_pages: number, current_page: number };
  onPageChange: (page: number) => void;
  onEditPet: (pet: Pet) => void;
  onSyncComplete?: () => void;
}

const PetManagementTable: React.FC<PetManagementTableProps> = ({ pets, stores, userRole, pagination, onPageChange, onEditPet, onSyncComplete }) => {
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [filterStore, setFilterStore] = useState('all');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/pets/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`匯入成功！新增 ${res.data.added} 筆，更新 ${res.data.updated} 筆，略過 ${res.data.skipped} 筆。`);
      if (onSyncComplete) onSyncComplete();
    } catch (err: any) {
      alert('匯入失敗：' + (err.response?.data?.detail || err.message));
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    let result = pets;
    if (searchCode) {
      result = result.filter(p => p.pet_code.toLowerCase().includes(searchCode.toLowerCase()));
    }
    if (filterStore !== 'all') {
      result = result.filter(p => p.store_id === parseInt(filterStore, 10));
    }
    setFilteredPets(result);
  }, [searchCode, filterStore, pets]);

  return (
    <>
      <div className="admin-topbar">
        <h2 className="admin-title" style={{ fontWeight: 700 }}>門市活體管理目錄</h2>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          {userRole === 'admin' && (
            <>
              <input 
                type="file" 
                accept=".csv"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <button 
                className="btn btn-primary" 
                style={{ height: '40px', padding: '0 1rem', display: 'flex', alignItems: 'center', fontWeight: 600, border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                onClick={handleImportClick}
                disabled={isImporting}
              >
                {isImporting ? '匯入中...' : '📥 一鍵匯入'}
              </button>
              <select 
                className="form-input" 
                style={{ width: '180px', height: '40px', background: '#fff' }}
                value={filterStore}
                onChange={e => setFilterStore(e.target.value)}
              >
                <option value="all">所有門市</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </>
          )}
          
          <input 
            type="text" 
            className="form-input" 
            style={{ width: '220px', height: '40px', background: '#fff' }}
            placeholder="輸入活體編號搜尋..."
            value={searchCode}
            onChange={e => setSearchCode(e.target.value)}
          />
        </div>
      </div>
      
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--warm-white)' }}>
              <th style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--ink-mid)' }}>活體編號</th>
              <th style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--ink-mid)' }}>品種</th>
              <th style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--ink-mid)' }}>性別</th>
              <th style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--ink-mid)' }}>所屬門市</th>
              <th style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--ink-mid)' }}>在庫天數</th>
              <th style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--ink-mid)' }}>上架狀態</th>
              <th style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--ink-mid)' }}>最後修改人</th>
              <th style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--ink-mid)' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredPets.map(pet => {
              const storeName = stores.find(s => s.id === pet.store_id)?.name || `門市 ID: ${pet.store_id}`;
              return (
                <tr key={pet.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.1s' }}>
                  <td style={{ padding: '14px 16px', fontSize: '0.95rem', fontWeight: 700 }}>{pet.pet_code}</td>
                  <td style={{ padding: '14px 16px', fontSize: '0.95rem' }}>{pet.breed}</td>
                  <td style={{ padding: '14px 16px', fontSize: '0.95rem' }}>{pet.gender}</td>
                  <td style={{ padding: '14px 16px', fontSize: '0.95rem', color: 'var(--ink-mid)' }}>{storeName}</td>
                  <td style={{ padding: '14px 16px', fontSize: '0.95rem', fontWeight: 600 }}>{pet.days_in_store} 天</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span className="badge" style={{ margin: 0, backgroundColor: pet.publish_status === '上架中' ? '#ebf8ff' : pet.publish_status === '洽詢中' ? '#fffff0' : '#f7fafc', color: pet.publish_status === '上架中' ? '#2b6cb0' : pet.publish_status === '洽詢中' ? '#744210' : '#a0aec0', border: '1px solid ' + (pet.publish_status === '上架中' ? '#bee3f8' : pet.publish_status === '洽詢中' ? '#fef08a' : '#e2e8f0') }}>
                      {pet.publish_status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '0.9rem', color: 'var(--ink-mid)' }}>
                    {pet.updated_by || '-'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <button 
                      className="btn btn-cancel" 
                      style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                      onClick={() => onEditPet(pet)}
                    >
                      📝 編輯/狀態管理
                    </button>
                  </td>
                </tr>
              );
            })}
            {filteredPets.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-light)' }}>尚無合適的活體資料</td>
              </tr>
            )}
          </tbody>
        </table>
        {pagination && pagination.total_pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', gap: '1rem', borderTop: '1px solid var(--border)' }}>
            <button 
              className="btn btn-cancel" 
              disabled={pagination.current_page <= 1}
              onClick={() => onPageChange(pagination.current_page - 1)}
            >
              上一頁
            </button>
            <span style={{ fontSize: '0.9rem', color: 'var(--ink-mid)' }}>
              第 {pagination.current_page} 頁 / 共 {pagination.total_pages} 頁
            </span>
            <button 
              className="btn btn-cancel" 
              disabled={pagination.current_page >= pagination.total_pages}
              onClick={() => onPageChange(pagination.current_page + 1)}
            >
              下一頁
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default PetManagementTable;
