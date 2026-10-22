import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { BOOKING_STATUS } from '../../constants/booking';
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../../constants/bookingLabels';
import { useAuth } from '../../features/auth/AuthContext';
import {
  useAdminBookingsList,
  useAdminUpdateBookingStatus,
  useCancelBooking,
  useMyBookings,
} from '../../features/bookings/bookings.hooks';
import { formatCurrency, formatDate } from '../../utils/format';
import { formatTimeRange } from '../../utils/date';
import { getErrorMessage } from '../../utils/errors';
import '../../styles/pages/booking.css';

const CANCELLABLE = new Set(['Pending', 'Confirmed']);

const statusBadgeClass = {
  Pending: 'history-badge history-badge--pending',
  Confirmed: 'history-badge history-badge--confirmed',
  Completed: 'history-badge history-badge--completed',
  Cancelled: 'history-badge history-badge--cancelled',
};

function StatusBadge({ status }) {
  return (
    <span className={statusBadgeClass[status] ?? 'history-badge'}>
      {BOOKING_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function CustomerBookingsTable({ items, onCancel, cancellingId }) {
  return (
    <div className="table-responsive history-table-wrap">
      <table className="table history-table align-middle">
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
              <td className="fw-semibold">{booking.bookingCode}</td>
              <td>{booking.fieldName}</td>
              <td>
                {formatDate(booking.bookingDate)}
                <br />
                <small className="text-muted">{formatTimeRange(booking.startTime, booking.endTime)}</small>
              </td>
              <td>{formatCurrency(booking.totalAmount)}</td>
              <td>
                {PAYMENT_METHOD_LABELS[booking.paymentMethod]}
                <br />
                <small>{PAYMENT_STATUS_LABELS[booking.paymentStatus]}</small>
              </td>
              <td>
                <StatusBadge status={booking.status} />
              </td>
              <td className="text-nowrap">
                {booking.paymentMethod === 'Online' &&
                  booking.paymentStatus === 'Unpaid' &&
                  booking.status === 'Pending' && (
                    <Link to={ROUTES.payment(booking.id)} className="btn btn-sm btn-warning me-1 mb-1">
                      Thanh toán
                    </Link>
                  )}
                {CANCELLABLE.has(booking.status) && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger mb-1"
                    disabled={cancellingId === booking.id}
                    onClick={() => onCancel(booking.id)}
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
  );
}

function AdminBookingsTable({ items, onStatusChange, busy }) {
  return (
    <div className="table-responsive history-table-wrap">
      <table className="table history-table align-middle">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Khách hàng</th>
            <th>Sân</th>
            <th>Ngày / Giờ</th>
            <th>Số tiền</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.map((booking) => (
            <tr key={booking.id}>
              <td className="fw-semibold">{booking.bookingCode}</td>
              <td>
                {booking.customerName}
                <br />
                <small className="text-muted">{booking.customerPhone}</small>
              </td>
              <td>{booking.fieldName}</td>
              <td>
                {formatDate(booking.bookingDate)}
                <br />
                <small className="text-muted">{formatTimeRange(booking.startTime, booking.endTime)}</small>
              </td>
              <td>{formatCurrency(booking.totalAmount)}</td>
              <td>
                {PAYMENT_METHOD_LABELS[booking.paymentMethod]}
                <br />
                <small>{PAYMENT_STATUS_LABELS[booking.paymentStatus]}</small>
              </td>
              <td>
                <StatusBadge status={booking.status} />
              </td>
              <td className="text-nowrap">
                <div className="d-flex flex-wrap gap-1">
                  {booking.status === BOOKING_STATUS.PENDING && (
                    <button
                      type="button"
                      className="btn btn-sm btn-success"
                      disabled={busy}
                      onClick={() => onStatusChange(booking.id, BOOKING_STATUS.CONFIRMED)}
                    >
                      Duyệt
                    </button>
                  )}
                  {(booking.status === BOOKING_STATUS.PENDING ||
                    booking.status === BOOKING_STATUS.CONFIRMED) && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      disabled={busy}
                      onClick={() => onStatusChange(booking.id, BOOKING_STATUS.CANCELLED)}
                    >
                      Hủy
                    </button>
                  )}
                  {booking.status === BOOKING_STATUS.CONFIRMED && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      disabled={busy}
                      onClick={() => onStatusChange(booking.id, BOOKING_STATUS.COMPLETED)}
                    >
                      Hoàn thành
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MyBookingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [statusFilter, setStatusFilter] = useState('');
  const [bookingDate, setBookingDate] = useState('');

  const customerFilters = statusFilter ? { status: statusFilter } : {};
  const adminFilters = {
    status: statusFilter || undefined,
    bookingDate: bookingDate || undefined,
    limit: 50,
  };

  const customerQuery = useMyBookings(customerFilters, { enabled: !isAdmin });
  const adminQuery = useAdminBookingsList(adminFilters, { enabled: isAdmin });

  const bookingsQuery = isAdmin ? adminQuery : customerQuery;
  const cancelBooking = useCancelBooking();
  const adminStatus = useAdminUpdateBookingStatus();
  const [actionError, setActionError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const items = bookingsQuery.data?.items ?? [];
  const total = bookingsQuery.data?.meta?.total;

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

  const handleAdminStatus = async (id, status) => {
    if (status === BOOKING_STATUS.CANCELLED && !window.confirm('Hủy đơn này?')) return;
    setActionError('');
    try {
      await adminStatus.mutateAsync({ id, status });
    } catch (error) {
      setActionError(getErrorMessage(error));
    }
  };

  return (
    <div className="history-page">
      <div className="main_content">
        <div className="content-form">
          <div className="booking-form-card container p-4 p-md-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-2">
              <div>
                <h3 className="form-section-title mb-1">
                  <i className="fa-solid fa-clock-rotate-left me-2" />
                  {isAdmin ? 'Lịch sử đặt lịch hệ thống' : 'Lịch sử đặt sân'}
                </h3>
                {isAdmin && (
                  <p className="history-page-subtitle mb-0">
                    Toàn bộ đơn trên hệ thống — duyệt, hủy hoặc đánh dấu hoàn thành tại đây.
                  </p>
                )}
              </div>
              <div className="d-flex flex-wrap gap-2 align-items-center history-filters">
                <select
                  className="form-select form-select-sm history-filter-select"
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
                {isAdmin && (
                  <input
                    type="date"
                    className="form-control form-control-sm history-filter-date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    aria-label="Lọc theo ngày"
                  />
                )}
                <Link to={ROUTES.booking} className="btn-submit-booking px-3 py-2 text-decoration-none">
                  Đặt sân mới
                </Link>
                {isAdmin && (
                  <Link to={ROUTES.admin} className="btn btn-sm btn-outline-secondary">
                    Bảng quản trị
                  </Link>
                )}
              </div>
            </div>

            {isAdmin && total != null && (
              <p className="history-count text-muted small mb-3">
                Hiển thị {items.length} / {total} đơn
              </p>
            )}

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
              <p className="text-muted">
                {isAdmin ? 'Chưa có đơn đặt lịch nào trong hệ thống.' : 'Bạn chưa có đơn đặt sân nào.'}
              </p>
            ) : isAdmin ? (
              <AdminBookingsTable
                items={items}
                busy={adminStatus.isPending}
                onStatusChange={handleAdminStatus}
              />
            ) : (
              <CustomerBookingsTable items={items} onCancel={handleCancel} cancellingId={cancellingId} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
