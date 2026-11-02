import { BOOKING_STATUS_LABELS } from '../../../constants/bookingLabels';

const statusBadgeClass = {
  Pending: 'history-badge history-badge--pending',
  Confirmed: 'history-badge history-badge--confirmed',
  Completed: 'history-badge history-badge--completed',
  Cancelled: 'history-badge history-badge--cancelled',
};

export default function BookingStatusBadge({ status }) {
  return (
    <span className={statusBadgeClass[status] ?? 'history-badge'}>
      {BOOKING_STATUS_LABELS[status] ?? status}
    </span>
  );
}
