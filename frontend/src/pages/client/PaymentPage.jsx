import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../../constants/bookingLabels';
import { useBookingDetail, usePayBooking } from '../../features/bookings/bookings.hooks';
import { formatCurrency, formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';
import { formatTimeRange } from '../../utils/date';
import '../../styles/pages/booking.css';

function useHoldCountdown(holdExpiresAt) {
  const [remainingMs, setRemainingMs] = useState(null);

  useEffect(() => {
    if (!holdExpiresAt) {
      setRemainingMs(null);
      return undefined;
    }
    const tick = () => {
      const diff = Date.parse(holdExpiresAt) - Date.now();
      setRemainingMs(diff > 0 ? diff : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [holdExpiresAt]);

  if (remainingMs === null) return null;
  const totalSec = Math.floor(remainingMs / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const bookingQuery = useBookingDetail(bookingId);
  const payBooking = usePayBooking();
  const [error, setError] = useState('');

  const booking = bookingQuery.data;
  const countdown = useHoldCountdown(booking?.holdExpiresAt);

  const handlePay = async () => {
    setError('');
    try {
      await payBooking.mutateAsync(Number(bookingId));
      navigate(ROUTES.history);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (bookingQuery.isLoading) {
    return (
      <div className="booking-page page-placeholder">
        <div className="spinner-border text-warning" role="status" aria-label="Đang tải" />
      </div>
    );
  }

  if (bookingQuery.isError || !booking) {
    return (
      <div className="booking-page page-placeholder">
        <p className="text-danger">Không tìm thấy đơn đặt sân.</p>
        <Link to={ROUTES.history}>Về lịch sử đặt sân</Link>
      </div>
    );
  }

  const paid = booking.paymentStatus === 'Paid';
  const expired = countdown === '00:00' && booking.paymentStatus === 'Unpaid';

  return (
    <div className="booking-page">
      <div className="main_content">
        <div className="content-form">
          <div className="booking-form-card container p-4 p-md-5 mb-5">
            <h3 className="form-section-title mb-4">
              <i className="fa-solid fa-credit-card me-2" />
              Thanh toán mô phỏng
            </h3>
            <p>
              <strong>Mã đơn:</strong> {booking.bookingCode}
            </p>
            <p>
              <strong>Sân:</strong> {booking.fieldName}
            </p>
            <p>
              <strong>Ngày:</strong> {formatDate(booking.bookingDate)} —{' '}
              {formatTimeRange(booking.startTime, booking.endTime)}
            </p>
            <p>
              <strong>Số tiền:</strong> {formatCurrency(booking.totalAmount)}
            </p>
            <p>
              <strong>Trạng thái:</strong> {BOOKING_STATUS_LABELS[booking.status]} /{' '}
              {PAYMENT_STATUS_LABELS[booking.paymentStatus]}
            </p>
            {!paid && booking.holdExpiresAt && (
              <p className="fs-5">
                <strong>Thời gian giữ chỗ còn lại:</strong>{' '}
                <span className={expired ? 'text-danger' : 'text-success'}>{countdown ?? '—'}</span>
              </p>
            )}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <div className="d-flex flex-wrap gap-2 mt-4">
              {!paid && !expired && (
                <button
                  type="button"
                  className="btn-submit-booking px-4 py-2"
                  onClick={handlePay}
                  disabled={payBooking.isPending}
                >
                  {payBooking.isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </button>
              )}
              <Link to={ROUTES.history} className="btn btn-outline-secondary">
                Lịch sử đặt sân
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
