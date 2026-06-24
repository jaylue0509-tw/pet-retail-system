import React, { useState, useEffect } from 'react';
import api from '../api';
import type { Store } from '../hooks/useStores';
import UserEditModal from './UserEditModal';

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
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleSaveComplete = () => {
    setIsModalOpen(false);
    fetchUsers();
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
        <UserEditModal
          user={editingUser}
          stores={stores}
          onClose={() => setIsModalOpen(false)}
          onSaveComplete={handleSaveComplete}
        />
      )}
    </div>
  );
};

export default UserManagementPanel;
