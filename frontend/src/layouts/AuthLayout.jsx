import { Outlet } from 'react-router-dom';
import '../styles/pages/login.css';

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  );
}
