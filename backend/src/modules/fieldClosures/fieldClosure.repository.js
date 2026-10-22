const { sql, createRequest } = require('../../config/database');

async function listByFieldId(fieldId, tx) {
  const request = await createRequest(tx);
  const result = await request.input('fieldId', sql.Int, fieldId).query(`
    SELECT
      FieldClosureId AS id,
      FieldId AS fieldId,
      CONVERT(VARCHAR(10), ClosedDate, 23) AS closedDate,
      Reason AS reason,
      CONVERT(VARCHAR(23), CreatedAt, 126) AS createdAt
    FROM dbo.FieldClosures
    WHERE FieldId = @fieldId
    ORDER BY ClosedDate DESC
  `);
  return result.recordset;
}

async function insert({ fieldId, closedDate, reason }, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('fieldId', sql.Int, fieldId)
    .input('closedDate', sql.Date, closedDate)
    .input('reason', sql.NVarChar(255), reason ?? null)
    .query(`
      INSERT INTO dbo.FieldClosures (FieldId, ClosedDate, Reason)
      OUTPUT INSERTED.FieldClosureId AS id
      VALUES (@fieldId, @closedDate, @reason)
    `);
  const id = result.recordset[0].id;
  const rows = await listByFieldId(fieldId, tx);
  return rows.find((row) => row.id === id);
}

async function remove(fieldId, closureId, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('fieldId', sql.Int, fieldId)
    .input('closureId', sql.Int, closureId)
    .query(`
      DELETE FROM dbo.FieldClosures
      WHERE FieldId = @fieldId AND FieldClosureId = @closureId
    `);
  return result.rowsAffected[0] > 0;
}

async function existsOnDate(fieldId, closedDate, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('fieldId', sql.Int, fieldId)
    .input('closedDate', sql.Date, closedDate)
    .query(`
      SELECT TOP 1 FieldClosureId AS id
      FROM dbo.FieldClosures
      WHERE FieldId = @fieldId AND ClosedDate = @closedDate
    `);
  return Boolean(result.recordset[0]);
}

module.exports = { listByFieldId, insert, remove, existsOnDate };
