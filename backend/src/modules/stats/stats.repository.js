const { sql, createRequest } = require('../../config/database');

async function overview(tx) {
  const request = await createRequest(tx);
  const result = await request.query(`
    SELECT
      SUM(CASE WHEN Status <> N'Cancelled' THEN 1 ELSE 0 END) AS totalBookings,
      SUM(CASE WHEN Status = N'Cancelled' THEN 1 ELSE 0 END) AS cancelledBookings,
      SUM(CASE WHEN Status = N'Pending' THEN 1 ELSE 0 END) AS pendingBookings,
      SUM(CASE WHEN PaymentStatus = N'Paid' THEN TotalAmount ELSE 0 END) AS totalRevenue
    FROM dbo.Bookings
  `);
  return result.recordset[0];
}

async function revenueByDay({ fromDate, toDate }, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('fromDate', sql.Date, fromDate)
    .input('toDate', sql.Date, toDate)
    .query(`
      SELECT
        CONVERT(VARCHAR(10), BookingDate, 23) AS period,
        SUM(TotalAmount) AS revenue,
        COUNT(*) AS paidBookings
      FROM dbo.Bookings
      WHERE PaymentStatus = N'Paid'
        AND BookingDate >= @fromDate
        AND BookingDate <= @toDate
      GROUP BY BookingDate
      ORDER BY BookingDate
    `);
  return result.recordset;
}

async function revenueByMonth({ fromDate, toDate }, tx) {
  const request = await createRequest(tx);
  const result = await request
    .input('fromDate', sql.Date, fromDate)
    .input('toDate', sql.Date, toDate)
    .query(`
      SELECT
        FORMAT(BookingDate, 'yyyy-MM') AS period,
        SUM(TotalAmount) AS revenue,
        COUNT(*) AS paidBookings
      FROM dbo.Bookings
      WHERE PaymentStatus = N'Paid'
        AND BookingDate >= @fromDate
        AND BookingDate <= @toDate
      GROUP BY FORMAT(BookingDate, 'yyyy-MM')
      ORDER BY FORMAT(BookingDate, 'yyyy-MM')
    `);
  return result.recordset;
}

async function fieldPerformance(tx) {
  const request = await createRequest(tx);
  const result = await request.query(`
    SELECT
      f.FieldId AS fieldId,
      f.Name AS fieldName,
      COUNT(CASE WHEN b.Status <> N'Cancelled' THEN 1 END) AS bookingCount,
      SUM(CASE WHEN b.PaymentStatus = N'Paid' THEN b.TotalAmount ELSE 0 END) AS revenue
    FROM dbo.Fields f
    LEFT JOIN dbo.Bookings b ON b.FieldId = f.FieldId
    GROUP BY f.FieldId, f.Name
    ORDER BY revenue DESC, bookingCount DESC
  `);
  return result.recordset;
}

module.exports = { overview, revenueByDay, revenueByMonth, fieldPerformance };
