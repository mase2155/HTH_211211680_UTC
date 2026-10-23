const { ERROR_CODES } = require('../../src/constants/errorCodes');
const { BOOKING_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../../src/constants/booking');
const { ROLES } = require('../../src/constants/roles');
const { today, addDays } = require('../../src/utils/datetime');

jest.mock('../../src/config/database', () => ({
  withTransaction: (fn) => fn(null),
}));

jest.mock('../../src/modules/fields/field.repository');
jest.mock('../../src/modules/fieldTypes/fieldType.repository');
jest.mock('../../src/modules/timeSlots/timeSlot.repository');
jest.mock('../../src/modules/fieldClosures/fieldClosure.repository');
jest.mock('../../src/modules/prices/price.repository');
jest.mock('../../src/modules/bookings/booking.repository');

const fieldRepository = require('../../src/modules/fields/field.repository');
const fieldTypeRepository = require('../../src/modules/fieldTypes/fieldType.repository');
const timeSlotRepository = require('../../src/modules/timeSlots/timeSlot.repository');
const fieldClosureRepository = require('../../src/modules/fieldClosures/fieldClosure.repository');
const priceRepository = require('../../src/modules/prices/price.repository');
const bookingRepository = require('../../src/modules/bookings/booking.repository');
const bookingService = require('../../src/modules/bookings/booking.service');

function mockValidSlotContext() {
  fieldRepository.findById.mockResolvedValue({
    id: 1,
    fieldTypeId: 1,
    status: 'Active',
  });
  fieldTypeRepository.findById.mockResolvedValue({ id: 1, isActive: true });
  timeSlotRepository.findById.mockResolvedValue({
    id: 1,
    fieldTypeId: 1,
    isActive: true,
    startTime: '18:00',
    endTime: '19:00',
  });
  fieldClosureRepository.existsOnDate.mockResolvedValue(false);
  priceRepository.findAmount.mockResolvedValue(200000);
}

describe('bookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bookingRepository.countPendingUnpaidByUser.mockResolvedValue(0);
  });

  describe('create', () => {
    const body = {
      fieldId: 1,
      timeSlotId: 1,
      bookingDate: addDays(today(), 3),
      customerName: 'Nguyen Van A',
      customerPhone: '0901234567',
      paymentMethod: PAYMENT_METHOD.ONLINE,
    };

    test('tạo đơn thành công khi slot hợp lệ', async () => {
      mockValidSlotContext();
      const created = { id: 10, status: BOOKING_STATUS.PENDING };
      bookingRepository.insert.mockResolvedValue(created);

      const result = await bookingService.create(5, body);

      expect(result).toEqual(created);
      expect(bookingRepository.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 5,
          totalAmount: 200000,
          status: BOOKING_STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.UNPAID,
        }),
        null,
      );
    });

    test('từ chối khi vượt số đơn Pending chưa thanh toán', async () => {
      bookingRepository.countPendingUnpaidByUser.mockResolvedValue(99);

      await expect(bookingService.create(5, body)).rejects.toMatchObject({
        status: 409,
        code: ERROR_CODES.BOOKING_LIMIT_EXCEEDED,
      });
      expect(fieldRepository.findById).not.toHaveBeenCalled();
    });

    test('trùng slot → SLOT_ALREADY_BOOKED', async () => {
      mockValidSlotContext();
      const uniqueError = new Error('duplicate');
      uniqueError.number = 2601;
      uniqueError.message = 'UX_Bookings_ActiveSlot';
      bookingRepository.insert.mockRejectedValue(uniqueError);

      await expect(bookingService.create(5, body)).rejects.toMatchObject({
        status: 409,
        code: ERROR_CODES.SLOT_ALREADY_BOOKED,
      });
    });
  });

  describe('cancel', () => {
    const user = { id: 3, role: ROLES.CUSTOMER };
    const futureDate = addDays(today(), 5);

    test('hủy thành công khi còn đủ thời gian', async () => {
      bookingRepository.findById
        .mockResolvedValueOnce({
          id: 1,
          userId: 3,
          status: BOOKING_STATUS.PENDING,
          bookingDate: futureDate,
          startTime: '20:00',
        })
        .mockResolvedValueOnce({ id: 1, status: BOOKING_STATUS.CANCELLED });
      bookingRepository.cancelByUser.mockResolvedValue(true);

      const result = await bookingService.cancel(1, user, 'Đổi lịch');

      expect(result.status).toBe(BOOKING_STATUS.CANCELLED);
      expect(bookingRepository.cancelByUser).toHaveBeenCalledWith(1, 3, 'Đổi lịch');
    });

    test('không hủy đơn Completed', async () => {
      bookingRepository.findById.mockResolvedValue({
        id: 1,
        userId: 3,
        status: BOOKING_STATUS.COMPLETED,
        bookingDate: futureDate,
        startTime: '20:00',
      });

      await expect(bookingService.cancel(1, user)).rejects.toMatchObject({
        status: 409,
        code: ERROR_CODES.BOOKING_CANNOT_CANCEL,
      });
    });
  });

  describe('adminUpdateStatus', () => {
    test('Pending → Confirmed', async () => {
      bookingRepository.findById
        .mockResolvedValueOnce({
          id: 1,
          status: BOOKING_STATUS.PENDING,
          bookingDate: addDays(today(), 1),
          startTime: '08:00',
        })
        .mockResolvedValueOnce({ id: 1, status: BOOKING_STATUS.CONFIRMED });
      bookingRepository.updateStatus.mockResolvedValue(true);

      const result = await bookingService.adminUpdateStatus(1, { status: BOOKING_STATUS.CONFIRMED });

      expect(result.status).toBe(BOOKING_STATUS.CONFIRMED);
    });

    test('Completed → Cancelled bị từ chối', async () => {
      bookingRepository.findById.mockResolvedValue({
        id: 1,
        status: BOOKING_STATUS.COMPLETED,
        bookingDate: today(),
        startTime: '08:00',
      });

      await expect(
        bookingService.adminUpdateStatus(1, { status: BOOKING_STATUS.CANCELLED }),
      ).rejects.toMatchObject({
        status: 409,
        code: ERROR_CODES.INVALID_STATUS_TRANSITION,
      });
    });

    test('Confirmed → Completed trước giờ chơi được Admin cho phép', async () => {
      bookingRepository.findById
        .mockResolvedValueOnce({
          id: 1,
          status: BOOKING_STATUS.CONFIRMED,
          bookingDate: addDays(today(), 2),
          startTime: '23:59',
        })
        .mockResolvedValueOnce({ id: 1, status: BOOKING_STATUS.COMPLETED });
      bookingRepository.updateStatus.mockResolvedValue(true);

      const result = await bookingService.adminUpdateStatus(1, { status: BOOKING_STATUS.COMPLETED });

      expect(result.status).toBe(BOOKING_STATUS.COMPLETED);
    });
  });

  describe('getById', () => {
    test('khách không xem được đơn người khác', async () => {
      bookingRepository.findById.mockResolvedValue({
        id: 1,
        userId: 99,
      });

      await expect(
        bookingService.getById(1, { id: 2, role: ROLES.CUSTOMER }),
      ).rejects.toMatchObject({
        status: 403,
        code: ERROR_CODES.FORBIDDEN,
      });
    });
  });
});
