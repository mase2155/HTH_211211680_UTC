import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function NotFoundPage() {
  return (
    <div className="not-found-page page-placeholder">
      <h1 className="display-4 fw-bold">404</h1>
      <p className="text-muted mb-4">Không tìm thấy trang bạn yêu cầu.</p>
      <Link to={ROUTES.home} className="btn btn-warning">
        Về trang chủ
      </Link>
    </div>
  );
}
