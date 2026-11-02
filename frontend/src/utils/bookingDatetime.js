const MS_PER_MINUTE = 60 * 1000;

function slotStartDate(booking) {
  if (!booking?.bookingDate || !booking?.startTime) return null;
  const time = String(booking.startTime).slice(0, 5);
  const slotStart = new Date(`${booking.bookingDate}T${time}:00+07:00`);
  return Number.isNaN(slotStart.getTime()) ? null : slotStart;
}

/** Số phút còn lại trước giờ bắt đầu khung (múi giờ VN). */
export function minutesUntilSlotStart(booking, now = new Date()) {
  const slotStart = slotStartDate(booking);
  if (!slotStart) return 0;
  return (slotStart.getTime() - now.getTime()) / MS_PER_MINUTE;
}

/** BR12: khách được hủy Pending/Confirmed khi còn đủ phút tối thiểu trước giờ chơi. */
export function isCustomerCancellable(booking, cancelBeforeMinutes, now = new Date()) {
  if (!booking) return false;
  if (booking.status !== 'Pending' && booking.status !== 'Confirmed') return false;
  return minutesUntilSlotStart(booking, now) >= cancelBeforeMinutes;
}

/** Giờ bắt đầu khung đặt sân (Asia/Ho_Chi_Minh) còn trong tương lai so với thời điểm hiện tại. */
export function isBeforeSlotStart(booking, now = new Date()) {
  const slotStart = slotStartDate(booking);
  if (!slotStart) return false;
  return now.getTime() < slotStart.getTime();
}

export const CONFIRM_COMPLETE_BEFORE_SLOT_MESSAGE =
  'Chưa tới giờ sử dụng sân, hãy chắc chắn khi hoàn thành đơn đặt lịch';
