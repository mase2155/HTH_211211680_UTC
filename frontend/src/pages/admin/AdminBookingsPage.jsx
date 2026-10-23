import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { BOOKING_STATUS } from '../../constants/booking';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../../constants/bookingLabels';
import { adminUpdateBookingStatusApi, fetchAllBookingsApi } from '../../features/bookings/bookings.api';
import { formatCurrency } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';
import {
  CONFIRM_COMPLETE_BEFORE_SLOT_MESSAGE,
  isBeforeSlotStart,
} from '../../utils/bookingDatetime';

const statusBadge = {
  Pending: 'bg-warning text-dark',
  Confirmed: 'bg-info',
  Completed: 'bg-success',
  Cancelled: 'bg-secondary',
};

export default function AdminBookingsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [error, setError] = useState('');

  const filters = { status: statusFilter || undefined, bookingDate: bookingDate || undefined };

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.adminBookings(filters),
    queryFn: () => fetchAllBookingsApi(filters),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminUpdateBookingStatusApi(id, { status }),
    onSuccess: () => {
      setError('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const bookings = data?.items ?? [];

  const requestComplete = (booking) => {
    if (
      isBeforeSlotStart(booking) &&
      !window.confirm(CONFIRM_COMPLETE_BEFORE_SLOT_MESSAGE)
    ) {
      return;
    }
    statusMutation.mutate({ id: booking.id, status: BOOKING_STATUS.COMPLETED });
  };

  return (
    <>
      <div className="content-header">
        <h1>Đơn đặt lịch</h1>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card">
        <div className="card-header">
          <span>Xét duyệt trạng thái</span>
          <div className="d-flex gap-2 flex-wrap">
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              className="form-control form-control-sm"
              style={{ width: 'auto' }}
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
            />
          </div>
        </div>
        <div className="card-body table-responsive">
          {isLoading && <p className="text-muted mb-0">Đang tải…</p>}
          {isError && <p className="text-danger mb-0">Không tải được danh sách đơn.</p>}
          {!isLoading && !isError && (
            <table className="table table-bordered table-hover table-crud align-middle">
              <thead className="table-light">
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách</th>
                  <th>Sân</th>
                  <th>Ngày / Giờ</th>
                  <th>TT đơn</th>
                  <th>Thanh toán</th>
                  <th>Tổng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted">
                      Không có đơn phù hợp.
                    </td>
                  </tr>
                )}
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td>{b.bookingCode}</td>
                    <td>
                      {b.customerName}
                      <br />
                      <small className="text-muted">{b.customerPhone}</small>
                    </td>
                    <td>{b.fieldName}</td>
                    <td>
                      {b.bookingDate}
                      <br />
                      <small>
                        {b.startTime}–{b.endTime}
                      </small>
                    </td>
                    <td>
                      <span className={`badge ${statusBadge[b.status] ?? 'bg-secondary'}`}>
                        {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </td>
                    <td>{PAYMENT_STATUS_LABELS[b.paymentStatus] ?? b.paymentStatus}</td>
                    <td>{formatCurrency(b.totalAmount)}</td>
                    <td className="text-nowrap">
                      <div className="btn-action-group d-inline-flex gap-2 flex-wrap">
                        {b.status === BOOKING_STATUS.PENDING && (
                          <button
                            type="button"
                            className="btn btn-success btn-sm"
                            disabled={statusMutation.isPending}
                            onClick={() =>
                              statusMutation.mutate({ id: b.id, status: BOOKING_STATUS.CONFIRMED })
                            }
                          >
                            Duyệt
                          </button>
                        )}
                        {(b.status === BOOKING_STATUS.PENDING || b.status === BOOKING_STATUS.CONFIRMED) && (
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            disabled={statusMutation.isPending}
                            onClick={() => {
                              if (window.confirm('Hủy đơn này?')) {
                                statusMutation.mutate({ id: b.id, status: BOOKING_STATUS.CANCELLED });
                              }
                            }}
                          >
                            Hủy
                          </button>
                        )}
                        {b.status === BOOKING_STATUS.CONFIRMED && (
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            disabled={statusMutation.isPending}
                            onClick={() => requestComplete(b)}
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
          )}
        </div>
      </div>
    </>
  );
}
