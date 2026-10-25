import { useContext } from 'react';
import { AuthContext } from '../context/auth-store.js';
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth requiere AuthProvider.');
  }
  return value;
}
