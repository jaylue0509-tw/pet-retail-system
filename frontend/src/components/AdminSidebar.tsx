import React from 'react';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: 'admin' | 'store_manager';
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, userRole, onLogout }) => {
  return (
    <aside className="admin-sidebar" style={{ background: '#1a202c' }}>
      <div className="sidebar-logo" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.2rem' }}>
        東寵媒合平台 <small style={{ display: 'block', fontSize: '0.75rem', opacity: 0.7, marginTop: '4px', color: '#a0aec0' }}>內部管理後台</small>
      </div>
      <nav className="sidebar-nav">
        <a
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          📊 平台統計儀表板
        </a>
        <a
          className={activeTab === 'pets' ? 'active' : ''}
          onClick={() => setActiveTab('pets')}
        >
          🐾 門市活體管理
        </a>
        {userRole === 'admin' && (
          <>
            <a
              className={activeTab === 'sync' ? 'active' : ''}
              onClick={() => setActiveTab('sync')}
            >
              🔄 ERP 資料同步匯入
            </a>
            <a
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              👥 帳號權限管理
            </a>
          </>
        )}
        
        <div style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: '8px' }}>
            登入身分: <strong>{userRole === 'admin' ? '系統管理員' : '門市店長'}</strong>
          </div>
          <button 
            className="btn btn-cancel" 
            style={{ width: '100%', padding: '6px', fontSize: '0.85rem', color: '#fc8181', borderColor: '#feb2b2', borderRadius: '6px' }}
            onClick={onLogout}
          >
            登出
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
