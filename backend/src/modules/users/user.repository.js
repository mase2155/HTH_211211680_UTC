const { sql, createRequest } = require('../../config/database');

const PUBLIC_USER_COLUMNS = `
  UserId AS id,
  FullName AS fullName,
  Email AS email,
  Phone AS phone,
  Role AS role,
  IsActive AS isActive,
  CONVERT(VARCHAR(23), CreatedAt, 126) AS createdAt
`;

async function findById(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query(`
    SELECT ${PUBLIC_USER_COLUMNS}
    FROM dbo.Users
    WHERE UserId = @id
  `);
  return result.recordset[0] ?? null;
}

async function findByEmail(email, tx) {
  const request = await createRequest(tx);
  const result = await request.input('email', sql.NVarChar(150), email).query(`
    SELECT ${PUBLIC_USER_COLUMNS}
    FROM dbo.Users
    WHERE Email = @email
  `);
  return result.recordset[0] ?? null;
}

async function findAuthByEmail(email, tx) {
  const request = await createRequest(tx);
  const result = await request.input('email', sql.NVarChar(150), email).query(`
    SELECT UserId AS id, PasswordHash AS passwordHash, Role AS role, IsActive AS isActive
    FROM dbo.Users
    WHERE Email = @email
  `);
  return result.recordset[0] ?? null;
}

async function createUser({ fullName, email, passwordHash, phone, role }, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('fullName', sql.NVarChar(100), fullName)
    .input('email', sql.NVarChar(150), email)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .input('phone', sql.VarChar(20), phone ?? null)
    .input('role', sql.NVarChar(20), role)
    .query(`
      INSERT INTO dbo.Users (FullName, Email, PasswordHash, Phone, Role)
      OUTPUT INSERTED.UserId AS id
      VALUES (@fullName, @email, @passwordHash, @phone, @role)
    `);
  return findById(result.recordset[0].id, tx);
}

module.exports = { findById, findByEmail, findAuthByEmail, createUser };
