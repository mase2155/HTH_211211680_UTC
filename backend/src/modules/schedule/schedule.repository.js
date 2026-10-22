const { sql, createRequest } = require('../../config/database');

async function getActiveFieldsByType(fieldTypeId, tx) {
  const request = await createRequest(tx);
  const result = await request.input('fieldTypeId', sql.Int, fieldTypeId).query(`
    SELECT FieldId AS id, Name AS name, Status AS status
    FROM dbo.Fields
    WHERE FieldTypeId = @fieldTypeId AND Status <> N'Inactive'
    ORDER BY Name
  `);
  return result.recordset;
}

async function getActiveSlotsByType(fieldTypeId, tx) {
  const request = await createRequest(tx);
  const result = await request.input('fieldTypeId', sql.Int, fieldTypeId).query(`
    SELECT
      TimeSlotId AS id,
      CONVERT(VARCHAR(5), StartTime, 108) AS startTime,
      CONVERT(VARCHAR(5), EndTime, 108) AS endTime
    FROM dbo.TimeSlots
    WHERE FieldTypeId = @fieldTypeId AND IsActive = 1
    ORDER BY StartTime
  `);
  return result.recordset;
}

async function getBookingsForDate({ fieldIds, date }, tx) {
  if (fieldIds.length === 0) return [];
  const request = await createRequest(tx);
  fieldIds.forEach((id, index) => request.input(`fieldId${index}`, sql.Int, id));
  const inList = fieldIds.map((_, index) => `@fieldId${index}`).join(', ');
  const result = await request.input('date', sql.Date, date).query(`
    SELECT FieldId AS fieldId, TimeSlotId AS timeSlotId, Status AS status
    FROM dbo.Bookings
    WHERE BookingDate = @date
      AND FieldId IN (${inList})
      AND Status <> N'Cancelled'
  `);
  return result.recordset;
}

async function getClosuresForDate({ fieldIds, date }, tx) {
  if (fieldIds.length === 0) return [];
  const request = await createRequest(tx);
  fieldIds.forEach((id, index) => request.input(`fieldId${index}`, sql.Int, id));
  const inList = fieldIds.map((_, index) => `@fieldId${index}`).join(', ');
  const result = await request.input('date', sql.Date, date).query(`
    SELECT FieldId AS fieldId
    FROM dbo.FieldClosures
    WHERE ClosedDate = @date AND FieldId IN (${inList})
  `);
  return result.recordset;
}

module.exports = {
  getActiveFieldsByType,
  getActiveSlotsByType,
  getBookingsForDate,
  getClosuresForDate,
};
