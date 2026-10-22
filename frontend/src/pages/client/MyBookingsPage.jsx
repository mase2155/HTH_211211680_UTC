import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../../constants/bookingLabels';
import { useCancelBooking, useMyBookings } from '../../features/bookings/bookings.hooks';
import { formatCurrency, formatDate } from '../../utils/format';
import { formatTimeRange } from '../../utils/date';
import { getErrorMessage } from '../../utils/errors';
import '../../styles/pages/booking.css';

const CANCELLABLE = new Set(['Pending', 'Confirmed']);

export default function MyBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const bookingsQuery = useMyBookings(statusFilter ? { status: statusFilter } : {});
  const cancelBooking = useCancelBooking();
  const [actionError, setActionError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const items = bookingsQuery.data?.items ?? [];

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn đặt sân này?')) return;
    setActionError('');
    setCancellingId(id);
    try {
      await cancelBooking.mutateAsync({ id, reason: 'Khách hủy trên website' });
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="history-page">
      <div className="main_content">
        <div className="content-form">
          <div className="booking-form-card container p-4 p-md-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <h3 className="form-section-title mb-0">
                <i className="fa-solid fa-clock-rotate-left me-2" />
                Lịch sử đặt sân
              </h3>
              <div className="d-flex gap-2 align-items-center">
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Lọc trạng thái"
                >
                  <option value="">Tất cả trạng thái</option>
                  {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <Link to={ROUTES.booking} className="btn-submit-booking px-3 py-2 text-decoration-none">
                  Đặt sân mới
                </Link>
              </div>
            </div>

            {actionError && (
              <div className="alert alert-danger" role="alert">
                {actionError}
              </div>
            )}

            {bookingsQuery.isLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-warning" role="status" aria-label="Đang tải" />
              </div>
            ) : bookingsQuery.isError ? (
              <p className="text-danger">Không tải được danh sách đơn.</p>
            ) : items.length === 0 ? (
              <p className="text-muted">Bạn chưa có đơn đặt sân nào.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle">
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Sân</th>
                      <th>Ngày / Giờ</th>
                      <th>Số tiền</th>
                      <th>Thanh toán</th>
                      <th>Trạng thái</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.bookingCode}</td>
                        <td>{booking.fieldName}</td>
                        <td>
                          {formatDate(booking.bookingDate)}
                          <br />
                          <small>{formatTimeRange(booking.startTime, booking.endTime)}</small>
                        </td>
                        <td>{formatCurrency(booking.totalAmount)}</td>
                        <td>
                          {PAYMENT_METHOD_LABELS[booking.paymentMethod]}
                          <br />
                          <small>{PAYMENT_STATUS_LABELS[booking.paymentStatus]}</small>
                        </td>
                        <td>{BOOKING_STATUS_LABELS[booking.status]}</td>
                        <td className="text-nowrap">
                          {booking.paymentMethod === 'Online' &&
                            booking.paymentStatus === 'Unpaid' &&
                            booking.status === 'Pending' && (
                              <Link
                                to={ROUTES.payment(booking.id)}
                                className="btn btn-sm btn-warning me-1 mb-1"
                              >
                                Thanh toán
                              </Link>
                            )}
                          {CANCELLABLE.has(booking.status) && (
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger mb-1"
                              disabled={cancellingId === booking.id}
                              onClick={() => handleCancel(booking.id)}
                            >
                              Hủy
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
