import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import NavigationProvider from '../context/NavigationProvider.jsx';
import ModalAccessibility from '../components/ModalAccessibility.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import { legacy } from './routes.config.js';
const Login = lazy(() => import('../modules/auth/LoginPage.jsx'));
function home(role) {
  return role ? '/inicio' : '/login';
}
export default function App() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      
      <div
        className="min-vh-100 d-flex justify-content-center align-items-center"
        role="status"
      >
        Verificando sesión…
      </div>
    );
  }
  return (
    <NavigationProvider>
      <ModalAccessibility />
      <Suspense
        fallback={
          <div className="p-4" role="status">
            Cargando apartado…
          </div>
        }
      >
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to={home(user.rol)} replace /> : <Login />}
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/inicio" element={<div className="p-4">Sesión iniciada. Los módulos se incorporan en los siguientes commits.</div>} />
            </Route>
          </Route>
          {Object.entries(legacy).map(([old, to]) => (
            <Route key={old} path={old} element={<Navigate to={to} replace />} />
          ))}
          <Route
            path="*"
            element={<Navigate to={user ? home(user.rol) : '/login'} replace />}
          />
        </Routes>
      </Suspense>
    </NavigationProvider>
  );
}
