const BOOKING_STATUS = Object.freeze({
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
});

const PAYMENT_METHOD = Object.freeze({
  ONLINE: 'Online',
  PAY_AT_FIELD: 'PayAtField',
});

const PAYMENT_STATUS = Object.freeze({
  UNPAID: 'Unpaid',
  PAID: 'Paid',
  REFUNDED: 'Refunded',
});

const DAY_TYPE = Object.freeze({
  WEEKDAY: 'Weekday',
  WEEKEND: 'Weekend',
});

// Bảng chuyển trạng thái do Admin thực hiện (BR13)
const ADMIN_STATUS_TRANSITIONS = Object.freeze({
  [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED],
  [BOOKING_STATUS.COMPLETED]: [],
  [BOOKING_STATUS.CANCELLED]: [],
});

module.exports = {
  BOOKING_STATUS,
  BOOKING_STATUS_VALUES: Object.freeze(Object.values(BOOKING_STATUS)),
  PAYMENT_METHOD,
  PAYMENT_METHOD_VALUES: Object.freeze(Object.values(PAYMENT_METHOD)),
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES: Object.freeze(Object.values(PAYMENT_STATUS)),
  DAY_TYPE,
  DAY_TYPE_VALUES: Object.freeze(Object.values(DAY_TYPE)),
  ADMIN_STATUS_TRANSITIONS,
};
