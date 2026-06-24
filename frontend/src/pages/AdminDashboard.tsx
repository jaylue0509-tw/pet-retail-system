import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { usePets } from '../hooks/usePets';
import type { Pet } from '../hooks/usePets';
import { useStores } from '../hooks/useStores';

import AdminSidebar from '../components/AdminSidebar';
import DashboardOverview from '../components/DashboardOverview';
import PetManagementTable from '../components/PetManagementTable';
import ErpSyncPanel from '../components/ErpSyncPanel';
import PetEditModal from '../components/PetEditModal';
import UserManagementPanel from '../components/UserManagementPanel';

const AdminDashboard: React.FC = () => {
  const { isLoggedIn, username, userRole, userStoreId, login, logout } = useAuth();
  const { stats, loading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { stores } = useStores({ page: 1, size: 200 });
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const petsParams = userRole === 'store_manager' && userStoreId ? { store_id: userStoreId, publish_status_filter: 'all', status_filter: 'all' } : { publish_status_filter: 'all', status_filter: 'all' };
  const { petsList, pagination, fetchPets, updatePet } = usePets(petsParams);

  // NOTE：用 useCallback 穩定函式引用，避免 useEffect 因函式重新創建而無限觸發
  const stableFetchPets = useCallback(() => {
    fetchPets();
  }, [userRole, userStoreId]);

  const stableRefetchStats = useCallback(() => {
    refetchStats();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      stableRefetchStats();
      stableFetchPets();
    }
  }, [isLoggedIn, stableFetchPets, stableRefetchStats]);

  const handleLogin = async () => {
    try {
      setLoginError('');
      await login(loginUser, loginPass);
    } catch (err: any) {
      setLoginError(err.response?.data?.detail || '登入失敗，請檢查密碼。');
    }
  };

  const openEditModal = (pet: Pet) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
  };

  const handleSavePet = async (pet_code: string, payload: any) => {
    await updatePet(pet_code, payload);
    fetchPets();
    refetchStats();
  };

  const handleSyncComplete = () => {
    fetchPets();
    refetchStats();
  };

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: 'calc(100vh - 73px)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--warm-white)' }}>
        <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ textAlign: 'center', color: 'var(--ink)', fontSize: '1.6rem', marginBottom: '0.5rem', fontWeight: 700 }}>門市活體管理登入</h2>
          <p style={{ textAlign: 'center', color: 'var(--ink-light)', fontSize: '0.9rem', marginBottom: '2rem' }}>請輸入您的同仁帳號密碼進行驗證</p>
          
          <div className="form-group">
            <label className="form-label">管理帳號 (如 admin / manhattan)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="請輸入帳號"
              value={loginUser} 
              onChange={e => setLoginUser(e.target.value)} 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">密碼 (測試預設 admin123 或 store123)</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="請輸入密碼"
              value={loginPass} 
              onChange={e => setLoginPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          
          {loginError && <p style={{ color: '#e53e3e', fontSize: '0.85rem', marginBottom: '1.2rem', textAlign: 'center', fontWeight: 600 }}>⚠ {loginError}</p>}
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '8px', fontWeight: 700 }} 
            onClick={handleLogin}
          >
            登入管理系統
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={userRole} 
        onLogout={logout} 
      />

      <main className="admin-main">
        {activeTab === 'overview' && (
          <DashboardOverview stats={stats} loading={statsLoading} />
        )}

        {activeTab === 'pets' && (
          <PetManagementTable 
            pets={petsList} 
            stores={stores} 
            userRole={userRole} 
            pagination={pagination}
            onPageChange={(page) => fetchPets({ page })}
            onEditPet={openEditModal} 
            onSyncComplete={handleSyncComplete}
          />
        )}

        {activeTab === 'erp' && userRole === 'admin' && (
          <ErpSyncPanel onSyncComplete={handleSyncComplete} />
        )}

        {activeTab === 'users' && userRole === 'admin' && (
          <UserManagementPanel stores={stores} />
        )}
      </main>

      {isModalOpen && selectedPet && (
        <PetEditModal 
          pet={selectedPet} 
          username={username} 
          onClose={() => setIsModalOpen(false)} 
          onSave={handleSavePet} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;
