import { Link, NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { ADMIN_PROFILE } from '../../constants/adminProfile';
import { useAuth } from '../../features/auth/AuthContext';
import logo from '../../assets/images/layout/logo.jfif';
import '../../styles/account-menu.css';

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
  const isAdmin = user?.role === 'Admin';
  const displayName = isAdmin ? ADMIN_PROFILE.fullName : user?.fullName;
  const displayMeta = isAdmin ? `MSSV ${ADMIN_PROFILE.studentId}` : user?.email;

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
                    title={displayName}
                    aria-label="Tài khoản"
                  >
                    <i className="fa-solid fa-image-portrait" />
                  </button>
                  <div className="dropdown-menu dropdown-menu-end account-dropdown-menu">
                    <div className="account-dropdown-head">
                      <span className="account-dropdown-name">{displayName}</span>
                      <span className="account-dropdown-meta text-truncate d-block">{displayMeta}</span>
                      <span className="account-dropdown-role">{isAdmin ? 'Quản trị viên' : 'Khách hàng'}</span>
                    </div>
                    <div className="account-dropdown-body">
                      <Link className="account-dropdown-item" to={ROUTES.profile}>
                        <i className="fa-solid fa-id-card" />
                        Hồ sơ
                      </Link>
                      {!isAdmin && (
                        <Link className="account-dropdown-item" to={ROUTES.history}>
                          <i className="fa-solid fa-clock-rotate-left" />
                          Lịch sử đặt sân
                        </Link>
                      )}
                      {isAdmin && (
                        <Link className="account-dropdown-item account-dropdown-item--admin" to={ROUTES.admin}>
                          <i className="fa-solid fa-gauge-high" />
                          Báo cáo hệ thống
                        </Link>
                      )}
                      <hr className="account-dropdown-divider" />
                      <button
                        type="button"
                        className="account-dropdown-item account-dropdown-item--logout"
                        onClick={() => logout()}
                      >
                        <i className="fa-solid fa-right-from-bracket" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
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
