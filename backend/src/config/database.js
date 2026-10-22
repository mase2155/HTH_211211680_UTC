const sql = require('mssql');
const config = require('./env');
const logger = require('./logger');

let poolPromise;

function buildConfig(databaseName = config.db.name) {
  const options = {
    encrypt: config.db.encrypt,
    trustServerCertificate: config.db.trustServerCertificate,
    useUTC: true,
    enableArithAbort: true,
  };

  const connection = {
    server: config.db.server,
    database: databaseName,
    user: config.db.user,
    password: config.db.password,
    pool: { max: config.db.poolMax, min: 0, idleTimeoutMillis: 30000 },
    connectionTimeout: 15000,
    requestTimeout: 30000,
    options,
  };

  if (config.db.instance) {
    options.instanceName = config.db.instance;
  } else {
    connection.port = config.db.port;
  }

  return connection;
}

function getPool() {
  if (!poolPromise) {
    const pool = new sql.ConnectionPool(buildConfig());
    pool.on('error', (error) => logger.error({ err: error }, 'Lỗi pool SQL Server'));
    poolPromise = pool.connect().catch((error) => {
      poolPromise = undefined;
      throw error;
    });
  }
  return poolPromise;
}

async function closePool() {
  if (!poolPromise) return;
  const pool = await poolPromise;
  poolPromise = undefined;
  await pool.close();
}

// Tạo request gắn với transaction (nếu có) hoặc với pool dùng chung.
async function createRequest(tx) {
  if (tx) return new sql.Request(tx);
  const pool = await getPool();
  return pool.request();
}

async function withTransaction(work, isolationLevel = sql.ISOLATION_LEVEL.READ_COMMITTED) {
  const pool = await getPool();
  const tx = new sql.Transaction(pool);
  await tx.begin(isolationLevel);
  try {
    const result = await work(tx);
    await tx.commit();
    return result;
  } catch (error) {
    try {
      await tx.rollback();
    } catch (rollbackError) {
      logger.warn({ err: rollbackError }, 'Rollback transaction thất bại');
    }
    throw error;
  }
}

module.exports = { sql, buildConfig, getPool, closePool, createRequest, withTransaction };
