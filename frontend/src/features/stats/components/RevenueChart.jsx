import { formatCurrency } from '../../../utils/format';

/**
 * Biểu đồ cột CSS thuần (không thêm thư viện chart).
 * @param {{ period: string, revenue: number, paidBookings?: number }[]} points
 */
export default function RevenueChart({ points, groupBy = 'day' }) {
  if (!points?.length) {
    return <p className="text-muted mb-0">Không có dữ liệu doanh thu trong kỳ đã chọn.</p>;
  }

  const maxRevenue = Math.max(...points.map((p) => p.revenue), 1);
  const barMaxPx = 160;

  return (
    <div className="revenue-chart" aria-label="Biểu đồ doanh thu">
      <div className="revenue-chart-bars d-flex align-items-end gap-1" style={{ height: `${barMaxPx}px` }}>
        {points.map((point) => {
          const barPx = point.revenue > 0 ? Math.max(4, Math.round((point.revenue / maxRevenue) * barMaxPx)) : 0;
          const label =
            groupBy === 'month' && point.period?.length >= 7
              ? point.period.slice(0, 7)
              : point.period?.slice(5) ?? point.period;
          return (
            <div
              key={point.period}
              className="revenue-chart-bar flex-fill d-flex flex-column align-items-center justify-content-end"
              style={{ height: '100%' }}
              title={`${point.period}: ${formatCurrency(point.revenue)} (${point.paidBookings ?? 0} đơn)`}
            >
              <div
                className="revenue-chart-bar-fill w-100 rounded-top"
                style={{
                  height: `${barPx}px`,
                  background: 'linear-gradient(180deg, #bd945f 0%, #96733f 100%)',
                }}
              />
              <span className="revenue-chart-label small text-muted text-center mt-1" style={{ fontSize: '0.65rem' }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="small text-muted mt-2 mb-0">Di chuột lên cột để xem chi tiết từng kỳ.</p>
    </div>
  );
}
