/* eslint-disable no-console -- script CLI in tiến trình */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('../src/config/env');
const { sql, buildConfig, getPool, closePool, withTransaction } = require('../src/config/database');
const { executeSqlScript } = require('../src/utils/sql');

const MIGRATIONS_DIR = path.resolve(__dirname, '../../database/migrations');

async function ensureDatabase() {
  const pool = await new sql.ConnectionPool(buildConfig('master')).connect();
  try {
    // config.db.name đã được env.js kiểm tra chỉ gồm chữ, số, gạch dưới nên an toàn khi nối chuỗi
    await pool.request().batch(`IF DB_ID(N'${config.db.name}') IS NULL CREATE DATABASE [${config.db.name}];`);
  } finally {
    await pool.close();
  }
}

async function ensureMigrationTable() {
  const pool = await getPool();
  await pool.request().batch(`
    IF OBJECT_ID(N'dbo.SchemaMigrations', N'U') IS NULL
    CREATE TABLE dbo.SchemaMigrations (
      Name      NVARCHAR(200) NOT NULL CONSTRAINT PK_SchemaMigrations PRIMARY KEY,
      Checksum  CHAR(64) NOT NULL,
      AppliedAt DATETIME2(0) NOT NULL CONSTRAINT DF_SchemaMigrations_AppliedAt DEFAULT SYSUTCDATETIME()
    );`);
}

async function getAppliedMigrations() {
  const pool = await getPool();
  const result = await pool.request().query('SELECT Name AS name, Checksum AS checksum FROM dbo.SchemaMigrations');
  return new Map(result.recordset.map((row) => [row.name, row.checksum]));
}

async function run() {
  await ensureDatabase();
  await ensureMigrationTable();

  const applied = await getAppliedMigrations();
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  let appliedCount = 0;
  for (const file of files) {
    const script = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const checksum = crypto.createHash('sha256').update(script).digest('hex');

    if (applied.has(file)) {
      if (applied.get(file) !== checksum) {
        throw new Error(`Migration ${file} đã bị sửa sau khi chạy. Hãy tạo migration mới thay vì sửa file cũ.`);
      }
      console.log(`= Bỏ qua (đã chạy): ${file}`);
    } else {
      await withTransaction(async (tx) => {
        await executeSqlScript(tx, script);
        await new sql.Request(tx)
          .input('name', sql.NVarChar(200), file)
          .input('checksum', sql.Char(64), checksum)
          .query('INSERT INTO dbo.SchemaMigrations (Name, Checksum) VALUES (@name, @checksum)');
      });
      appliedCount += 1;
      console.log(`+ Đã chạy: ${file}`);
    }
  }

  console.log(`Hoàn tất: ${appliedCount} migration mới, CSDL "${config.db.name}" đã cập nhật.`);
}

run()
  .catch((error) => {
    console.error('Migration thất bại:', error.message);
    process.exitCode = 1;
  })
  .finally(closePool);
