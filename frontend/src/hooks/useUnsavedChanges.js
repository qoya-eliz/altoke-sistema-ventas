import { useContext, useEffect, useId } from 'react';
import { NavigationContext } from '../context/navigation-store.js';
export function useNavigationGuard() {
  return useContext(NavigationContext);
}
export function useUnsavedChanges(dirty, label) {
  const id = useId();
  const { register } = useNavigationGuard();
  useEffect(() => {
    register(id, dirty, label);
    return () => register(id, false);
  }, [dirty, id, label, register]);
}
