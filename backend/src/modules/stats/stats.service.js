const { today, addDays } = require('../../utils/datetime');
const statsRepository = require('./stats.repository');

async function getOverview() {
  const row = await statsRepository.overview();
  return {
    totalBookings: Number(row.totalBookings ?? 0),
    cancelledBookings: Number(row.cancelledBookings ?? 0),
    pendingBookings: Number(row.pendingBookings ?? 0),
    totalRevenue: Number(row.totalRevenue ?? 0),
  };
}

async function getRevenue({ groupBy, fromDate, toDate }) {
  const from = fromDate ?? addDays(today(), -30);
  const to = toDate ?? today();
  const rows =
    groupBy === 'month'
      ? await statsRepository.revenueByMonth({ fromDate: from, toDate: to })
      : await statsRepository.revenueByDay({ fromDate: from, toDate: to });

  return rows.map((row) => ({
    period: row.period,
    revenue: Number(row.revenue ?? 0),
    paidBookings: Number(row.paidBookings ?? 0),
  }));
}

async function getFieldPerformance() {
  return (await statsRepository.fieldPerformance()).map((row) => ({
    fieldId: row.fieldId,
    fieldName: row.fieldName,
    bookingCount: Number(row.bookingCount ?? 0),
    revenue: Number(row.revenue ?? 0),
  }));
}

module.exports = { getOverview, getRevenue, getFieldPerformance };
