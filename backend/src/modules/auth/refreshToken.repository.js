const { sql, createRequest } = require('../../config/database');

async function insertToken({ userId, tokenHash, expiresAt }, tx) {
  const request = await createRequest(tx);
  await request
    .input('userId', sql.Int, userId)
    .input('tokenHash', sql.Char(64), tokenHash)
    .input('expiresAt', sql.DateTime2, expiresAt)
    .query(`
      INSERT INTO dbo.RefreshTokens (UserId, TokenHash, ExpiresAt)
      VALUES (@userId, @tokenHash, @expiresAt)
    `);
}

async function findValidByHash(tokenHash, tx) {
  const request = await createRequest(tx);
  const result = await request.input('tokenHash', sql.Char(64), tokenHash).query(`
    SELECT RefreshTokenId AS id, UserId AS userId, ExpiresAt AS expiresAt
    FROM dbo.RefreshTokens
    WHERE TokenHash = @tokenHash
      AND RevokedAt IS NULL
      AND ExpiresAt > SYSUTCDATETIME()
  `);
  return result.recordset[0] ?? null;
}

async function revokeByHash(tokenHash, tx) {
  const request = await createRequest(tx);
  await request.input('tokenHash', sql.Char(64), tokenHash).query(`
    UPDATE dbo.RefreshTokens
    SET RevokedAt = SYSUTCDATETIME()
    WHERE TokenHash = @tokenHash AND RevokedAt IS NULL
  `);
}

module.exports = { insertToken, findValidByHash, revokeByHash };
