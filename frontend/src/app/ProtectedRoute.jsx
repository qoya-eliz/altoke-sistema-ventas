import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
function home(role) {
  return role === 'Administrador' ? '/reportes' : '/ventas';
}
export default function ProtectedRoute({ roles = ['Administrador', 'Cajero'] }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (!roles.includes(user.rol)) {
    return <Navigate to={home(user.rol)} replace />;
  }
  return <Outlet />;
}
