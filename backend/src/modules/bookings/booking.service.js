const config = require('../../config/env');
const AppError = require('../../utils/AppError');
const { ERROR_CODES } = require('../../constants/errorCodes');
const {
  BOOKING_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  ADMIN_STATUS_TRANSITIONS,
} = require('../../constants/booking');
const { FIELD_STATUS } = require('../../constants/field');
const { ROLES } = require('../../constants/roles');
const { buildMeta } = require('../../utils/pagination');
const {
  today,
  addDays,
  getDayType,
  hasStarted,
  isCancellable,
  addMinutes,
} = require('../../utils/datetime');
const { isUniqueViolationOf } = require('../../utils/sql');
const { generateBookingCode } = require('../../utils/bookingCode');
const { withTransaction } = require('../../config/database');
const fieldRepository = require('../fields/field.repository');
const fieldTypeRepository = require('../fieldTypes/fieldType.repository');
const timeSlotRepository = require('../timeSlots/timeSlot.repository');
const fieldClosureRepository = require('../fieldClosures/fieldClosure.repository');
const priceRepository = require('../prices/price.repository');
const bookingRepository = require('./booking.repository');

function assertBookingDateAllowed(bookingDate) {
  const minDate = today();
  const maxDate = addDays(minDate, config.booking.maxDaysAhead);
  if (bookingDate < minDate || bookingDate > maxDate) {
    throw new AppError(
      400,
      ERROR_CODES.VALIDATION_ERROR,
      `Ngày đặt phải từ hôm nay đến tối đa ${config.booking.maxDaysAhead} ngày`,
    );
  }
}

async function validateSlotContext({ fieldId, timeSlotId, bookingDate }) {
  assertBookingDateAllowed(bookingDate);

  const field = await fieldRepository.findById(fieldId);
  if (!field || field.status !== FIELD_STATUS.ACTIVE) {
    throw new AppError(400, ERROR_CODES.SLOT_UNAVAILABLE, 'Sân không khả dụng để đặt');
  }

  const fieldType = await fieldTypeRepository.findById(field.fieldTypeId);
  if (!fieldType || !fieldType.isActive) {
    throw new AppError(400, ERROR_CODES.SLOT_UNAVAILABLE, 'Loại sân không còn hoạt động');
  }

  const slot = await timeSlotRepository.findById(timeSlotId);
  if (!slot || !slot.isActive || slot.fieldTypeId !== field.fieldTypeId) {
    throw new AppError(400, ERROR_CODES.SLOT_UNAVAILABLE, 'Khung giờ không hợp lệ');
  }

  if (hasStarted(bookingDate, slot.startTime)) {
    throw new AppError(400, ERROR_CODES.SLOT_UNAVAILABLE, 'Khung giờ đã bắt đầu, không thể đặt');
  }

  if (await fieldClosureRepository.existsOnDate(fieldId, bookingDate)) {
    throw new AppError(400, ERROR_CODES.SLOT_UNAVAILABLE, 'Sân đóng cửa trong ngày này');
  }

  const amount = await priceRepository.findAmount({
    fieldId,
    timeSlotId,
    dayType: getDayType(bookingDate),
  });
  if (amount === null) {
    throw new AppError(400, ERROR_CODES.PRICE_NOT_FOUND, 'Chưa cấu hình giá cho khung giờ này');
  }

  return { field, slot, amount };
}

async function create(userId, body) {
  const pendingCount = await bookingRepository.countPendingUnpaidByUser(userId);
  if (pendingCount >= config.booking.maxPendingPerUser) {
    throw new AppError(
      409,
      ERROR_CODES.BOOKING_LIMIT_EXCEEDED,
      `Bạn chỉ được giữ tối đa ${config.booking.maxPendingPerUser} đơn chưa thanh toán`,
    );
  }

  const { slot, amount } = await validateSlotContext(body);
  const holdExpiresAt =
    body.paymentMethod === PAYMENT_METHOD.ONLINE
      ? addMinutes(new Date(), config.booking.holdMinutes)
      : null;

  try {
    return await withTransaction(async (tx) =>
      bookingRepository.insert(
        {
          bookingCode: generateBookingCode(),
          userId,
          fieldId: body.fieldId,
          timeSlotId: body.timeSlotId,
          bookingDate: body.bookingDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          note: body.note,
          totalAmount: amount,
          status: BOOKING_STATUS.PENDING,
          paymentMethod: body.paymentMethod,
          paymentStatus: PAYMENT_STATUS.UNPAID,
          holdExpiresAt,
        },
        tx,
      ),
    );
  } catch (error) {
    if (isUniqueViolationOf(error, 'UX_Bookings_ActiveSlot')) {
      throw new AppError(409, ERROR_CODES.SLOT_ALREADY_BOOKED, 'Khung giờ này đã được đặt');
    }
    throw error;
  }
}

async function getById(id, user) {
  const booking = await bookingRepository.findById(id);
  if (!booking) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy đơn đặt sân');
  }
  if (user.role !== ROLES.ADMIN && booking.userId !== user.id) {
    throw new AppError(403, ERROR_CODES.FORBIDDEN, 'Bạn không có quyền xem đơn này');
  }
  return booking;
}

async function listMine(userId, query) {
  const { items, total } = await bookingRepository.listByUser({ userId, ...query });
  return { items, meta: buildMeta({ page: query.page, limit: query.limit, total }) };
}

async function listAll(query) {
  const { items, total } = await bookingRepository.listAll(query);
  return { items, meta: buildMeta({ page: query.page, limit: query.limit, total }) };
}

async function simulatePayment(id, user) {
  const booking = await getById(id, user);
  if (booking.paymentMethod !== PAYMENT_METHOD.ONLINE) {
    throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'Đơn này không thanh toán trực tuyến');
  }
  if (booking.status !== BOOKING_STATUS.PENDING || booking.paymentStatus !== PAYMENT_STATUS.UNPAID) {
    throw new AppError(409, ERROR_CODES.CONFLICT, 'Đơn không ở trạng thái chờ thanh toán');
  }
  if (booking.holdExpiresAt && Date.parse(booking.holdExpiresAt) < Date.now()) {
    throw new AppError(409, ERROR_CODES.CONFLICT, 'Đơn đã hết thời gian giữ chỗ');
  }
  const updated = await bookingRepository.markPaid(id);
  if (!updated || updated.status !== BOOKING_STATUS.CONFIRMED) {
    throw new AppError(409, ERROR_CODES.CONFLICT, 'Không thể thanh toán đơn này');
  }
  return updated;
}

async function cancel(id, user, reason) {
  const booking = await getById(id, user);
  if (![BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status)) {
    throw new AppError(409, ERROR_CODES.BOOKING_CANNOT_CANCEL, 'Đơn không thể hủy ở trạng thái hiện tại');
  }
  if (
    !isCancellable(
      booking.bookingDate,
      booking.startTime,
      config.booking.cancelBeforeMinutes,
    )
  ) {
    throw new AppError(
      409,
      ERROR_CODES.BOOKING_CANNOT_CANCEL,
      `Chỉ được hủy trước giờ sử dụng ít nhất ${config.booking.cancelBeforeMinutes} phút`,
    );
  }
  const ok = await bookingRepository.cancelByUser(id, user.id, reason);
  if (!ok) {
    throw new AppError(409, ERROR_CODES.CONFLICT, 'Không thể hủy đơn, vui lòng thử lại');
  }
  return bookingRepository.findById(id);
}

async function adminUpdate(id, body) {
  const booking = await bookingRepository.findById(id);
  if (!booking) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy đơn đặt sân');
  }

  const detailPatch = {};
  if (body.customerName !== undefined) detailPatch.customerName = body.customerName;
  if (body.customerPhone !== undefined) detailPatch.customerPhone = body.customerPhone;
  if (body.note !== undefined) detailPatch.note = body.note;
  if (body.paymentStatus !== undefined) {
    if (booking.status === BOOKING_STATUS.CANCELLED && body.paymentStatus === PAYMENT_STATUS.PAID) {
      throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'Đơn đã hủy không thể ghi nhận đã thanh toán');
    }
    if (body.paymentStatus === PAYMENT_STATUS.REFUNDED && booking.paymentStatus !== PAYMENT_STATUS.PAID) {
      throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, 'Chỉ hoàn tiền khi đơn đã thanh toán');
    }
    detailPatch.paymentStatus = body.paymentStatus;
  }

  if (Object.keys(detailPatch).length > 0) {
    await bookingRepository.patchDetails(id, detailPatch);
  }

  if (body.status !== undefined && body.status !== booking.status) {
    await adminUpdateStatus(id, { status: body.status, cancelReason: body.cancelReason });
  }

  return bookingRepository.findById(id);
}

async function adminUpdateStatus(id, { status: nextStatus, cancelReason }) {
  const booking = await bookingRepository.findById(id);
  if (!booking) {
    throw new AppError(404, ERROR_CODES.NOT_FOUND, 'Không tìm thấy đơn đặt sân');
  }
  const allowed = ADMIN_STATUS_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(
      409,
      ERROR_CODES.INVALID_STATUS_TRANSITION,
      'Không thể chuyển sang trạng thái này',
    );
  }
  if (nextStatus === BOOKING_STATUS.COMPLETED && !hasStarted(booking.bookingDate, booking.startTime)) {
    throw new AppError(409, ERROR_CODES.INVALID_STATUS_TRANSITION, 'Chưa đến giờ sử dụng, chưa thể hoàn thành');
  }
  const updated = await bookingRepository.updateStatus(id, {
    fromStatus: booking.status,
    toStatus: nextStatus,
    cancelReason,
  });
  if (!updated) {
    throw new AppError(409, ERROR_CODES.CONFLICT, 'Trạng thái đơn đã thay đổi, vui lòng tải lại');
  }
  return bookingRepository.findById(id);
}

module.exports = {
  create,
  getById,
  listMine,
  listAll,
  simulatePayment,
  cancel,
  adminUpdateStatus,
  adminUpdate,
};
