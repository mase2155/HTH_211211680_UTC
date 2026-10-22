const { sql, createRequest } = require('../../config/database');
const { toOffset } = require('../../utils/pagination');

const BOOKING_COLUMNS = `
  b.BookingId AS id,
  b.BookingCode AS bookingCode,
  b.UserId AS userId,
  b.FieldId AS fieldId,
  f.Name AS fieldName,
  b.TimeSlotId AS timeSlotId,
  CONVERT(VARCHAR(5), b.StartTime, 108) AS startTime,
  CONVERT(VARCHAR(5), b.EndTime, 108) AS endTime,
  CONVERT(VARCHAR(10), b.BookingDate, 23) AS bookingDate,
  b.CustomerName AS customerName,
  b.CustomerPhone AS customerPhone,
  b.Note AS note,
  b.TotalAmount AS totalAmount,
  b.Status AS status,
  b.PaymentMethod AS paymentMethod,
  b.PaymentStatus AS paymentStatus,
  CONVERT(VARCHAR(23), b.PaidAt, 126) AS paidAt,
  CONVERT(VARCHAR(23), b.HoldExpiresAt, 126) AS holdExpiresAt,
  CONVERT(VARCHAR(23), b.CancelledAt, 126) AS cancelledAt,
  b.CancelReason AS cancelReason,
  CONVERT(VARCHAR(23), b.CreatedAt, 126) AS createdAt
`;

async function findById(id, tx) {
  const request = await createRequest(tx);
  const result = await request.input('id', sql.Int, id).query(`
    SELECT ${BOOKING_COLUMNS}
    FROM dbo.Bookings b
    JOIN dbo.Fields f ON f.FieldId = b.FieldId
    WHERE b.BookingId = @id
  `);
  return result.recordset[0] ?? null;
}

async function countPendingUnpaidByUser(userId, tx) {
  const request = await createRequest(tx);
  const result = await request.input('userId', sql.Int, userId).query(`
    SELECT COUNT(*) AS cnt
    FROM dbo.Bookings
    WHERE UserId = @userId AND Status = N'Pending' AND PaymentStatus = N'Unpaid'
  `);
  return result.recordset[0].cnt;
}

async function insert(data, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('bookingCode', sql.VarChar(20), data.bookingCode)
    .input('userId', sql.Int, data.userId)
    .input('fieldId', sql.Int, data.fieldId)
    .input('timeSlotId', sql.Int, data.timeSlotId)
    .input('bookingDate', sql.Date, data.bookingDate)
    .input('startTime', sql.VarChar(5), data.startTime)
    .input('endTime', sql.VarChar(5), data.endTime)
    .input('customerName', sql.NVarChar(100), data.customerName)
    .input('customerPhone', sql.VarChar(20), data.customerPhone)
    .input('note', sql.NVarChar(500), data.note ?? null)
    .input('totalAmount', sql.Decimal(12, 0), data.totalAmount)
    .input('status', sql.NVarChar(20), data.status)
    .input('paymentMethod', sql.NVarChar(20), data.paymentMethod)
    .input('paymentStatus', sql.NVarChar(20), data.paymentStatus)
    .input('holdExpiresAt', sql.DateTime2, data.holdExpiresAt ?? null)
    .query(`
      INSERT INTO dbo.Bookings (
        BookingCode, UserId, FieldId, TimeSlotId, BookingDate, StartTime, EndTime,
        CustomerName, CustomerPhone, Note, TotalAmount, Status, PaymentMethod, PaymentStatus, HoldExpiresAt
      )
      OUTPUT INSERTED.BookingId AS id
      VALUES (
        @bookingCode, @userId, @fieldId, @timeSlotId, @bookingDate,
        CAST(@startTime AS TIME(0)), CAST(@endTime AS TIME(0)),
        @customerName, @customerPhone, @note, @totalAmount, @status, @paymentMethod, @paymentStatus, @holdExpiresAt
      )
    `);
  return findById(result.recordset[0].id, tx);
}

async function listByUser({ userId, page, limit, status }, tx) {
  const request = await createRequest(tx);
  request.input('userId', sql.Int, userId);
  request.input('offset', sql.Int, toOffset({ page, limit }));
  request.input('limit', sql.Int, limit);
  let where = 'WHERE b.UserId = @userId';
  if (status) {
    request.input('status', sql.NVarChar(20), status);
    where += ' AND b.Status = @status';
  }
  const result = await request.query(`
    SELECT ${BOOKING_COLUMNS}, COUNT(*) OVER() AS totalCount
    FROM dbo.Bookings b
    JOIN dbo.Fields f ON f.FieldId = b.FieldId
    ${where}
    ORDER BY b.CreatedAt DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);
  const total = result.recordset[0]?.totalCount ?? 0;
  const items = result.recordset.map(({ totalCount: _total, ...row }) => row);
  return { items, total };
}

async function listAll(filters, tx) {
  const request = await createRequest(tx);
  request.input('offset', sql.Int, toOffset(filters));
  request.input('limit', sql.Int, filters.limit);
  let where = 'WHERE 1=1';
  if (filters.status) {
    request.input('status', sql.NVarChar(20), filters.status);
    where += ' AND b.Status = @status';
  }
  if (filters.bookingDate) {
    request.input('bookingDate', sql.Date, filters.bookingDate);
    where += ' AND b.BookingDate = @bookingDate';
  }
  if (filters.fieldId) {
    request.input('fieldId', sql.Int, filters.fieldId);
    where += ' AND b.FieldId = @fieldId';
  }
  const result = await request.query(`
    SELECT ${BOOKING_COLUMNS}, COUNT(*) OVER() AS totalCount
    FROM dbo.Bookings b
    JOIN dbo.Fields f ON f.FieldId = b.FieldId
    ${where}
    ORDER BY b.BookingDate DESC, b.StartTime DESC
    OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
  `);
  const total = result.recordset[0]?.totalCount ?? 0;
  const items = result.recordset.map(({ totalCount: _total, ...row }) => row);
  return { items, total };
}

async function markPaid(id, tx) {
  const request = await createRequest(tx);
  await request.input('id', sql.Int, id).query(`
    UPDATE dbo.Bookings
    SET PaymentStatus = N'Paid', PaidAt = SYSUTCDATETIME(), Status = N'Confirmed',
        HoldExpiresAt = NULL, UpdatedAt = SYSUTCDATETIME()
    WHERE BookingId = @id AND Status = N'Pending' AND PaymentStatus = N'Unpaid'
  `);
  return findById(id, tx);
}

async function cancelByUser(id, userId, reason, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('id', sql.Int, id)
    .input('userId', sql.Int, userId)
    .input('reason', sql.NVarChar(255), reason ?? null)
    .query(`
      UPDATE dbo.Bookings
      SET Status = N'Cancelled',
          PaymentStatus = CASE WHEN PaymentStatus = N'Paid' THEN N'Refunded' ELSE PaymentStatus END,
          CancelledAt = SYSUTCDATETIME(),
          CancelReason = @reason,
          HoldExpiresAt = NULL,
          UpdatedAt = SYSUTCDATETIME()
      WHERE BookingId = @id AND UserId = @userId AND Status IN (N'Pending', N'Confirmed')
    `);
  return result.rowsAffected[0] > 0;
}

async function updateStatus(id, { fromStatus, toStatus, cancelReason }, tx) {
  const request = await createRequest(tx);
  request
    .input('id', sql.Int, id)
    .input('fromStatus', sql.NVarChar(20), fromStatus)
    .input('toStatus', sql.NVarChar(20), toStatus)
    .input('cancelReason', sql.NVarChar(255), cancelReason ?? null);

  let extra = '';
  if (toStatus === 'Cancelled') {
    extra = `, CancelledAt = SYSUTCDATETIME(), CancelReason = @cancelReason,
      PaymentStatus = CASE WHEN PaymentStatus = N'Paid' THEN N'Refunded' ELSE PaymentStatus END`;
  }
  if (toStatus === 'Completed') {
    extra += `, PaymentStatus = CASE WHEN PaymentStatus = N'Unpaid' THEN N'Paid' ELSE PaymentStatus END,
      PaidAt = CASE WHEN PaidAt IS NULL THEN SYSUTCDATETIME() ELSE PaidAt END`;
  }
  if (toStatus === 'Confirmed') {
    extra += ', HoldExpiresAt = NULL';
  }

  const result = await request.query(`
    UPDATE dbo.Bookings
    SET Status = @toStatus, UpdatedAt = SYSUTCDATETIME() ${extra}
    WHERE BookingId = @id AND Status = @fromStatus
  `);
  return result.rowsAffected[0] > 0;
}

async function expireHeldBookings(tx) {
  const request = await createRequest(tx);
  const result = await request.query(`
    UPDATE dbo.Bookings
    SET Status = N'Cancelled',
        CancelledAt = SYSUTCDATETIME(),
        CancelReason = N'Hết hạn giữ chỗ thanh toán trực tuyến',
        HoldExpiresAt = NULL,
        UpdatedAt = SYSUTCDATETIME()
    WHERE Status = N'Pending'
      AND PaymentMethod = N'Online'
      AND PaymentStatus = N'Unpaid'
      AND HoldExpiresAt IS NOT NULL
      AND HoldExpiresAt < SYSUTCDATETIME()
  `);
  return result.rowsAffected[0];
}

module.exports = {
  findById,
  countPendingUnpaidByUser,
  insert,
  listByUser,
  listAll,
  markPaid,
  cancelByUser,
  updateStatus,
  expireHeldBookings,
};
