import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { ADMIN_STATUS_TRANSITIONS, BOOKING_STATUS } from '../../constants/booking';
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../../constants/bookingLabels';
import { adminUpdateBookingStatusApi, fetchAllBookingsApi } from '../../features/bookings/bookings.api';
import { getErrorMessage } from '../../utils/errors';

export default function AdminOrderStatusPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [message, setMessage] = useState('');

  const { data } = useQuery({
    queryKey: queryKeys.adminBookings({ workflow: true }),
    queryFn: () => fetchAllBookingsApi({ limit: 50, status: BOOKING_STATUS.PENDING }),
  });

  const pending = data?.items ?? [];
  const selected = pending.find((b) => String(b.id) === selectedId) ?? pending[0] ?? null;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      adminUpdateBookingStatusApi(id, {
        status,
        cancelReason: status === BOOKING_STATUS.CANCELLED ? cancelReason || undefined : undefined,
      }),
    onSuccess: () => {
      setMessage('Đã cập nhật trạng thái.');
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
    onError: (err) => setMessage(getErrorMessage(err)),
  });

  const nextStatuses = selected ? ADMIN_STATUS_TRANSITIONS[selected.status] ?? [] : [];

  return (
    <>
      <div className="content-header">
        <h1>Trạng thái đơn (workflow)</h1>
        <p className="breadcrumb-demo">Section 2 / Trạng thái đơn</p>
      </div>
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-header">Chuyển trạng thái (Admin)</div>
            <div className="card-body">
              <p className="demo-hint mb-3">
                PATCH <code>/api/v1/bookings/:id/status</code> — Pending → Confirmed / Cancelled; Confirmed →
                Completed / Cancelled.
              </p>
              <label className="form-label" htmlFor="workflow-booking">
                Chọn đơn chờ xử lý
              </label>
              <select
                id="workflow-booking"
                className="form-select mb-3"
                value={selected ? String(selected.id) : selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {pending.length === 0 && <option value="">Không có đơn Pending</option>}
                {pending.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.bookingCode} — {b.customerName} ({b.bookingDate})
                  </option>
                ))}
              </select>
              {selected && (
                <div className="border rounded p-4 bg-light">
                  <p className="mb-2">
                    <strong>Đơn:</strong> {selected.bookingCode}
                  </p>
                  <p className="mb-2">
                    <strong>Thanh toán:</strong>{' '}
                    {PAYMENT_STATUS_LABELS[selected.paymentStatus] ?? selected.paymentStatus}
                  </p>
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                    <span className="badge bg-warning text-dark">
                      {BOOKING_STATUS_LABELS[selected.status] ?? selected.status}
                    </span>
                    {nextStatuses.length > 0 && <i className="fa-solid fa-arrow-right text-muted" />}
                    {nextStatuses.map((status) => (
                      <button
                        key={status}
                        type="button"
                        className={`btn ${status === BOOKING_STATUS.CANCELLED ? 'btn-outline-danger' : 'btn-success'}`}
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ id: selected.id, status })}
                      >
                        {BOOKING_STATUS_LABELS[status] ?? status}
                      </button>
                    ))}
                  </div>
                  {nextStatuses.includes(BOOKING_STATUS.CANCELLED) && (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Lý do hủy (tuỳ chọn)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                  )}
                </div>
              )}
              {message && <p className="mt-3 mb-0 small text-muted">{message}</p>}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header">Quy tắc thanh toán</div>
            <div className="card-body small">
              <ul className="mb-0 ps-3">
                <li>Online: Unpaid → Paid (khách / mô phỏng)</li>
                <li>PayAtField: Admin xác nhận tại quầy</li>
                <li>Hủy đơn đã Paid → Refunded</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
