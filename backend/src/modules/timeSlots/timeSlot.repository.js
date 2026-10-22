const { sql, createRequest } = require('../../config/database');
const { toOffset } = require('../../utils/pagination');

const COLUMNS = `
  ts.TimeSlotId AS id,
  ts.FieldTypeId AS fieldTypeId,
  ft.Name AS fieldTypeName,
  CONVERT(VARCHAR(5), ts.StartTime, 108) AS startTime,
  CONVERT(VARCHAR(5), ts.EndTime, 108) AS endTime,
  ts.IsActive AS isActive
`;

async function list({ page, limit, fieldTypeId, isActive }, tx) {
  const request = await createRequest(tx);
  request.input('offset', sql.Int, toOffset({ page, limit }));
  request.input('limit', sql.Int, limit);

  let where = 'WHERE 1=1';
  if (fieldTypeId) {
    request.input('fieldTypeId', sql.Int, fieldTypeId);
    where += ' AND ts.FieldTypeId = @fieldTypeId';
  }
  if (isActive !== undefined) {
    request.input('isActive', sql.Bit, isActive ? 1 : 0);
    where += ' AND ts.IsActive = @isActive';
  }

  const result = await request.query(`
    SELECT ${COLUMNS}, COUNT(*) OVER() AS totalCount
    FROM dbo.TimeSlots ts
    JOIN dbo.FieldTypes ft ON ft.FieldTypeId = ts.FieldTypeId
    ${where}
    ORDER BY ts.StartTime
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);
  const total = result.recordset[0]?.totalCount ?? 0;
  const items = result.recordset.map(({ totalCount: _total, ...row }) => row);
  return { items, total };
}

async function findById(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query(`
    SELECT ${COLUMNS}
    FROM dbo.TimeSlots ts
    JOIN dbo.FieldTypes ft ON ft.FieldTypeId = ts.FieldTypeId
    WHERE ts.TimeSlotId = @id
  `);
  return result.recordset[0] ?? null;
}

async function hasOverlap({ fieldTypeId, startTime, endTime, excludeId }, tx) {
  const request = await createRequest(tx);
  request
    .input('fieldTypeId', sql.Int, fieldTypeId)
    .input('startTime', sql.VarChar(5), startTime)
    .input('endTime', sql.VarChar(5), endTime);
  let exclude = '';
  if (excludeId) {
    request.input('excludeId', sql.Int, excludeId);
    exclude = ' AND ts.TimeSlotId <> @excludeId';
  }
  const result = await request.query(`
    SELECT TOP 1 ts.TimeSlotId AS id
    FROM dbo.TimeSlots ts
    WHERE ts.FieldTypeId = @fieldTypeId
      AND ts.StartTime < CAST(@endTime AS TIME(0))
      AND ts.EndTime > CAST(@startTime AS TIME(0))
      ${exclude}
  `);
  return Boolean(result.recordset[0]);
}

async function countFutureBookings(timeSlotId, fromDate, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('id', sql.Int, timeSlotId)
    .input('fromDate', sql.Date, fromDate)
    .query(`
      SELECT COUNT(*) AS cnt
      FROM dbo.Bookings
      WHERE TimeSlotId = @id
        AND Status <> N'Cancelled'
        AND BookingDate >= @fromDate
    `);
  return result.recordset[0].cnt;
}

async function insert(data, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('fieldTypeId', sql.Int, data.fieldTypeId)
    .input('startTime', sql.VarChar(5), data.startTime)
    .input('endTime', sql.VarChar(5), data.endTime)
    .query(`
      INSERT INTO dbo.TimeSlots (FieldTypeId, StartTime, EndTime)
      OUTPUT INSERTED.TimeSlotId AS id
      VALUES (@fieldTypeId, CAST(@startTime AS TIME(0)), CAST(@endTime AS TIME(0)))
    `);
  return findById(result.recordset[0].id, tx);
}

async function update(id, data, tx) {
  const request = await createRequest(tx);
  request.input('id', sql.Int, id);
  const sets = [];
  if (data.startTime !== undefined) {
    request.input('startTime', sql.VarChar(5), data.startTime);
    sets.push('StartTime = CAST(@startTime AS TIME(0))');
  }
  if (data.endTime !== undefined) {
    request.input('endTime', sql.VarChar(5), data.endTime);
    sets.push('EndTime = CAST(@endTime AS TIME(0))');
  }
  if (data.isActive !== undefined) {
    request.input('isActive', sql.Bit, data.isActive ? 1 : 0);
    sets.push('IsActive = @isActive');
  }
  if (sets.length > 0) {
    sets.push('UpdatedAt = SYSUTCDATETIME()');
    await request.query(`UPDATE dbo.TimeSlots SET ${sets.join(', ')} WHERE TimeSlotId = @id`);
  }
  return findById(id, tx);
}

async function remove(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query('DELETE FROM dbo.TimeSlots WHERE TimeSlotId = @id');
  return result.rowsAffected[0] > 0;
}

module.exports = {
  list,
  findById,
  hasOverlap,
  countFutureBookings,
  insert,
  update,
  remove,
};
