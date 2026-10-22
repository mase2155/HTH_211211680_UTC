const { sql, createRequest } = require('../../config/database');
const { toOffset } = require('../../utils/pagination');
const { escapeLike, LIKE_ESCAPE_CLAUSE } = require('../../utils/sql');

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

async function updateProfile(id, { fullName, phone }, tx) {
  const request = await createRequest(tx);
  await request
    .input('id', sql.Int, id)
    .input('fullName', sql.NVarChar(100), fullName)
    .input('phone', sql.VarChar(20), phone ?? null)
    .query(`
      UPDATE dbo.Users
      SET FullName = @fullName, Phone = @phone, UpdatedAt = SYSUTCDATETIME()
      WHERE UserId = @id
    `);
  return findById(id, tx);
}

async function updatePasswordHash(id, passwordHash, tx) {
  const request = await createRequest(tx);
  await request
    .input('id', sql.Int, id)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .query(`
      UPDATE dbo.Users
      SET PasswordHash = @passwordHash, UpdatedAt = SYSUTCDATETIME()
      WHERE UserId = @id
    `);
}

async function listUsers({ page, limit, keyword, role, isActive }, tx) {
  const request = await createRequest(tx);
  request.input('offset', sql.Int, toOffset({ page, limit }));
  request.input('limit', sql.Int, limit);

  let where = 'WHERE 1=1';
  if (keyword) {
    request.input('keyword', sql.NVarChar(160), `%${escapeLike(keyword)}%`);
    where += ` AND (FullName LIKE @keyword ${LIKE_ESCAPE_CLAUSE} OR Email LIKE @keyword ${LIKE_ESCAPE_CLAUSE})`;
  }
  if (role) {
    request.input('role', sql.NVarChar(20), role);
    where += ' AND Role = @role';
  }
  if (isActive !== undefined) {
    request.input('isActive', sql.Bit, isActive ? 1 : 0);
    where += ' AND IsActive = @isActive';
  }

  const result = await request.query(`
    SELECT ${PUBLIC_USER_COLUMNS}, COUNT(*) OVER() AS totalCount
    FROM dbo.Users
    ${where}
    ORDER BY CreatedAt DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);
  const total = result.recordset[0]?.totalCount ?? 0;
  const items = result.recordset.map(({ totalCount: _total, ...row }) => row);
  return { items, total };
}

async function updateByAdmin(id, { fullName, phone, isActive }, tx) {
  const request = await createRequest(tx);
  request.input('id', sql.Int, id);
  const sets = [];
  if (fullName !== undefined) {
    request.input('fullName', sql.NVarChar(100), fullName);
    sets.push('FullName = @fullName');
  }
  if (phone !== undefined) {
    request.input('phone', sql.VarChar(20), phone);
    sets.push('Phone = @phone');
  }
  if (isActive !== undefined) {
    request.input('isActive', sql.Bit, isActive ? 1 : 0);
    sets.push('IsActive = @isActive');
  }
  if (sets.length === 0) return findById(id, tx);
  sets.push('UpdatedAt = SYSUTCDATETIME()');
  await request.query(`UPDATE dbo.Users SET ${sets.join(', ')} WHERE UserId = @id`);
  return findById(id, tx);
}

module.exports = {
  findById,
  findByEmail,
  findAuthByEmail,
  createUser,
  updateProfile,
  updatePasswordHash,
  listUsers,
  updateByAdmin,
};
