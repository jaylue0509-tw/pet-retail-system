import axios from 'axios';

// NOTE：FastAPI 後端 API 基礎路徑
// 本地開發：VITE_API_URL 未設定時使用空字串，前端呼叫 /api/* 由 vite proxy 轉發
// Vercel 生產：相對路徑 /api/* 由 Vercel routePrefix 路由到後端
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const getImageUrl = (url: string | undefined | null) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL}${url}`;
};

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

export interface Pet {
  id: number;
  pet_code: string;
  name: string;
  species: string;
  breed?: string;
  gender: string;
  birth_date?: string;
  description?: string;
  price: number;
  cover_photo?: string;
  other_photos?: string;
  features?: string;
  special_notes?: string;
  publish_status: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  created_by?: string;
  updated_by?: string;
  store?: any;
  
  // 計算欄位
  current_age_months?: number;
  days_in_store?: number;
}

export interface PetStatusLog {
  id: number;
  pet_code: string;
  operator: string;
  old_status?: string;
  new_status: string;
  unpublish_reason?: string;
  unpublish_note?: string;
  created_at: string;
}

// 自動在 Header 中夾帶 token 進行 API 身份驗證
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
