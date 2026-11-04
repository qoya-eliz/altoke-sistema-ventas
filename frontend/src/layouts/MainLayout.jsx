import { titles } from '../app/routes.config.js';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
export default function MainLayout() {
  const { pathname } = useLocation();
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header title={titles[pathname] || 'ALTOKE POS'} />
        <main className="flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
