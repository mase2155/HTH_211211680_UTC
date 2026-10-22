const { sql, createRequest } = require('../../config/database');

async function listByFieldId(fieldId, tx) {
  const request = await createRequest(tx);
  const result = await request.input('fieldId', sql.Int, fieldId).query(`
    SELECT
      p.PriceId AS id,
      p.FieldId AS fieldId,
      p.TimeSlotId AS timeSlotId,
      CONVERT(VARCHAR(5), ts.StartTime, 108) AS startTime,
      CONVERT(VARCHAR(5), ts.EndTime, 108) AS endTime,
      p.DayType AS dayType,
      p.Amount AS amount
    FROM dbo.Prices p
    JOIN dbo.TimeSlots ts ON ts.TimeSlotId = p.TimeSlotId
    WHERE p.FieldId = @fieldId
    ORDER BY ts.StartTime, p.DayType
  `);
  return result.recordset;
}

async function findAmount({ fieldId, timeSlotId, dayType }, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('fieldId', sql.Int, fieldId)
    .input('timeSlotId', sql.Int, timeSlotId)
    .input('dayType', sql.NVarChar(10), dayType)
    .query(`
      SELECT Amount AS amount
      FROM dbo.Prices
      WHERE FieldId = @fieldId AND TimeSlotId = @timeSlotId AND DayType = @dayType
    `);
  return result.recordset[0]?.amount ?? null;
}

async function replaceForField(fieldId, rows, tx) {
  const deleteRequest = await createRequest(tx);
  await deleteRequest.input('fieldId', sql.Int, fieldId).query('DELETE FROM dbo.Prices WHERE FieldId = @fieldId');
  for (const row of rows) {
    const req = await createRequest(tx);
    await req
      .input('fieldId', sql.Int, fieldId)
      .input('timeSlotId', sql.Int, row.timeSlotId)
      .input('dayType', sql.NVarChar(10), row.dayType)
      .input('amount', sql.Decimal(12, 0), row.amount)
      .query(`
        INSERT INTO dbo.Prices (FieldId, TimeSlotId, DayType, Amount)
        VALUES (@fieldId, @timeSlotId, @dayType, @amount)
      `);
  }
}

module.exports = { listByFieldId, findAmount, replaceForField };
