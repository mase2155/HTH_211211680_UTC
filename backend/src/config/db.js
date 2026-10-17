const sql = require('mssql');

function getConfig() {
  return {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: true
    }
  };
}

async function getPool() {
  return sql.connect(getConfig());
}

module.exports = { sql, getPool };
