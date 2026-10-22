import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ roles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-warning" role="status" aria-label="Đang tải" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return <Outlet />;
}
