import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';
import { BOOKING_CANCEL_BEFORE_MINUTES } from '../../../constants/booking';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from '../../../constants/bookingLabels';
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/format';
import { formatTimeRange } from '../../../utils/date';
import { isCustomerCancellable } from '../../../utils/bookingDatetime';
import BookingStatusBadge from './BookingStatusBadge';

export default function BookingDetailModal({
  booking,
  isLoading,
  isError,
  onClose,
  onCancel,
  cancelling,
}) {
  if (!booking && !isLoading) return null;

  const canCancel =
    booking && isCustomerCancellable(booking, BOOKING_CANCEL_BEFORE_MINUTES);
  const showPayLink =
    booking?.paymentMethod === 'Online' &&
    booking.paymentStatus === 'Unpaid' &&
    booking.status === 'Pending';

  return (
    <div
      className="modal history-detail-modal show d-block"
      tabIndex={-1}
      role="dialog"
      aria-labelledby="bookingDetailTitle"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="bookingDetailTitle">
              Chi tiết đơn đặt sân
            </h5>
            <button type="button" className="btn-close" aria-label="Đóng" onClick={onClose} />
          </div>
          <div className="modal-body">
            {isLoading && (
              <div className="text-center py-3">
                <div className="spinner-border text-warning" role="status" aria-label="Đang tải" />
              </div>
            )}
            {isError && (
              <p className="text-danger mb-0">Không tải được chi tiết đơn.</p>
            )}
            {booking && !isLoading && (
              <dl className="row mb-0 history-detail-dl">
                <dt className="col-sm-4">Mã đơn</dt>
                <dd className="col-sm-8 fw-semibold">{booking.bookingCode}</dd>

                <dt className="col-sm-4">Sân</dt>
                <dd className="col-sm-8">{booking.fieldName}</dd>

                <dt className="col-sm-4">Ngày / Giờ</dt>
                <dd className="col-sm-8">
                  {formatDate(booking.bookingDate)}
                  {' — '}
                  {formatTimeRange(booking.startTime, booking.endTime)}
                </dd>

                <dt className="col-sm-4">Trạng thái</dt>
                <dd className="col-sm-8">
                  <BookingStatusBadge status={booking.status} />
                </dd>

                <dt className="col-sm-4">Thanh toán</dt>
                <dd className="col-sm-8">
                  {PAYMENT_METHOD_LABELS[booking.paymentMethod]}
                  {' · '}
                  {PAYMENT_STATUS_LABELS[booking.paymentStatus]}
                </dd>

                <dt className="col-sm-4">Tổng tiền</dt>
                <dd className="col-sm-8">{formatCurrency(booking.totalAmount)}</dd>

                <dt className="col-sm-4">Người đặt</dt>
                <dd className="col-sm-8">
                  {booking.customerName}
                  <br />
                  <small className="text-muted">{booking.customerPhone}</small>
                </dd>

                {booking.note ? (
                  <>
                    <dt className="col-sm-4">Ghi chú</dt>
                    <dd className="col-sm-8">{booking.note}</dd>
                  </>
                ) : null}

                {booking.holdExpiresAt && booking.paymentStatus === 'Unpaid' ? (
                  <>
                    <dt className="col-sm-4">Giữ chỗ đến</dt>
                    <dd className="col-sm-8">{formatDateTime(booking.holdExpiresAt)}</dd>
                  </>
                ) : null}

                {booking.paidAt ? (
                  <>
                    <dt className="col-sm-4">Thời điểm thanh toán</dt>
                    <dd className="col-sm-8">{formatDateTime(booking.paidAt)}</dd>
                  </>
                ) : null}

                {booking.cancelReason ? (
                  <>
                    <dt className="col-sm-4">Lý do hủy</dt>
                    <dd className="col-sm-8">{booking.cancelReason}</dd>
                  </>
                ) : null}

                <dt className="col-sm-4">Tạo lúc</dt>
                <dd className="col-sm-8">{formatDateTime(booking.createdAt)}</dd>
              </dl>
            )}
          </div>
          <div className="modal-footer flex-wrap gap-2">
            {showPayLink && booking && (
              <Link to={ROUTES.payment(booking.id)} className="btn btn-warning">
                Thanh toán ngay
              </Link>
            )}
            {canCancel && onCancel && (
              <button
                type="button"
                className="btn btn-outline-danger"
                disabled={cancelling}
                onClick={() => onCancel(booking.id)}
              >
                Hủy đơn
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
