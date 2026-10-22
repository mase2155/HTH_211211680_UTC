import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function BookingPage() {
  return (
    <div className="booking-page page-placeholder">
      <h1 className="fw-bold">Đặt lịch sân</h1>
      <p className="text-muted mb-4">Trang chọn sân và khung giờ sẽ được hoàn thiện ở bước tiếp theo (Giai đoạn 4).</p>
      <Link to={ROUTES.home} className="btn btn-outline-secondary">
        Về trang chủ
      </Link>
    </div>
  );
}
