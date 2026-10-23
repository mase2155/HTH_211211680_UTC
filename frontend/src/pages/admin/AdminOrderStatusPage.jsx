import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import {
  BOOKING_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../../constants/bookingLabels';
import {
  adminDeleteBookingApi,
  adminUpdateBookingApi,
  fetchAllBookingsApi,
} from '../../features/bookings/bookings.api';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';

const PAYMENT_STATUS_OPTIONS = ['Unpaid', 'Paid'];

function normalizePaymentStatus(value) {
  return value === 'Refunded' ? 'Unpaid' : value;
}

function OrderDetailForm({ booking, onSave, isSaving, onDelete, isDeleting }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');
  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    if (!booking) return;
    setCustomerName(booking.customerName ?? '');
    setCustomerPhone(booking.customerPhone ?? '');
    setNote(booking.note ?? '');
    setPaymentStatus(normalizePaymentStatus(booking.paymentStatus));
    setDeletePassword('');
  }, [booking]);

  const dirty =
    booking &&
    (customerName.trim() !== booking.customerName ||
      customerPhone.trim() !== booking.customerPhone ||
      (note.trim() || '') !== (booking.note ?? '') ||
      paymentStatus !== normalizePaymentStatus(booking.paymentStatus));

  if (!booking) {
    return <p className="text-muted mb-0">Chọn một đơn trong bảng để xem và chỉnh sửa thông tin.</p>;
  }

  return (
    <div>
      <p className="small text-muted mb-3">
        Chỉ cập nhật thông tin khách và thanh toán. Duyệt / hủy / hoàn thành đơn thực hiện tại mục{' '}
        <strong>Đơn đặt lịch</strong>.
      </p>

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label small">Mã đơn</label>
          <input className="form-control form-control-sm" value={booking.bookingCode} readOnly disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label small">Ngày tạo</label>
          <input
            className="form-control form-control-sm"
            value={formatDateTime(booking.createdAt)}
            readOnly
            disabled
          />
        </div>
        <div className="col-md-6">
          <label className="form-label small">Sân</label>
          <input className="form-control form-control-sm" value={booking.fieldName} readOnly disabled />
        </div>
        <div className="col-md-6">
          <label className="form-label small">Ngày / giờ sử dụng</label>
          <input
            className="form-control form-control-sm"
            value={`${booking.bookingDate} · ${booking.startTime}–${booking.endTime}`}
            readOnly
            disabled
          />
        </div>
        <div className="col-md-4">
          <label className="form-label small">Tổng tiền</label>
          <input className="form-control form-control-sm" value={formatCurrency(booking.totalAmount)} readOnly disabled />
        </div>
        <div className="col-md-4">
          <label className="form-label small">Trạng thái đơn</label>
          <input
            className="form-control form-control-sm"
            value={BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
            readOnly
            disabled
          />
        </div>
        <div className="col-md-4">
          <label className="form-label small">Hình thức thanh toán</label>
          <input
            className="form-control form-control-sm"
            value={PAYMENT_METHOD_LABELS[booking.paymentMethod] ?? booking.paymentMethod}
            readOnly
            disabled
          />
        </div>
        <div className="col-md-6">
          <label className="form-label small">Tên khách</label>
          <input
            className="form-control form-control-sm"
            value={customerName}
            maxLength={100}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label small">Số điện thoại</label>
          <input
            className="form-control form-control-sm"
            value={customerPhone}
            maxLength={20}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
        <div className="col-12">
          <label className="form-label small">Ghi chú</label>
          <textarea
            className="form-control form-control-sm"
            rows={2}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label small">Trạng thái thanh toán</label>
          <select
            className="form-select form-select-sm"
            value={paymentStatus}
            disabled={isSaving}
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            {PAYMENT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {PAYMENT_STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </select>
        </div>
        {booking.holdExpiresAt && booking.paymentMethod === 'Online' && (
          <div className="col-12">
            <p className="small text-muted mb-0">
              Hết hạn giữ chỗ online: {formatDateTime(booking.holdExpiresAt)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-3">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={!dirty || isSaving}
          onClick={() =>
            onSave({
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
              note: note.trim(),
              paymentStatus,
            })
          }
        >
          {isSaving ? 'Đang lưu…' : 'Lưu'}
        </button>
        <span className="small text-muted ms-2">Thay đổi chỉ được gửi lên server khi bấm Lưu.</span>
      </div>

      <hr className="my-4" />
      <div className="border border-danger rounded p-3 bg-light">
        <h6 className="text-danger mb-2">Xóa đơn (hoá đơn)</h6>
        <p className="small text-muted mb-2">
          Thao tác không thể hoàn tác. Nhập <strong>mật khẩu tài khoản admin</strong> đang đăng nhập để xác nhận.
        </p>
        <div className="row g-2 align-items-end">
          <div className="col-md-6">
            <label className="form-label small mb-1" htmlFor="admin-delete-password">
              Mật khẩu admin
            </label>
            <input
              id="admin-delete-password"
              type="password"
              className="form-control form-control-sm"
              autoComplete="current-password"
              value={deletePassword}
              disabled={isDeleting}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <button
              type="button"
              className="btn btn-danger btn-sm"
              disabled={!deletePassword.trim() || isDeleting || isSaving}
              onClick={() => {
                if (
                  !window.confirm(
                    `Xóa vĩnh viễn đơn ${booking.bookingCode}? Hành động này không thể hoàn tác.`,
                  )
                ) {
                  return;
                }
                onDelete(deletePassword);
              }}
            >
              {isDeleting ? 'Đang xóa…' : 'Xóa đơn'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrderStatusPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [notice, setNotice] = useState(null);

  const filters = useMemo(
    () => ({
      status: statusFilter || undefined,
      bookingDate: bookingDate || undefined,
      limit: 100,
    }),
    [statusFilter, bookingDate],
  );

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.adminBookings({ ...filters, manageOrders: true }),
    queryFn: () => fetchAllBookingsApi(filters),
  });

  const bookings = data?.items ?? [];

  const selected = useMemo(
    () => bookings.find((b) => String(b.id) === selectedId) ?? null,
    [bookings, selectedId],
  );

  useEffect(() => {
    if (bookings.length === 0) {
      setSelectedId('');
      return;
    }
    if (!selectedId || !bookings.some((b) => String(b.id) === selectedId)) {
      setSelectedId(String(bookings[0].id));
    }
  }, [bookings, selectedId]);

  const deleteMutation = useMutation({
    mutationFn: ({ id, adminPassword }) => adminDeleteBookingApi(id, adminPassword),
    onSuccess: () => {
      setNotice({ type: 'success', text: 'Đã xóa đơn thành công.' });
      setSelectedId('');
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
    onError: (err) => {
      setNotice({
        type: 'danger',
        text: getErrorMessage(err) || 'Không xóa được đơn. Kiểm tra lại mật khẩu admin.',
      });
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) => adminUpdateBookingApi(id, payload),
    onSuccess: () => {
      setNotice({ type: 'success', text: 'Đã lưu thông tin đơn thành công.' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'bookings'] });
    },
    onError: (err) => {
      setNotice({
        type: 'danger',
        text: getErrorMessage(err) || 'Không lưu được đơn. Vui lòng thử lại.',
      });
    },
  });

  const handleSave = (draft) => {
    if (!selected) return;
    setNotice(null);
    const payload = {};
    if (draft.customerName !== selected.customerName) payload.customerName = draft.customerName;
    if (draft.customerPhone !== selected.customerPhone) payload.customerPhone = draft.customerPhone;
    if ((draft.note || '') !== (selected.note ?? '')) payload.note = draft.note || '';
    const currentPayment = normalizePaymentStatus(selected.paymentStatus);
    if (draft.paymentStatus !== currentPayment) payload.paymentStatus = draft.paymentStatus;
    if (Object.keys(payload).length === 0) return;
    saveMutation.mutate({ id: selected.id, payload });
  };

  return (
    <>
      <div className="content-header">
        <h1>Quản lý đơn</h1>
        <p className="breadcrumb-demo">Section 2 / Quản lý thông tin đơn đặt sân</p>
      </div>

      {notice && (
        <div className={`alert alert-${notice.type} alert-dismissible fade show`} role="alert">
          {notice.text}
          <button type="button" className="btn-close" aria-label="Đóng" onClick={() => setNotice(null)} />
        </div>
      )}

      <div className="admin-order-status-page row g-3">
        <div className="col-12">
          <div className="card admin-order-list-card">
            <div className="card-header d-flex flex-wrap gap-2 align-items-center justify-content-between">
              <span>Danh sách đơn</span>
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
            <div className="card-body p-0">
              {isLoading && <p className="text-muted mb-0 p-2">Đang tải…</p>}
              {isError && (
                <p className="text-danger mb-0 p-2">Không tải được danh sách đơn. {getErrorMessage(error)}</p>
              )}
              {!isLoading && !isError && (
                <div className="table-responsive admin-order-list-scroll">
                  <table className="table table-sm table-hover table-crud align-middle admin-order-list-table mb-0">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách / Sân</th>
                        <th>Ngày giờ</th>
                        <th>TT đơn</th>
                        <th>Thanh toán</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-muted">
                            Không có đơn phù hợp.
                          </td>
                        </tr>
                      )}
                      {bookings.map((b) => {
                        const active = String(b.id) === selectedId;
                        return (
                          <tr
                            key={b.id}
                            className={active ? 'table-primary' : undefined}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedId(String(b.id))}
                          >
                            <td className="text-nowrap">{b.bookingCode}</td>
                            <td>
                              <span className="admin-order-list-customer">{b.customerName}</span>
                              <span className="admin-order-list-sub d-block">{b.fieldName}</span>
                            </td>
                            <td className="text-nowrap">
                              {b.bookingDate}{' '}
                              <span className="admin-order-list-sub">
                                {b.startTime}–{b.endTime}
                              </span>
                            </td>
                            <td className="text-nowrap">{BOOKING_STATUS_LABELS[b.status] ?? b.status}</td>
                            <td className="text-nowrap">
                              {PAYMENT_STATUS_LABELS[b.paymentStatus] ?? b.paymentStatus}
                              <span className="admin-order-list-sub d-block">{formatCurrency(b.totalAmount)}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card">
            <div className="card-header">Chi tiết &amp; chỉnh sửa thông tin</div>
            <div className="card-body">
              <OrderDetailForm
                booking={selected}
                isSaving={saveMutation.isPending}
                isDeleting={deleteMutation.isPending}
                onSave={handleSave}
                onDelete={(adminPassword) => {
                  if (!selected) return;
                  setNotice(null);
                  deleteMutation.mutate({ id: selected.id, adminPassword });
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
