/** Giờ bắt đầu khung đặt sân (Asia/Ho_Chi_Minh) còn trong tương lai so với thời điểm hiện tại. */
export function isBeforeSlotStart(booking, now = new Date()) {
  if (!booking?.bookingDate || !booking?.startTime) return false;
  const time = String(booking.startTime).slice(0, 5);
  const slotStart = new Date(`${booking.bookingDate}T${time}:00+07:00`);
  if (Number.isNaN(slotStart.getTime())) return false;
  return now.getTime() < slotStart.getTime();
}

export const CONFIRM_COMPLETE_BEFORE_SLOT_MESSAGE =
  'Chưa tới giờ sử dụng sân, hãy chắc chắn khi hoàn thành đơn đặt lịch';
