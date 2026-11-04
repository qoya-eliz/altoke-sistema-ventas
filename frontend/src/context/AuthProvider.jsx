import authApi from '../modules/auth/auth.api.js';
import { useState, useEffect, useCallback } from 'react';

import { AuthContext } from './auth-store.js';
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logout = useCallback(() => {
    localStorage.removeItem('altoke_token');
    localStorage.removeItem('altoke_user');
    setUser(null);
  }, []);
  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      if (!localStorage.getItem('altoke_token')) {
        if (alive) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      try {
        const res = await authApi.me();
        if (alive) {
          setUser(res.data.data);
        }
      } catch {
        if (alive) {
          logout();
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };
    refresh();
    window.addEventListener('altoke:expired', logout);
    window.addEventListener('altoke:role-refresh', refresh);
    const sync = (e) => {
      if (e.key === 'altoke_token') {
        refresh();
      }
    };
    window.addEventListener('storage', sync);
    return () => {
      alive = false;
      window.removeEventListener('altoke:expired', logout);
      window.removeEventListener('altoke:role-refresh', refresh);
      window.removeEventListener('storage', sync);
    };
  }, [logout]);
  const login = async (nom_usuario, password) => {
    const res = await authApi.login({ nom_usuario, password });
    if (
      !res.data?.data?.token ||
      !['Administrador', 'Cajero'].includes(res.data.data.user?.rol)
    ) {
      throw new Error('Respuesta de autenticación inválida.');
    }
    localStorage.setItem('altoke_token', res.data.data.token);
    setUser(res.data.data.user);
    return res.data.data.user;
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
