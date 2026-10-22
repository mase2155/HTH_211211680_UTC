import { Link, NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../features/auth/AuthContext';
import logo from '../../assets/images/layout/logo.jfif';

const navLinkClass = ({ isActive }) => `text-uppercase nav-link${isActive ? ' active' : ''}`;

const navItems = [
  { to: ROUTES.home, label: 'Trang chủ', end: true },
  { to: ROUTES.booking, label: 'Đặt Lịch' },
  { to: ROUTES.news, label: 'Tin Tức' },
  { to: ROUTES.partners, label: 'Đối Tác' },
  { to: ROUTES.contact, label: 'Liên hệ' },
];

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header>
      <div className="header-nav">
        <nav className="navbar navbar-expand-md navbar-dark">
          <div className="container-fluid d-flex justify-content-between">
            <div className="header-logo">
              <Link to={ROUTES.home}>
                <img src={logo} alt="logo" />
              </Link>
            </div>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNavDropdown"
              aria-controls="navbarNavDropdown"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="navbar_main" id="navbarNavDropdown">
              <ul className="navbar-nav text-center">
                {navItems.map((item) => (
                  <li key={item.to} className="nav-item">
                    <NavLink to={item.to} end={item.end} className={navLinkClass}>
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div className="user-login-icon">
              {user ? (
                <div className="dropdown">
                  <button
                    type="button"
                    className="user-login-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    title={user.fullName}
                    aria-label="Tài khoản"
                  >
                    <i className="fa-solid fa-image-portrait" />
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li className="dropdown-header text-truncate">{user.fullName}</li>
                    <li>
                      <Link className="dropdown-item" to={ROUTES.profile}>
                        Hồ sơ
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to={ROUTES.history}>
                        Lịch sử đặt sân
                      </Link>
                    </li>
                    {user.role === 'Admin' && (
                      <li>
                        <Link className="dropdown-item" to={ROUTES.admin}>
                          Quản trị
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button type="button" className="dropdown-item" onClick={() => logout()}>
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link to={ROUTES.login} title="Đăng nhập">
                  <i className="fa-solid fa-image-portrait" />
                </Link>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
