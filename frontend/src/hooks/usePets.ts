import { useState, useEffect } from 'react';
import api from '../api';

export interface Pet {
  id: number;
  pet_code: string;
  name?: string | null;
  category: string;
  breed: string;
  gender: string;
  color?: string | null;
  birth_date: string;
  chip_number?: string | null;
  entry_date: string;
  price: number;
  supplier?: string | null;
  status: string;
  cover_photo?: string | null;
  other_photos?: string | null;
  features?: string | null;
  special_notes?: string | null;
  publish_status: string;
  days_in_store: number;
  current_age_months: number;
  store_id: number;
  updated_at: string;
  updated_by?: string;
}

export const usePets = (initialParams: any = {}) => {
  const [petsList, setPetsList] = useState<Pet[]>([]);
  const [pagination, setPagination] = useState({ total_count: 0, total_pages: 0, current_page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPets = async (params: any = {}) => {
    setLoading(true);
    try {
      const res = await api.get('/pets', { params: { ...initialParams, ...params } });
      setPetsList(res.data.items || []);
      setPagination({
        total_count: res.data.total_count || 0,
        total_pages: res.data.total_pages || 0,
        current_page: res.data.current_page || 1
      });
    } catch (err: any) {
      setError(err.message || "載入活體失敗");
    } finally {
      setLoading(false);
    }
  };

  const updatePet = async (pet_code: string, payload: any) => {
    const res = await api.put(`/pets/${pet_code}`, payload);
    return res.data;
  };

  useEffect(() => {
    fetchPets();
  }, []);

  return {
    petsList,
    pagination,
    loading,
    error,
    fetchPets,
    updatePet
  };
};
