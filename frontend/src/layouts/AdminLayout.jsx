import { useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../features/auth/AuthContext';
import '../styles/admin.css';

const adminBase = ROUTES.admin;

const reportNav = [{ to: adminBase, label: 'Báo cáo hệ thống', icon: 'fa-chart-pie' }];

const contentNav = [
  { to: `${adminBase}/content/news`, label: 'Tin tức', icon: 'fa-newspaper' },
  { to: `${adminBase}/content/partners`, label: 'Đối tác', icon: 'fa-handshake' },
];

const catalogNav = [
  { to: `${adminBase}/catalog/field-types`, label: 'Loại sân', icon: 'fa-layer-group' },
];

const operationsNav = [
  { to: `${adminBase}/operations/bookings`, label: 'Đơn đặt lịch', icon: 'fa-calendar-check' },
  { to: `${adminBase}/operations/fields`, label: 'Quản lý sân', icon: 'fa-futbol' },
  { to: `${adminBase}/operations/order-status`, label: 'Quản lý đơn', icon: 'fa-list-check' },
];

function SidebarLink({ to, label, icon }) {
  return (
    <li className="nav-item">
      <NavLink to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end={to === adminBase}>
        <i className={`fa-solid ${icon} fa-fw`} />
        {label}
      </NavLink>
    </li>
  );
}

export default function AdminLayout() {
  const { user } = useAuth();

  useEffect(() => {
    const id = 'admin-font';
    if (document.getElementById(id)) return undefined;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;1,400&display=swap';
    document.head.appendChild(link);
    return undefined;
  }, []);

  return (
    <div className="admin-shell">
      <div className="wrapper">
        <aside className="main-sidebar">
          <Link to={adminBase} className="brand-link">
            ALOBO <span>Admin</span>
          </Link>
          <nav className="mt-2">
            <ul className="nav-sidebar">
              {reportNav.map((item) => (
                <SidebarLink key={item.to} {...item} />
              ))}
            </ul>
            <ul className="nav-sidebar">
              {contentNav.map((item) => (
                <SidebarLink key={item.to} {...item} />
              ))}
            </ul>
            <ul className="nav-sidebar">
              {catalogNav.map((item) => (
                <SidebarLink key={item.to} {...item} />
              ))}
            </ul>
            <ul className="nav-sidebar">
              {operationsNav.map((item) => (
                <SidebarLink key={item.to} {...item} />
              ))}
            </ul>
          </nav>
          <div className="mt-auto p-3">
            <Link to={ROUTES.home} className="btn btn-sm btn-outline-light w-100">
              ← Về trang khách
            </Link>
          </div>
        </aside>
        <div className="content-wrapper">
          <header className="main-header">
            <span className="text-muted small">Quản trị hệ thống đặt sân</span>
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-user-shield text-secondary" />
              <span className="small">{user?.fullName || user?.email || 'Admin'}</span>
            </div>
          </header>
          <main className="content">
            <div className="content-crud">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
