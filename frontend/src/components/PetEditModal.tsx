import React, { useState, useEffect } from 'react';
import api, { getImageUrl } from '../api';
import type { Pet } from '../hooks/usePets';

interface PetStatusLog {
  id: number;
  pet_code: string;
  operator: string;
  old_status?: string;
  new_status: string;
  unpublish_reason?: string;
  unpublish_note?: string;
  created_at: string;
}

interface PetEditModalProps {
  pet: Pet;
  username: string;
  onClose: () => void;
  onSave: (pet_code: string, payload: any) => Promise<void>;
}

const PetEditModal: React.FC<PetEditModalProps> = ({ pet, username, onClose, onSave }) => {
  const [activeModalTab, setActiveModalTab] = useState<'edit' | 'logs'>('edit');
  const [statusLogs, setStatusLogs] = useState<PetStatusLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [features, setFeatures] = useState(pet.features || '');
  const [specialNotes, setSpecialNotes] = useState(pet.special_notes || '');
  const [coverPhoto, setCoverPhoto] = useState(pet.cover_photo || '');
  const [publishStatus, setPublishStatus] = useState(pet.publish_status || '上架中');
  const [unpublishReason, setUnpublishReason] = useState('');
  const [unpublishNote, setUnpublishNote] = useState('');

  const [otherPhotosList, setOtherPhotosList] = useState<string[]>([]);

  useEffect(() => {
    let otherPhotos: string[] = [];
    if (pet.other_photos) {
      try {
        otherPhotos = JSON.parse(pet.other_photos);
      } catch {
        otherPhotos = [];
      }
    }
    setOtherPhotosList(otherPhotos);

    const fetchLogs = async () => {
      try {
        const res = await api.get(`/pets/${pet.pet_code}/status-logs`);
        setStatusLogs(res.data);
      } catch (e) {
        setStatusLogs([]);
      }
    };
    fetchLogs();
  }, [pet]);

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/pets/upload-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCoverPhoto(res.data.url);
      } catch (err: any) {
        alert('照片上傳失敗：' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const handleOtherPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/pets/upload-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setOtherPhotosList(prev => [...prev, res.data.url]);
      } catch (err: any) {
        alert('照片上傳失敗：' + (err.response?.data?.detail || err.message));
      }
    }
  };

  const removeOtherPhoto = (idxToRemove: number) => {
    setOtherPhotosList(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSave = async () => {
    const featureCount = features.trim().length;
    if (featureCount < 50 || featureCount > 100) {
      alert('個體特色說明不符合 50-100 字的限制！');
      return;
    }

    if (publishStatus === '已下架' && unpublishReason === '其他' && !unpublishNote.trim()) {
      alert('選擇「其他」原因時，請務必填寫備註。');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        cover_photo: coverPhoto || null,
        other_photos: otherPhotosList.length > 0 ? JSON.stringify(otherPhotosList) : null,
        features: features.trim(),
        special_notes: specialNotes.trim() || null,
        publish_status: publishStatus,
        unpublish_reason: publishStatus === '已下架' ? unpublishReason : undefined,
        unpublish_note: publishStatus === '已下架' ? unpublishNote : undefined,
        operator: username
      };

      await onSave(pet.pet_code, payload);
      alert('修改成功！');
      onClose();
    } catch (err: any) {
      alert('儲存失敗：' + (err.response?.data?.detail || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const charCount = features.trim().length;
  const isFeatureLengthValid = charCount >= 50 && charCount <= 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <h3 className="modal-title" style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
          編輯管理：{pet.breed} ({pet.pet_code})
        </h3>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <button 
            style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: activeModalTab === 'edit' ? 700 : 500, color: activeModalTab === 'edit' ? 'var(--primary)' : 'var(--ink-light)', borderBottom: activeModalTab === 'edit' ? '3px solid var(--primary)' : 'none', cursor: 'pointer' }}
            onClick={() => setActiveModalTab('edit')}
          >
            📝 資料編輯
          </button>
          <button 
            style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: activeModalTab === 'logs' ? 700 : 500, color: activeModalTab === 'logs' ? 'var(--primary)' : 'var(--ink-light)', borderBottom: activeModalTab === 'logs' ? '3px solid var(--primary)' : 'none', cursor: 'pointer' }}
            onClick={() => setActiveModalTab('logs')}
          >
            📜 狀態異動紀錄 ({statusLogs.length})
          </button>
        </div>
        
        {activeModalTab === 'edit' && (
          <>
            <div style={{ background: '#f7fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginBottom: '0.5rem', fontWeight: 700 }}>📌 ERP 同步正式資料 (不可任意修改)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', fontSize: '0.85rem' }}>
                <div>活體編號: <strong>{pet.pet_code}</strong></div>
                <div>分類: <strong>{pet.category}</strong></div>
                <div>品種: <strong>{pet.breed}</strong></div>
                <div>性別: <strong>{pet.gender}</strong></div>
                <div>出生日期: <strong>{pet.birth_date}</strong></div>
                <div>建議售價: <strong>${pet.price.toLocaleString()}</strong></div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">封面照片</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: '120px',
                  height: '90px',
                  borderRadius: '8px',
                  backgroundImage: coverPhoto ? `url(${getImageUrl(coverPhoto)})` : `url(/pet_placeholder.png)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  border: '1px solid var(--border)'
                }} />
                <div>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleCoverPhotoUpload}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <div className="img-upload-hint">上傳照片後，將自動設定為電子型錄的封面主照</div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">其他相簿照片 (可多張)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                {otherPhotosList.map((photo, idx) => (
                  <div 
                    key={idx} 
                    style={{ 
                      width: '70px', 
                      height: '70px', 
                      backgroundImage: `url(${getImageUrl(photo)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: '6px',
                      position: 'relative',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <button 
                      onClick={() => removeOtherPhoto(idx)}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleOtherPhotoUpload}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">個體特色說明 <span style={{ color: '#e53e3e' }}>*</span> (限 50-100 字)</label>
              <textarea 
                className="form-input" 
                rows={3} 
                placeholder="請客觀描述活體的個性、親人程度或外觀特色..."
                value={features}
                onChange={e => setFeatures(e.target.value)}
                style={{ borderColor: !isFeatureLengthValid && charCount > 0 ? '#e53e3e' : 'var(--border)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '4px' }}>
                <span style={{ color: isFeatureLengthValid ? '#48bb78' : '#e53e3e', fontWeight: 600 }}>目前字數：{charCount} 字</span>
                <span style={{ color: 'var(--ink-light)' }}>此內容將直接呈現於前台型錄，請勿填寫情緒化字眼。</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">特殊注意事項 (內部備註，不公開)</label>
              <textarea 
                className="form-input" 
                rows={2} 
                placeholder="例如：需特別注意飲食、已預約看狗等..."
                value={specialNotes}
                onChange={e => setSpecialNotes(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">前台型錄展示狀態 <span style={{ color: '#e53e3e' }}>*</span></label>
              <select 
                className="form-input" 
                value={publishStatus} 
                onChange={e => {
                  setPublishStatus(e.target.value);
                  if (e.target.value !== '已下架') {
                    setUnpublishReason('');
                    setUnpublishNote('');
                  }
                }}
                style={{ background: publishStatus === '上架中' ? '#ebf8ff' : '#fff' }}
              >
                <option value="草稿">草稿 (準備中)</option>
                <option value="上架中">上架中 (正常顯示)</option>
                <option value="洽詢中">洽詢中 (仍顯示，但標記有人詢問)</option>
                <option value="暫停上架">暫停上架 (生病或其他原因)</option>
                <option value="已下架">已下架 (不顯示於前台)</option>
              </select>
            </div>

            {publishStatus === '已下架' && (
              <div style={{ background: '#fff5f5', padding: '1rem', borderRadius: '8px', border: '1px solid #fed7d7', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ color: '#c53030' }}>下架原因歸類</label>
                  <select 
                    className="form-input" 
                    value={unpublishReason} 
                    onChange={e => setUnpublishReason(e.target.value)}
                  >
                    <option value="">請選擇原因...</option>
                    <option value="已成交">已成交</option>
                    <option value="客戶保留中">客戶保留中</option>
                    <option value="健康因素隔離">健康因素隔離</option>
                    <option value="退回繁殖場">退回繁殖場/供應商</option>
                    <option value="其他">其他 (請於備註說明)</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ color: '#c53030' }}>下架備註細節 {unpublishReason === '其他' && '*'}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="請簡述下架細節..."
                    value={unpublishNote}
                    onChange={e => setUnpublishNote(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={onClose} disabled={isSaving}>取消返回</button>
              <button 
                className="btn btn-primary" 
                onClick={handleSave}
                disabled={isSaving || !isFeatureLengthValid}
              >
                {isSaving ? '儲存中...' : '💾 確認儲存'}
              </button>
            </div>
          </>
        )}

        {activeModalTab === 'logs' && (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {statusLogs.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--ink-light)' }}>尚無任何異動紀錄</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#f7fafc', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>時間</th>
                    <th style={{ padding: '10px' }}>操作人員</th>
                    <th style={{ padding: '10px' }}>狀態變更</th>
                    <th style={{ padding: '10px' }}>原因/備註</th>
                  </tr>
                </thead>
                <tbody>
                  {statusLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px', color: 'var(--ink-mid)' }}>{new Date(log.created_at).toLocaleString('zh-TW')}</td>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{log.operator || '系統管理維護'}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ textDecoration: 'line-through', color: '#a0aec0', marginRight: '4px' }}>{log.old_status}</span> 
                        ➔ <strong style={{ color: 'var(--primary)' }}>{log.new_status}</strong>
                      </td>
                      <td style={{ padding: '10px', color: 'var(--ink-mid)' }}>
                        {log.unpublish_reason && <span style={{ background: '#edf2f7', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', marginRight: '4px' }}>{log.unpublish_reason}</span>}
                        {log.unpublish_note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-cancel" onClick={onClose}>關閉</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetEditModal;
