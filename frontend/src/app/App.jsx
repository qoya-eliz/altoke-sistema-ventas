import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import NavigationProvider from '../context/NavigationProvider.jsx';
import ModalAccessibility from '../components/ModalAccessibility.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import { legacy } from './routes.config.js';
const Login = lazy(() => import('../modules/auth/LoginPage.jsx'));
const SalesReport = lazy(() => import('../modules/sales/pages/SalesReportPage.jsx'));
const Clients = lazy(() => import('../modules/clients/ClientsPage.jsx'));
const Products = lazy(() => import('../modules/products/ProductsPage.jsx'));
const CategoriesAdmin = lazy(() => import('../modules/categories/CategoriesPage.jsx'));
const UsersAdmin = lazy(() => import('../modules/users/UsersPage.jsx'));
const POS = lazy(() => import('../modules/sales/pages/PosPage.jsx'));
const SalesHistoryCashier = lazy(
  () => import('../modules/sales/pages/SalesHistoryPage.jsx'),
);
function home(role) {
  return role === 'Administrador' ? '/reportes' : '/ventas';
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
              <Route path="/clientes" element={<Clients key={user?.rol} />} />
              <Route path="/productos" element={<Products key={user?.rol} />} />
              <Route element={<ProtectedRoute roles={['Administrador']} />}>
                <Route path="/reportes" element={<SalesReport />} />
                <Route path="/categorias" element={<CategoriesAdmin />} />
                <Route path="/usuarios" element={<UsersAdmin />} />
              </Route>
              <Route element={<ProtectedRoute roles={['Cajero']} />}>
                <Route path="/ventas" element={<POS />} />
                <Route path="/historial" element={<SalesHistoryCashier />} />
              </Route>
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
