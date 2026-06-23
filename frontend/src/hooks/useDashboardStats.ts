import { useState, useEffect } from 'react';
import api from '../api';

export interface DashboardStats {
  active_stores: number;
  total_pets: number;
  dogs_count: number;
  cats_count: number;
  new_pets_this_month: number;
  sold_pets_this_month: number;
  stale_pets_count: number;
  regional_stats: Record<string, number>;
  northstar_metric: number;
  store_activation_rate: number;
  pet_publish_rate: number;
  photo_completeness_rate: number;
  sold_not_unpublished_rate: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err: any) {
      setError(err.message || "載入統計數據失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};
