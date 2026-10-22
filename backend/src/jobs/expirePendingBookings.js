const logger = require('../config/logger');
const bookingRepository = require('../modules/bookings/booking.repository');

const INTERVAL_MS = 60 * 1000;

function startExpirePendingBookingsJob() {
  if (process.env.NODE_ENV === 'test') return () => {};

  const tick = async () => {
    try {
      const count = await bookingRepository.expireHeldBookings();
      if (count > 0) {
        logger.info({ count }, 'Đã hủy đơn Online quá hạn giữ chỗ');
      }
    } catch (error) {
      logger.error({ err: error }, 'Job hủy đơn quá hạn thất bại');
    }
  };

  tick();
  const timer = setInterval(tick, INTERVAL_MS);
  timer.unref();

  return () => clearInterval(timer);
}

module.exports = { startExpirePendingBookingsJob };
