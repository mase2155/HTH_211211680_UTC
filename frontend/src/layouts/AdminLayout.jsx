import { Link, Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <>
      <nav>
        <Link to="/admin">Dashboard</Link>
        {' | '}
        <Link to="/admin/users">Người dùng</Link>
        {' | '}
        <Link to="/admin/field-types">Loại sân</Link>
        {' | '}
        <Link to="/admin/fields">Sân</Link>
        {' | '}
        <Link to="/admin/time-slots">Khung giờ</Link>
        {' | '}
        <Link to="/admin/prices">Giá thuê</Link>
        {' | '}
        <Link to="/admin/bookings">Đơn đặt</Link>
        {' | '}
        <Link to="/">Về trang khách</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
