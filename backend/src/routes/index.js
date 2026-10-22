const express = require('express');
const { getPool } = require('../config/database');
const AppError = require('../utils/AppError');
const { ok } = require('../utils/response');
const { ERROR_CODES } = require('../constants/errorCodes');

const authRoutes = require('../modules/auth/auth.routes');
const fieldTypeRoutes = require('../modules/fieldTypes/fieldType.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/field-types', fieldTypeRoutes);

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
