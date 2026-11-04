import { NavLink } from 'react-router-dom';
import { useNavigationGuard } from '../hooks/useUnsavedChanges.js';
import { useAuth } from '../hooks/useAuth.js';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { requestAction } = useNavigationGuard();

  const menuItems = [
    { path: '/ventas', label: 'Punto de venta', icon: 'bi-cart3', roles: ['Cajero'] },
    {
      path: '/reportes',
      label: 'Reporte de ventas',
      icon: 'bi-file-earmark-bar-graph',
      roles: ['Administrador'],
    },
    {
      path: '/clientes',
      label: 'Clientes',
      icon: 'bi-people',
      roles: ['Administrador', 'Cajero'],
    },
    {
      path: '/productos',
      label: 'Productos',
      icon: 'bi-box-seam',
      roles: ['Administrador', 'Cajero'],
    },
    {
      path: '/categorias',
      label: 'Categorías',
      icon: 'bi-collection',
      roles: ['Administrador'],
    },
    {
      path: '/usuarios',
      label: 'Usuarios y accesos',
      icon: 'bi-person-badge',
      roles: ['Administrador'],
    },
    {
      path: '/historial',
      label: 'Historial de ventas',
      icon: 'bi-clock-history',
      roles: ['Cajero'],
    },
  ].filter((item) => item.roles.includes(user?.rol));

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <i
            className="bi bi-basket2-fill"
            style={{ fontSize: '1.8rem', color: '#DCA349' }}
          ></i>
        </div>
        <h4>ALTOKE</h4>
        <div className="brand-sub">MINIMARKET S.A.C.</div>
        <div
          style={{
            fontSize: '0.62rem',
            color: 'rgba(255,255,255,0.4)',
            marginTop: '4px',
          }}
        >
          SISTEMA DE PUNTO DE VENTA
        </div>
      </div>

      {/* Navigation List */}
      <ul className="sidebar-nav">
        {menuItems.map((item) => {
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link w-100 text-start border-0 ${isActive ? 'active' : ''}`
                }
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* User Footer Profile */}
      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="avatar-circle">
            {(user?.nombres || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="user-meta">
            <div className="user-name" title={`${user?.nombres} ${user?.apellidos}`}>
              {user?.nombres} {user?.apellidos}
            </div>
            <div className="user-role">{user?.rol || 'Usuario'}</div>
          </div>
        </div>
        <button
          className="btn-logout"
          onClick={() => requestAction(logout)}
          title="Cerrar sesión segura"
        >
          <i className="bi bi-box-arrow-right"></i>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
