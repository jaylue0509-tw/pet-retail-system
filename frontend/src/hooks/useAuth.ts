import { useState, useEffect } from 'react';
import api from '../api';

const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [userRole, setUserRole] = useState<'admin' | 'store_manager'>('store_manager');
  const [userStoreId, setUserStoreId] = useState<number | null>(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setIsLoggedIn(true);
        setUsername(decoded.sub);
        setFullName(decoded.full_name || '');
        setUserRole(decoded.role);
        setUserStoreId(decoded.store_id);
      } else {
        logout();
      }
    }
  };

  const login = async (user: string, pass: string) => {
    const res = await api.post('/auth/login', { username: user, password: pass });
    const token = res.data.access_token;
    localStorage.setItem('token', token);
    checkToken();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    setFullName('');
    setUserStoreId(null);
  };

  return {
    isLoggedIn,
    username,
    fullName,
    userRole,
    userStoreId,
    login,
    logout
  };
};
