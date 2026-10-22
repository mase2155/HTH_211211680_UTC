const config = require('./config/env');
const logger = require('./config/logger');
const { getPool, closePool } = require('./config/database');
const app = require('./app');
const { startExpirePendingBookingsJob } = require('./jobs/expirePendingBookings');

const SHUTDOWN_TIMEOUT_MS = 10000;

async function start() {
  await getPool();
  logger.info({ database: config.db.name }, 'Đã kết nối SQL Server');

  const stopExpireJob = startExpirePendingBookingsJob();

  const server = app.listen(config.port, () => {
    logger.info(`API đang chạy tại http://localhost:${config.port}/api/v1 (${config.env})`);
  });

  let shuttingDown = false;
  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`Nhận tín hiệu ${signal}, đang tắt server...`);

    const forceExit = setTimeout(() => {
      logger.error('Tắt server quá thời gian cho phép, buộc thoát');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    server.close(async () => {
      try {
        stopExpireJob();
        await closePool();
        process.exit(0);
      } catch (error) {
        logger.error({ err: error }, 'Lỗi khi đóng kết nối CSDL');
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Promise bị từ chối mà không được xử lý');
  process.exit(1);
});

start().catch((error) => {
  logger.fatal({ err: error }, 'Không thể khởi động server');
  process.exit(1);
});
