import React from 'react';
import type { DashboardStats } from '../hooks/useDashboardStats';

interface DashboardOverviewProps {
  stats: DashboardStats | null;
  loading: boolean;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return <div>載入中...</div>;
  }

  return (
    <>
      <div className="admin-topbar">
        <h2 className="admin-title" style={{ fontWeight: 700 }}>全台平台統計與 KPI 監控</h2>
        <span style={{ color: 'var(--ink-light)', fontSize: '0.9rem' }}>
          更新時間：{new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #2b6cb0, #2a8bc4)', 
        color: '#fff', 
        padding: '2rem', 
        borderRadius: '20px', 
        boxShadow: '0 10px 25px rgba(42, 139, 196, 0.25)',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>
            ⭐ 第一階段北極星指標 (NORTHSTAR METRIC)
          </span>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '1rem 0 0.5rem 0' }}>
            {stats.northstar_metric} 隻
          </h3>
          <p style={{ fontSize: '1rem', opacity: 0.9, fontWeight: 500 }}>
            平台有效上架活體資料數
          </p>
          <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.8rem' }}>
            定義條件：仍在庫、有照片、基本資料與所屬門市正確，且在 7 天內更新確認過之活體資料。
          </div>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '12rem', opacity: 0.1, pointerEvents: 'none' }}>⭐</div>
      </div>

      <h3 style={{ fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem', fontWeight: 700 }}>建議 KPI 達成進度</h3>
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card" style={{ borderTop: '4px solid ' + (stats.store_activation_rate >= 80 ? '#48bb78' : '#dd6b20') }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-num" style={{ color: stats.store_activation_rate >= 80 ? '#48bb78' : '#dd6b20' }}>
              {stats.store_activation_rate}%
            </span>
            <span style={{ fontSize: '0.8rem', background: '#edf2f7', color: 'var(--ink-mid)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>目標: ≥80%</span>
          </div>
          <div className="stat-label" style={{ fontWeight: 600 }}>活體門市啟用率</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: '4px' }}>已啟用/全台有特寵執照門市</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid ' + (stats.pet_publish_rate >= 90 ? '#48bb78' : '#dd6b20') }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-num" style={{ color: stats.pet_publish_rate >= 90 ? '#48bb78' : '#dd6b20' }}>
              {stats.pet_publish_rate}%
            </span>
            <span style={{ fontSize: '0.8rem', background: '#edf2f7', color: 'var(--ink-mid)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>目標: ≥90%</span>
          </div>
          <div className="stat-label" style={{ fontWeight: 600 }}>在庫活體上架率</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: '4px' }}>已上架/在庫活體總數</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid ' + (stats.photo_completeness_rate >= 90 ? '#48bb78' : '#dd6b20') }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-num" style={{ color: stats.photo_completeness_rate >= 90 ? '#48bb78' : '#dd6b20' }}>
              {stats.photo_completeness_rate}%
            </span>
            <span style={{ fontSize: '0.8rem', background: '#edf2f7', color: 'var(--ink-mid)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>目標: ≥90%</span>
          </div>
          <div className="stat-label" style={{ fontWeight: 600 }}>活體照片完整率</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: '4px' }}>已上傳封面照片/上架活體</div>
        </div>
        <div className="stat-card" style={{ borderTop: '4px solid ' + (stats.sold_not_unpublished_rate <= 5 ? '#48bb78' : '#e53e3e') }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="stat-num" style={{ color: stats.sold_not_unpublished_rate <= 5 ? '#48bb78' : '#e53e3e' }}>
              {stats.sold_not_unpublished_rate}%
            </span>
            <span style={{ fontSize: '0.8rem', background: '#edf2f7', color: 'var(--ink-mid)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>目標: &lt;5%</span>
          </div>
          <div className="stat-label" style={{ fontWeight: 600 }}>已成交未下架率</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', marginTop: '4px' }}>標記成交卻仍在前台展示之比例</div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem', fontWeight: 700 }}>門市與活體狀態概況</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num">{stats.active_stores}</div>
          <div className="stat-label">啟用門市數</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{stats.total_pets}</div>
          <div className="stat-label">目前上架活體數</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#3182ce' }}>{stats.dogs_count}</div>
          <div className="stat-label">🐶 犬隻上架數</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#dd6b20' }}>{stats.cats_count}</div>
          <div className="stat-label">🐱 貓咪上架數</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #48bb78' }}>
          <div className="stat-num" style={{ color: '#48bb78' }}>{stats.new_pets_this_month}</div>
          <div className="stat-label">本月新增上架活體數</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #805ad5' }}>
          <div className="stat-num" style={{ color: '#805ad5' }}>{stats.sold_pets_this_month}</div>
          <div className="stat-label">本月成交活體數</div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #e53e3e' }}>
          <div className="stat-num" style={{ color: '#e53e3e' }}>{stats.stale_pets_count}</div>
          <div className="stat-label">近期未更新資料數 (7天以上)</div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '1rem', fontWeight: 700 }}>各區上架活體數分佈</h3>
      <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {Object.entries(stats.regional_stats).map(([region, count]) => {
            const percent = stats.total_pets > 0 ? (count / stats.total_pets) * 100 : 0;
            return (
              <div key={region} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ width: '50px', fontWeight: 600 }}>{region}區</span>
                <div style={{ flex: 1, height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s' }} />
                </div>
                <span style={{ width: '40px', textAlign: 'right', fontWeight: 700 }}>{count} 隻</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DashboardOverview;
