import { Link, NavLink } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../features/auth/AuthContext';
import logo from '../../assets/images/layout/logo.jfif';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="header-nav">
        <nav className="navbar navbar-expand-md">
          <div className="container-fluid d-flex justify-content-between">
            <div className="header-logo">
              <Link to={ROUTES.home}>
                <img src={logo} alt="Logo" />
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
            <div className="navbar_main collapse navbar-collapse" id="navbarNavDropdown">
              <ul className="navbar-nav text-center">
                <li className="nav-item">
                  <NavLink className="text-uppercase nav-link" to={ROUTES.home}>
                    Trang chủ
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="text-uppercase nav-link" to={ROUTES.booking}>
                    Đặt lịch
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="text-uppercase nav-link" to={ROUTES.news}>
                    Tin tức
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="text-uppercase nav-link" to={ROUTES.partners}>
                    Đối tác
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="text-uppercase nav-link" to={ROUTES.contact}>
                    Liên hệ
                  </NavLink>
                </li>
              </ul>
            </div>
            <div className="user-login-icon">
              {user ? (
                <div className="dropdown">
                  <button
                    className="btn btn-link text-white dropdown-toggle text-decoration-none"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <i className="fa-solid fa-user me-1" />
                    {user.fullName}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
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
