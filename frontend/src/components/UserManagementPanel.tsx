import React, { useState, useEffect } from 'react';
import api from '../api';
import type { Store } from '../hooks/useStores';

interface User {
  id: number;
  username: string;
  full_name?: string;
  role: string;
  store_id?: number;
  plain_password?: string;
}

interface UserManagementPanelProps {
  stores: Store[];
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ stores }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPasswordMap, setShowPasswordMap] = useState<Record<number, boolean>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', full_name: '', role: 'store_manager', store_id: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError('無法載入使用者列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const togglePassword = (id: number) => {
    setShowPasswordMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('確定要刪除此帳號？')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('刪除失敗');
    }
  };

  const openModal = (user: User | null) => {
    if (user) {
      setEditingUser(user);
      setFormData({ 
        username: user.username, 
        password: '', 
        full_name: user.full_name || '', 
        role: user.role, 
        store_id: user.store_id ? String(user.store_id) : '' 
      });
    } else {
      setEditingUser(null);
      setFormData({ username: '', password: '', full_name: '', role: 'store_manager', store_id: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload: any = {
        full_name: formData.full_name,
        role: formData.role,
        store_id: formData.store_id ? parseInt(formData.store_id, 10) : null
      };

      if (editingUser) {
        if (formData.password) payload.password = formData.password;
        await api.put(`/users/${editingUser.id}`, payload);
      } else {
        if (!formData.username || !formData.password) return alert('帳號與密碼為必填');
        payload.username = formData.username;
        payload.password = formData.password;
        await api.post('/users', payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || '儲存失敗');
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0, color: 'var(--ink)' }}>👥 帳號權限管理</h2>
        <button className="btn btn-primary" onClick={() => openModal(null)}>＋ 新增帳號</button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {loading ? <p>載入中...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>帳號 (登入用)</th>
                <th>姓名</th>
                <th>權限</th>
                <th>所屬門市</th>
                <th>目前密碼</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.full_name || '-'}</td>
                  <td>
                    <span className="badge" style={{ background: u.role === 'admin' ? '#ebf8ff' : '#f0fff4', color: u.role === 'admin' ? '#2b6cb0' : '#276749' }}>
                      {u.role === 'admin' ? '系統管理員' : '門市人員'}
                    </span>
                  </td>
                  <td>{stores.find(s => s.id === u.store_id)?.name || '無 (總部)'}</td>
                  <td>
                    {u.plain_password ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{showPasswordMap[u.id] ? u.plain_password : '••••••••'}</span>
                        <button onClick={() => togglePassword(u.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                          {showPasswordMap[u.id] ? '🙈' : '👁️'}
                        </button>
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginRight: '0.5rem' }} onClick={() => openModal(u)}>編輯</button>
                    {u.role !== 'admin' && (
                      <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleDelete(u.id)}>刪除</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--ink)' }}>{editingUser ? '編輯帳號' : '新增帳號'}</h3>
            
            {!editingUser && (
              <div className="form-group">
                <label className="form-label">登入帳號 (必填)</label>
                <input className="form-input" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="例如: manhattan_user1" />
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">{editingUser ? '重設密碼 (若不修改請留空)' : '登入密碼 (必填)'}</label>
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
              <button className="btn btn-cancel" onClick={() => setIsModalOpen(false)}>取消</button>
              <button className="btn btn-primary" onClick={handleSave}>儲存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPanel;
