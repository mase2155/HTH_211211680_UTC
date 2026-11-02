import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../features/auth/AuthContext';
import BookingDetailModal from '../../features/bookings/components/BookingDetailModal';
import CustomerBookingHistoryMain from '../../features/bookings/components/CustomerBookingHistoryMain';
import { useBookingDetail, useCancelBooking, useMyBookings } from '../../features/bookings/bookings.hooks';
import { getErrorMessage } from '../../utils/errors';
import '../../styles/pages/history.css';

const PAGE_SIZE = 10;

/** Lịch sử đặt sân — shell: ClientLayout (Header.jsx, main, Footer.jsx); page chỉ render nội dung main. */
export default function MyBookingsPage() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const [bookingDateFilter, setBookingDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);

  const listFilters = {
    page,
    limit: PAGE_SIZE,
    status: statusFilter || undefined,
    bookingDate: bookingDateFilter || undefined,
  };

  const bookingsQuery = useMyBookings(listFilters, { enabled: user?.role !== 'Admin' });
  const detailQuery = useBookingDetail(detailId);
  const cancelBooking = useCancelBooking();
  const [actionError, setActionError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, bookingDateFilter]);

  if (user?.role === 'Admin') {
    return <Navigate to={ROUTES.admin} replace />;
  }

  const items = bookingsQuery.data?.items ?? [];
  const meta = bookingsQuery.data?.meta;

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn đặt sân này?')) return;
    setActionError('');
    setCancellingId(id);
    try {
      await cancelBooking.mutateAsync({ id, reason: 'Khách hủy trên website' });
      if (detailId === id) {
        detailQuery.refetch();
      }
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setCancellingId(null);
    }
  };

  const hasActiveFilters = Boolean(statusFilter || bookingDateFilter);

  return (
    <div className="history-page">
      <CustomerBookingHistoryMain
        statusFilter={statusFilter}
        bookingDateFilter={bookingDateFilter}
        onStatusFilterChange={setStatusFilter}
        onBookingDateFilterChange={setBookingDateFilter}
        onClearFilters={() => {
          setStatusFilter('');
          setBookingDateFilter('');
        }}
        hasActiveFilters={hasActiveFilters}
        actionError={actionError}
        bookingsQuery={bookingsQuery}
        items={items}
        meta={meta}
        page={page}
        onPageChange={setPage}
        onViewDetail={setDetailId}
        onCancel={handleCancel}
        cancellingId={cancellingId}
      />

      {detailId !== null && (
        <BookingDetailModal
          booking={detailQuery.data}
          isLoading={detailQuery.isLoading}
          isError={detailQuery.isError}
          onClose={() => setDetailId(null)}
          onCancel={handleCancel}
          cancelling={cancellingId === detailId}
        />
      )}
    </div>
  );
}
