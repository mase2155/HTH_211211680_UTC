const path = require('path');
const { z } = require('zod');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const booleanString = (defaultValue) =>
  z
    .enum(['true', 'false'])
    .default(defaultValue)
    .transform((value) => value === 'true');

const positiveInt = (defaultValue) => z.coerce.number().int().positive().default(defaultValue);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: positiveInt(5000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  TRUST_PROXY: booleanString('false'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),

  DB_SERVER: z.string().min(1),
  DB_PORT: positiveInt(1433),
  DB_INSTANCE: z
    .string()
    .optional()
    .transform((value) => value || undefined),
  DB_NAME: z.string().regex(/^[A-Za-z0-9_]+$/, 'DB_NAME chỉ gồm chữ, số và dấu gạch dưới'),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_ENCRYPT: booleanString('false'),
  DB_TRUST_SERVER_CERTIFICATE: booleanString('true'),
  DB_POOL_MAX: positiveInt(10),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET phải có ít nhất 32 ký tự'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_DAYS: positiveInt(7),

  APP_TIMEZONE: z.string().default('Asia/Ho_Chi_Minh'),
  BOOKING_MAX_DAYS_AHEAD: positiveInt(30),
  BOOKING_HOLD_MINUTES: positiveInt(15),
  BOOKING_CANCEL_BEFORE_MINUTES: z.coerce.number().int().min(0).default(60),
  BOOKING_MAX_PENDING_PER_USER: positiveInt(3),

  UPLOAD_DIR: z.string().default('uploads'),
  UPLOAD_MAX_SIZE_MB: z.coerce.number().positive().default(2),

  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8, 'ADMIN_PASSWORD phải có ít nhất 8 ký tự').optional(),
  ADMIN_FULL_NAME: z.string().min(1).default('Quản trị viên'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Cấu hình môi trường không hợp lệ (kiểm tra backend/.env):\n${issues.join('\n')}`);
}

const env = parsed.data;

const config = Object.freeze({
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  port: env.PORT,
  logLevel: env.LOG_LEVEL,
  trustProxy: env.TRUST_PROXY,
  corsOrigins: env.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: Object.freeze({
    server: env.DB_SERVER,
    port: env.DB_PORT,
    instance: env.DB_INSTANCE,
    name: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    encrypt: env.DB_ENCRYPT,
    trustServerCertificate: env.DB_TRUST_SERVER_CERTIFICATE,
    poolMax: env.DB_POOL_MAX,
  }),
  jwt: Object.freeze({
    accessSecret: env.JWT_ACCESS_SECRET,
    accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
    issuer: 'sport-booking-api',
  }),
  refreshToken: Object.freeze({
    expiresDays: env.REFRESH_TOKEN_EXPIRES_DAYS,
    cookieName: 'refreshToken',
    cookiePath: '/api/v1/auth',
  }),
  timezone: env.APP_TIMEZONE,
  booking: Object.freeze({
    maxDaysAhead: env.BOOKING_MAX_DAYS_AHEAD,
    holdMinutes: env.BOOKING_HOLD_MINUTES,
    cancelBeforeMinutes: env.BOOKING_CANCEL_BEFORE_MINUTES,
    maxPendingPerUser: env.BOOKING_MAX_PENDING_PER_USER,
  }),
  upload: Object.freeze({
    rootDir: path.resolve(__dirname, '../..', env.UPLOAD_DIR),
    maxSizeBytes: Math.round(env.UPLOAD_MAX_SIZE_MB * 1024 * 1024),
  }),
  admin: Object.freeze({
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    fullName: env.ADMIN_FULL_NAME,
  }),
});

module.exports = config;
