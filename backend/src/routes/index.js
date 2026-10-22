const express = require('express');
const { getPool } = require('../config/database');
const AppError = require('../utils/AppError');
const { ok } = require('../utils/response');
const { ERROR_CODES } = require('../constants/errorCodes');

const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const fieldTypeRoutes = require('../modules/fieldTypes/fieldType.routes');
const timeSlotRoutes = require('../modules/timeSlots/timeSlot.routes');
const fieldRoutes = require('../modules/fields/field.routes');
const scheduleRoutes = require('../modules/schedule/schedule.routes');
const bookingRoutes = require('../modules/bookings/booking.routes');
const statsRoutes = require('../modules/stats/stats.routes');
const newsPostRoutes = require('../modules/newsPosts/newsPost.routes');
const partnerItemRoutes = require('../modules/partnerItems/partnerItem.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/field-types', fieldTypeRoutes);
router.use('/time-slots', timeSlotRoutes);
router.use('/fields', fieldRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/bookings', bookingRoutes);
router.use('/stats', statsRoutes);
router.use('/news-posts', newsPostRoutes);
router.use('/partner-items', partnerItemRoutes);

router.get('/health', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS alive');
  } catch (error) {
    req.log.error({ err: error }, 'Health check: không kết nối được CSDL');
    throw new AppError(503, ERROR_CODES.SERVICE_UNAVAILABLE, 'Không kết nối được cơ sở dữ liệu');
  }
  return ok(res, { status: 'ok', database: 'up', uptimeSeconds: Math.round(process.uptime()) });
});

module.exports = router;
