import { Link, Outlet } from 'react-router-dom';

export default function Navbar() {
  return (
    <header>
      <nav>
        <Link to="/">Trang chủ</Link>
        {' | '}
        <Link to="/search">Tìm sân</Link>
        {' | '}
        <Link to="/history">Lịch sử</Link>
        {' | '}
        <Link to="/login">Đăng nhập</Link>
        {' | '}
        <Link to="/admin">Admin</Link>
      </nav>
    </header>
  );
}
