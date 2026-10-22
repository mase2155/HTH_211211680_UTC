/* eslint-disable no-console, no-await-in-loop -- script CLI chạy tuần tự và in tiến trình */
const fs = require('fs');
const path = require('path');
const config = require('../src/config/env');
const { sql, getPool, closePool } = require('../src/config/database');
const { executeSqlScript } = require('../src/utils/sql');
const { hashPassword } = require('../src/utils/password');
const { ROLES } = require('../src/constants/roles');

const SEEDS_DIR = path.resolve(__dirname, '../../database/seeds');

async function runSqlSeeds(pool) {
  const files = fs
    .readdirSync(SEEDS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    await executeSqlScript(pool, fs.readFileSync(path.join(SEEDS_DIR, file), 'utf8'));
    console.log(`+ Đã nạp: ${file}`);
  }
}

async function seedAdmin(pool) {
  const { email, password, fullName, phone } = config.admin;
  if (!email || !password) {
    throw new Error('Thiếu ADMIN_EMAIL hoặc ADMIN_PASSWORD trong backend/.env');
  }

  const existing = await pool
    .request()
    .input('email', sql.NVarChar(150), email.toLowerCase())
    .query('SELECT UserId FROM dbo.Users WHERE Email = @email');

  if (existing.recordset.length > 0) {
    console.log(`= Tài khoản Admin đã tồn tại: ${email}`);
    return;
  }

  const adminRow = await pool
    .request()
    .query(`SELECT TOP 1 UserId FROM dbo.Users WHERE Role = N'${ROLES.ADMIN}' ORDER BY UserId`);

  if (adminRow.recordset.length > 0) {
    console.log('= Đã có tài khoản Admin khác email — cập nhật qua seed 003_admin_profile.sql');
    return;
  }

  await pool
    .request()
    .input('fullName', sql.NVarChar(100), fullName)
    .input('email', sql.NVarChar(150), email.toLowerCase())
    .input('passwordHash', sql.NVarChar(255), await hashPassword(password))
    .input('phone', sql.NVarChar(20), phone ?? null)
    .input('role', sql.NVarChar(20), ROLES.ADMIN)
    .query(
      'INSERT INTO dbo.Users (FullName, Email, PasswordHash, Phone, Role) VALUES (@fullName, @email, @passwordHash, @phone, @role)',
    );
  console.log(`+ Đã tạo tài khoản Admin: ${email}`);
}

async function run() {
  const pool = await getPool();
  await runSqlSeeds(pool);
  await seedAdmin(pool);
  console.log('Hoàn tất nạp dữ liệu mẫu.');
}

run()
  .catch((error) => {
    console.error('Seed thất bại:', error.message);
    process.exitCode = 1;
  })
  .finally(closePool);
