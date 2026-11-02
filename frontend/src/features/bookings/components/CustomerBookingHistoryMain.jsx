import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { BOOKING_CANCEL_BEFORE_MINUTES } from '../../../constants/booking';
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../../../constants/bookingLabels';
import { formatCurrency, formatDate } from '../../../utils/format';
import { formatTimeRange } from '../../../utils/date';
import { isCustomerCancellable } from '../../../utils/bookingDatetime';
import BookingStatusBadge from './BookingStatusBadge';

function BookingActions({ booking, onViewDetail, onCancel, cancellingId }) {
  const canCancel = isCustomerCancellable(booking, BOOKING_CANCEL_BEFORE_MINUTES);
  const showPay =
    booking.paymentMethod === 'Online' &&
    booking.paymentStatus === 'Unpaid' &&
    booking.status === 'Pending';

  return (
    <>
      <button
        type="button"
        className="btn btn-sm history-btn-detail"
        onClick={() => onViewDetail(booking.id)}
      >
        Chi tiết
      </button>
      {showPay && (
        <Link to={ROUTES.payment(booking.id)} className="btn btn-sm history-btn-pay">
          Thanh toán
        </Link>
      )}
      {canCancel && (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger history-btn-cancel"
          disabled={cancellingId === booking.id}
          onClick={() => onCancel(booking.id)}
        >
          Hủy
        </button>
      )}
    </>
  );
}

function CustomerBookingsTable({ items, onViewDetail, onCancel, cancellingId }) {
  return (
    <div className="table-responsive history-table-wrap d-none d-md-block">
      <table className="table history-table align-middle">
        <thead>
          <tr>
            <th>Mã đơn</th>
            <th>Sân</th>
            <th>Ngày / Giờ</th>
            <th>Số tiền</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th className="text-end">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.map((booking) => (
            <tr key={booking.id}>
              <td>
                <button
                  type="button"
                  className="btn btn-link p-0 fw-semibold text-decoration-none history-code-link"
                  onClick={() => onViewDetail(booking.id)}
                >
                  {booking.bookingCode}
                </button>
              </td>
              <td>{booking.fieldName}</td>
              <td>
                {formatDate(booking.bookingDate)}
                <br />
                <small className="text-muted">
                  {formatTimeRange(booking.startTime, booking.endTime)}
                </small>
              </td>
              <td className="history-col-amount">{formatCurrency(booking.totalAmount)}</td>
              <td className="history-col-payment">
                {PAYMENT_METHOD_LABELS[booking.paymentMethod]}
                <br />
                <small>{PAYMENT_STATUS_LABELS[booking.paymentStatus]}</small>
              </td>
              <td>
                <BookingStatusBadge status={booking.status} />
              </td>
              <td>
                <div className="history-actions">
                  <BookingActions
                    booking={booking}
                    onViewDetail={onViewDetail}
                    onCancel={onCancel}
                    cancellingId={cancellingId}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerBookingsCards({ items, onViewDetail, onCancel, cancellingId }) {
  return (
    <div className="history-card-list d-md-none">
      {items.map((booking) => (
        <article key={booking.id} className="history-booking-card">
          <div className="history-booking-card__head">
            <button
              type="button"
              className="btn btn-link p-0 history-code-link text-start"
              onClick={() => onViewDetail(booking.id)}
            >
              {booking.bookingCode}
            </button>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="history-booking-card__field mb-1">{booking.fieldName}</p>
          <p className="history-booking-card__meta mb-2">
            {formatDate(booking.bookingDate)} · {formatTimeRange(booking.startTime, booking.endTime)}
          </p>
          <div className="history-booking-card__row">
            <span>Thanh toán</span>
            <span>
              {PAYMENT_METHOD_LABELS[booking.paymentMethod]} —{' '}
              {PAYMENT_STATUS_LABELS[booking.paymentStatus]}
            </span>
          </div>
          <div className="history-booking-card__row">
            <span>Tổng tiền</span>
            <span className="history-booking-card__amount">{formatCurrency(booking.totalAmount)}</span>
          </div>
          <div className="history-booking-card__actions">
            <BookingActions
              booking={booking}
              onViewDetail={onViewDetail}
              onCancel={onCancel}
              cancellingId={cancellingId}
            />
          </div>
        </article>
      ))}
    </div>
  );
}

function HistoryPagination({ meta, page, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null;

  const pages = [];
  for (let p = 1; p <= meta.totalPages; p += 1) {
    pages.push(p);
  }

  return (
    <nav className="history-pagination mt-3" aria-label="Phân trang lịch sử đặt sân">
      <ul className="pagination pagination-sm justify-content-center mb-0 flex-wrap">
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onPageChange(page - 1)}>
            Trước
          </button>
        </li>
        {pages.map((p) => (
          <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
            <button type="button" className="page-link" onClick={() => onPageChange(p)}>
              {p}
            </button>
          </li>
        ))}
        <li className={`page-item ${page >= meta.totalPages ? 'disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onPageChange(page + 1)}>
            Sau
          </button>
        </li>
      </ul>
      <p className="text-center history-pagination-meta mt-2 mb-0">
        {meta.total} đơn · trang {page}/{meta.totalPages}
      </p>
    </nav>
  );
}

export default function CustomerBookingHistoryMain({
  statusFilter,
  bookingDateFilter,
  onStatusFilterChange,
  onBookingDateFilterChange,
  onClearFilters,
  hasActiveFilters,
  actionError,
  bookingsQuery,
  items,
  meta,
  page,
  onPageChange,
  onViewDetail,
  onCancel,
  cancellingId,
}) {
  return (
    <div className="container history-page__container">
      <div className="history-panel mb-5">
        <div className="history-page-intro">
          <h1 className="history-page-title">
            <i className="fa-solid fa-clock-rotate-left me-2" aria-hidden />
            Lịch sử đặt sân
          </h1>
          <p className="history-page-subtitle mb-0">
            Xem đơn đã đặt, thanh toán trực tuyến hoặc hủy trước giờ sử dụng ít nhất{' '}
            {BOOKING_CANCEL_BEFORE_MINUTES} phút.
          </p>
        </div>

        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end history-toolbar">
          <div className="history-toolbar-hint">
            <p className="history-toolbar-label mb-0">Bộ lọc</p>
            <span className="small text-muted">Lọc theo trạng thái hoặc ngày chơi trên sân</span>
          </div>
          <div className="d-flex flex-wrap gap-2 align-items-center history-filters">
            <select
              className="form-select form-select-sm history-filter-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              aria-label="Lọc trạng thái"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="date"
              className="form-control form-control-sm history-filter-date"
              value={bookingDateFilter}
              onChange={(e) => onBookingDateFilterChange(e.target.value)}
              aria-label="Lọc theo ngày đặt"
            />
            {hasActiveFilters && (
              <button type="button" className="btn btn-sm history-btn-clear" onClick={onClearFilters}>
                Xóa lọc
              </button>
            )}
            <Link to={ROUTES.booking} className="history-btn-primary px-3 py-2">
              Đặt sân mới
            </Link>
          </div>
        </div>

        {actionError && (
          <div className="alert alert-danger history-alert" role="alert">
            {actionError}
          </div>
        )}

        {bookingsQuery.isLoading ? (
          <div className="history-state history-state--loading">
            <div className="spinner-border" role="status" aria-label="Đang tải" />
            <p className="text-muted mt-3 mb-0">Đang tải danh sách đơn…</p>
          </div>
        ) : bookingsQuery.isError ? (
          <div className="history-state">
            <div className="history-state-icon" aria-hidden>
              <i className="fa-solid fa-circle-exclamation" />
            </div>
            <p className="text-danger mb-0">Không tải được danh sách đơn. Kiểm tra kết nối API.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="history-state">
            <div className="history-state-icon" aria-hidden>
              <i className="fa-solid fa-calendar-xmark" />
            </div>
            <p className="text-muted mb-3">
              {hasActiveFilters ? 'Không có đơn nào khớp bộ lọc.' : 'Bạn chưa có đơn đặt sân nào.'}
            </p>
            <Link to={ROUTES.booking} className="history-btn-primary px-4 py-2">
              Đặt sân ngay
            </Link>
          </div>
        ) : (
          <>
            {meta && (
              <p className="history-summary mb-0" role="status">
                Hiển thị <strong>{items.length}</strong> đơn trên trang này · tổng{' '}
                <strong>{meta.total}</strong> đơn
                {hasActiveFilters ? ' (đã lọc)' : ''}
              </p>
            )}
            <CustomerBookingsTable
              items={items}
              onViewDetail={onViewDetail}
              onCancel={onCancel}
              cancellingId={cancellingId}
            />
            <CustomerBookingsCards
              items={items}
              onViewDetail={onViewDetail}
              onCancel={onCancel}
              cancellingId={cancellingId}
            />
            <HistoryPagination meta={meta} page={page} onPageChange={onPageChange} />
          </>
        )}
      </div>
    </div>
  );
}
