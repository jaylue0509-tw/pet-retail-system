import { useState, useEffect } from 'react';
import api from '../api';

export interface PetBrief {
  id: number;
  name: string;
  category: string;
  breed: string;
  status: string;
  cover_photo?: string | null;
  publish_status: string;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  phone: string;
  business_hours: string;
  grooming_hours: string | null;
  license_number?: string | null;
  can_trade_dog: boolean;
  can_trade_cat: boolean;
  pets: PetBrief[];
}

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 0, current_page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async (params: any = { page: 1, size: 12 }) => {
    setLoading(true);
    try {
      const res = await api.get('/stores', { params });
      if (res.data && res.data.items) {
        const formattedStores = res.data.items.map((s: any) => {
          const activePets = s.pets ? s.pets.filter((p: any) => (p.publish_status === '上架中' || p.publish_status === '洽詢中') && p.status === '在庫') : [];
          return {
            id: s.id,
            name: s.name,
            license_number: s.license_number,
            address: s.address || '暫無地址',
            phone: s.phone || '暫無電話',
            business_hours: s.business_hours || '11:00 - 22:00',
            grooming_hours: s.grooming_hours || '無美容服務',
            can_trade_dog: !!s.can_trade_dog,
            can_trade_cat: !!s.can_trade_cat,
            pets: activePets.map((p: any) => ({
              id: p.id,
              name: p.name,
              category: p.category,
              breed: p.breed,
              status: p.status,
              cover_photo: p.cover_photo,
              publish_status: p.publish_status
            }))
          };
        });
        setStores(formattedStores);
        setPagination({
          total_count: res.data.total_count || 0,
          total_pages: res.data.total_pages || 0,
          current_page: res.data.current_page || 1
        });
      }
    } catch (err: any) {
      console.error("無法載入伺服器門市資料：", err);
      setError(err.message || "載入失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  return {
    stores,
    pagination,
    loading,
    error,
    refetch: fetchStores
  };
};
