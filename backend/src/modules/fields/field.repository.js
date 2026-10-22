const { sql, createRequest } = require('../../config/database');
const { toOffset } = require('../../utils/pagination');
const { escapeLike, LIKE_ESCAPE_CLAUSE } = require('../../utils/sql');

const FIELD_COLUMNS = `
  f.FieldId AS id,
  f.FieldTypeId AS fieldTypeId,
  ft.Name AS fieldTypeName,
  f.Name AS name,
  f.Address AS address,
  f.Description AS description,
  f.ImageUrl AS imageUrl,
  f.Status AS status,
  CONVERT(VARCHAR(23), f.CreatedAt, 126) AS createdAt
`;

async function list(filters, tx) {
  const request = await createRequest(tx);
  request.input('offset', sql.Int, toOffset(filters));
  request.input('limit', sql.Int, filters.limit);

  let where = 'WHERE 1=1';
  if (filters.keyword) {
    request.input('keyword', sql.NVarChar(160), `%${escapeLike(filters.keyword)}%`);
    where += ` AND (f.Name LIKE @keyword ${LIKE_ESCAPE_CLAUSE} OR f.Address LIKE @keyword ${LIKE_ESCAPE_CLAUSE})`;
  }
  if (filters.fieldTypeId) {
    request.input('fieldTypeId', sql.Int, filters.fieldTypeId);
    where += ' AND f.FieldTypeId = @fieldTypeId';
  }
  if (filters.status) {
    request.input('status', sql.NVarChar(20), filters.status);
    where += ' AND f.Status = @status';
  }

  let joinExtra = '';
  if (filters.bookingDate && filters.timeSlotId) {
    request.input('bookingDate', sql.Date, filters.bookingDate);
    request.input('timeSlotId', sql.Int, filters.timeSlotId);
    request.input('dayType', sql.NVarChar(10), filters.dayType);
    joinExtra = `
      JOIN dbo.Prices p ON p.FieldId = f.FieldId AND p.TimeSlotId = @timeSlotId AND p.DayType = @dayType
      LEFT JOIN dbo.FieldClosures fc ON fc.FieldId = f.FieldId AND fc.ClosedDate = @bookingDate
      LEFT JOIN dbo.Bookings b ON b.FieldId = f.FieldId
        AND b.TimeSlotId = @timeSlotId
        AND b.BookingDate = @bookingDate
        AND b.Status <> N'Cancelled'
    `;
    where += ' AND fc.FieldClosureId IS NULL AND b.BookingId IS NULL';
    if (filters.minPrice !== undefined) {
      request.input('minPrice', sql.Decimal(12, 0), filters.minPrice);
      where += ' AND p.Amount >= @minPrice';
    }
    if (filters.maxPrice !== undefined) {
      request.input('maxPrice', sql.Decimal(12, 0), filters.maxPrice);
      where += ' AND p.Amount <= @maxPrice';
    }
  }

  const result = await request.query(`
    SELECT ${FIELD_COLUMNS},
      ${filters.bookingDate && filters.timeSlotId ? 'p.Amount AS priceFrom,' : ''}
      COUNT(*) OVER() AS totalCount
    FROM dbo.Fields f
    JOIN dbo.FieldTypes ft ON ft.FieldTypeId = f.FieldTypeId
    ${joinExtra}
    ${where}
    ORDER BY f.Name
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);

  const total = result.recordset[0]?.totalCount ?? 0;
  const items = result.recordset.map(({ totalCount: _total, ...row }) => row);
  return { items, total };
}

async function findById(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query(`
    SELECT ${FIELD_COLUMNS}
    FROM dbo.Fields f
    JOIN dbo.FieldTypes ft ON ft.FieldTypeId = f.FieldTypeId
    WHERE f.FieldId = @id
  `);
  return result.recordset[0] ?? null;
}

async function insert(data, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('fieldTypeId', sql.Int, data.fieldTypeId)
    .input('name', sql.NVarChar(150), data.name)
    .input('address', sql.NVarChar(255), data.address)
    .input('description', sql.NVarChar(2000), data.description ?? null)
    .input('imageUrl', sql.NVarChar(500), data.imageUrl ?? null)
    .input('status', sql.NVarChar(20), data.status)
    .query(`
      INSERT INTO dbo.Fields (FieldTypeId, Name, Address, Description, ImageUrl, Status)
      OUTPUT INSERTED.FieldId AS id
      VALUES (@fieldTypeId, @name, @address, @description, @imageUrl, @status)
    `);
  return findById(result.recordset[0].id, tx);
}

async function update(id, data, tx) {
  const request = await createRequest(tx);
  request.input('id', sql.Int, id);
  const sets = [];
  const map = {
    fieldTypeId: ['FieldTypeId', sql.Int],
    name: ['Name', sql.NVarChar(150)],
    address: ['Address', sql.NVarChar(255)],
    description: ['Description', sql.NVarChar(2000)],
    imageUrl: ['ImageUrl', sql.NVarChar(500)],
    status: ['Status', sql.NVarChar(20)],
  };
  Object.entries(map).forEach(([key, [column, type]]) => {
    if (data[key] === undefined) return;
    request.input(key, type, data[key]);
    sets.push(`${column} = @${key}`);
  });
  if (sets.length === 0) return findById(id, tx);
  sets.push('UpdatedAt = SYSUTCDATETIME()');
  await request.query(`UPDATE dbo.Fields SET ${sets.join(', ')} WHERE FieldId = @id`);
  return findById(id, tx);
}

async function remove(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query('DELETE FROM dbo.Fields WHERE FieldId = @id');
  return result.rowsAffected[0] > 0;
}

async function countActiveBookings(fieldId, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, fieldId).query(`
    SELECT COUNT(*) AS cnt FROM dbo.Bookings
    WHERE FieldId = @id AND Status <> N'Cancelled'
  `);
  return result.recordset[0].cnt;
}

module.exports = { list, findById, insert, update, remove, countActiveBookings };
