module.exports = async () => {
  try {
    const { closePool } = require('../src/config/database');
    await closePool();
  } catch {
    // Bỏ qua nếu pool chưa được mở (unit test thuần)
  }
};
