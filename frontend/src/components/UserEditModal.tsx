import React, { useState, useEffect } from 'react';
import type { Store } from '../hooks/useStores';
import api from '../api';

interface User {
  id: number;
  username: string;
  full_name?: string;
  role: string;
  store_id?: number;
}

interface UserEditModalProps {
  user: User | null;
  stores: Store[];
  onClose: () => void;
  onSaveComplete: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, stores, onClose, onSaveComplete }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    role: 'store_manager',
    store_id: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        password: '',
        full_name: user.full_name || '',
        role: user.role,
        store_id: user.store_id ? String(user.store_id) : ''
      });
    } else {
      setFormData({
        username: '',
        password: '',
        full_name: '',
        role: 'store_manager',
        store_id: ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      const payload: any = {
        full_name: formData.full_name,
        role: formData.role,
        store_id: formData.store_id ? parseInt(formData.store_id, 10) : null
      };

      if (user) {
        if (formData.password) payload.password = formData.password;
        await api.put(`/users/${user.id}`, payload);
      } else {
        if (!formData.username || !formData.password) return alert('帳號與密碼為必填');
        payload.username = formData.username;
        payload.password = formData.password;
        await api.post('/users', payload);
      }
      onSaveComplete();
    } catch (err: any) {
      alert(err.response?.data?.detail || '儲存失敗');
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '90%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--ink)' }}>{user ? '編輯帳號' : '新增帳號'}</h3>
        
        {!user && (
          <div className="form-group">
            <label className="form-label">登入帳號 (必填)</label>
            <input className="form-input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="例如: manhattan_user1" />
          </div>
        )}
        
        <div className="form-group">
          <label className="form-label">{user ? '重設密碼 (若不修改請留空)' : '登入密碼 (必填)'}</label>
          <input className="form-input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="請輸入密碼" />
        </div>

        <div className="form-group">
          <label className="form-label">姓名 (必填，用於紀錄操作人)</label>
          <input className="form-input" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="例如: 王小明" />
        </div>

        <div className="form-group">
          <label className="form-label">權限角色</label>
          <select className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="store_manager">門市人員</option>
            <option value="admin">系統管理員 (總部)</option>
          </select>
        </div>

        {formData.role === 'store_manager' && (
          <div className="form-group">
            <label className="form-label">所屬門市</label>
            <select className="form-input" value={formData.store_id} onChange={e => setFormData({...formData, store_id: e.target.value})}>
              <option value="">請選擇門市</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-cancel" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave}>儲存</button>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;
