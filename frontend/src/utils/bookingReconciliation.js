import { BOOKING_STATUS } from '../constants/booking';

/**
 * Đối soát đơn: khớp số tiền với bảng giá + trạng thái thanh toán theo quy tắc nghiệp vụ.
 * @returns {{ state: 'ok'|'pending'|'fail', label: string, badgeClass: string, hint?: string }}
 */
export function evaluateBookingReconciliation(booking) {
  if (!booking) {
    return { state: 'fail', label: 'Đối soát sai', badgeClass: 'bg-danger', hint: 'Không có dữ liệu đơn' };
  }

  const total = Number(booking.totalAmount);
  const expected =
    booking.expectedAmount === null || booking.expectedAmount === undefined
      ? null
      : Number(booking.expectedAmount);
  const amountMatch = expected === null || (!Number.isNaN(total) && total === expected);

  let paymentOk = false;
  let pending = false;
  let hint = '';

  const { status, paymentMethod, paymentStatus, holdExpiresAt } = booking;

  if (status === BOOKING_STATUS.CANCELLED) {
    paymentOk = paymentStatus === 'Unpaid' || paymentStatus === 'Refunded';
    if (!paymentOk) hint = 'Đơn đã hủy nhưng vẫn ghi nhận đã thanh toán, chưa hoàn tiền';
  } else if (status === BOOKING_STATUS.COMPLETED) {
    paymentOk = paymentStatus === 'Paid';
    if (!paymentOk) hint = 'Đơn hoàn thành nhưng chưa ghi nhận thanh toán';
  } else if (status === BOOKING_STATUS.CONFIRMED) {
    if (paymentMethod === 'Online') {
      paymentOk = paymentStatus === 'Paid';
      if (!paymentOk) hint = 'Đơn online đã xác nhận nhưng chưa thanh toán';
    } else if (paymentStatus === 'Paid') {
      paymentOk = true;
    } else {
      pending = true;
      hint = 'Chưa đối soát thanh toán tại sân';
    }
  } else if (status === BOOKING_STATUS.PENDING) {
    if (paymentMethod === 'Online' && paymentStatus === 'Unpaid') {
      const expired = holdExpiresAt && Date.parse(holdExpiresAt) < Date.now();
      if (expired) {
        hint = 'Quá hạn giữ chỗ thanh toán online';
      } else {
        pending = true;
        hint = 'Chưa thanh toán online';
      }
    } else if (paymentMethod === 'PayAtField' && paymentStatus === 'Unpaid') {
      pending = true;
      hint = 'Chưa xác nhận / đối soát đơn tại quầy';
    } else if (paymentStatus === 'Paid') {
      hint = 'Đã thanh toán nhưng đơn vẫn ở trạng thái chờ xử lý';
    } else {
      pending = true;
      hint = 'Chưa đối soát đơn';
    }
  }

  if (!amountMatch) {
    paymentOk = false;
    pending = false;
    hint = `Số tiền đơn không khớp bảng giá (đơn: ${total}, giá niêm yết: ${expected})`;
  }

  if (paymentOk && amountMatch && !pending) {
    return { state: 'ok', label: 'Đối soát đúng', badgeClass: 'bg-success', hint: 'Thông tin đơn và thanh toán khớp quy tắc' };
  }
  if (pending && amountMatch) {
    return { state: 'pending', label: 'Chưa đối soát', badgeClass: 'bg-danger', hint };
  }
  return { state: 'fail', label: 'Đối soát sai', badgeClass: 'bg-danger', hint: hint || 'Trạng thái thanh toán không hợp lệ' };
}
