const path = require('path');

// Dùng backend/.env thật cho integration test (CSDL SportBooking đã migrate/seed)
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';

if (!process.env.JWT_ACCESS_SECRET) {
  process.env.JWT_ACCESS_SECRET = 'test_secret_test_secret_test_secret_123456';
}
