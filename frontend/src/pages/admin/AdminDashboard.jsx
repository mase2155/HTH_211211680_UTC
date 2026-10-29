import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../constants/routes';
import { queryKeys } from '../../constants/queryKeys';
import { fetchNewsPostsApi } from '../../features/newsPosts/newsPosts.api';
import { fetchPartnerItemsApi } from '../../features/partnerItems/partnerItems.api';
import RevenueChart from '../../features/stats/components/RevenueChart';
import {
  fetchStatsFieldsApi,
  fetchStatsOverviewApi,
  fetchStatsRevenueApi,
} from '../../features/stats/stats.api';
import { formatCurrency } from '../../utils/format';
import { addDaysToDateInput, todayDateInput } from '../../utils/date';

const base = ROUTES.admin;

export default function AdminDashboard() {
  const [groupBy, setGroupBy] = useState('day');
  const [fromDate, setFromDate] = useState(addDaysToDateInput(todayDateInput(), -30));
  const [toDate, setToDate] = useState(todayDateInput());
  const [appliedRange, setAppliedRange] = useState({ fromDate, toDate, groupBy });

  const { data: newsMeta } = useQuery({
    queryKey: queryKeys.newsPosts({ admin: true }),
    queryFn: () => fetchNewsPostsApi({ limit: 1 }),
  });
  const { data: partnersMeta } = useQuery({
    queryKey: queryKeys.partnerItems({ admin: true }),
    queryFn: () => fetchPartnerItemsApi({ limit: 1 }),
  });
  const { data: overview, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.adminStatsOverview,
    queryFn: fetchStatsOverviewApi,
  });

  const revenueQuery = useQuery({
    queryKey: queryKeys.adminStatsRevenue(appliedRange),
    queryFn: () =>
      fetchStatsRevenueApi({
        groupBy: appliedRange.groupBy,
        fromDate: appliedRange.fromDate,
        toDate: appliedRange.toDate,
      }),
  });

  const fieldsStatsQuery = useQuery({
    queryKey: queryKeys.adminStatsFields,
    queryFn: fetchStatsFieldsApi,
  });

  const applyRevenueFilter = (e) => {
    e.preventDefault();
    setAppliedRange({ fromDate, toDate, groupBy });
  };

  const revenuePoints = revenueQuery.data ?? [];
  const fieldStats = fieldsStatsQuery.data ?? [];

  return (
    <>
      <div className="content-header">
        <h1>Báo cáo hệ thống</h1>
        <p className="breadcrumb-demo">Admin / Báo cáo hệ thống</p>
      </div>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card stat-box">
            <div className="card-body">
              <h6 className="text-muted">Bài tin tức</h6>
              <h3 className="mb-0">{newsMeta?.meta?.total ?? '—'}</h3>
              <Link to={`${base}/content/news`} className="small">
                Quản lý tin tức →
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-box">
            <div className="card-body">
              <h6 className="text-muted">Đối tác</h6>
              <h3 className="mb-0">{partnersMeta?.meta?.total ?? '—'}</h3>
              <Link to={`${base}/content/partners`} className="small">
                Quản lý đối tác →
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card stat-box">
            <div className="card-body">
              <h6 className="text-muted">Đơn chờ xử lý</h6>
              <h3 className="mb-0">{statsLoading ? '…' : (overview?.pendingBookings ?? 0)}</h3>
              <Link to={`${base}/operations/bookings`} className="small">
                Xem đơn đặt lịch →
              </Link>
            </div>
          </div>
        </div>
      </div>
      {!statsLoading && overview && (
        <div className="card mt-2">
          <div className="card-header">Thống kê số lượng đơn</div>
          <div className="card-body row g-3">
            <div className="col-sm-4">
              <strong>Tổng đơn (không hủy):</strong> {overview.totalBookings}
            </div>
            <div className="col-sm-4">
              <strong>Đã hủy:</strong> {overview.cancelledBookings}
            </div>
            <div className="col-sm-4">
              <strong>Doanh thu đã thu (tổng):</strong> {formatCurrency(overview.totalRevenue ?? 0)}
            </div>
          </div>
        </div>
      )}

      <div className="card mt-3">
        <div className="card-header">Doanh thu theo {appliedRange.groupBy === 'month' ? 'tháng' : 'ngày'}</div>
        <div className="card-body">
          <form className="row g-2 align-items-end mb-3" onSubmit={applyRevenueFilter}>
            <div className="col-md-2">
              <label className="form-label small">Nhóm theo</label>
              <select className="form-select form-select-sm" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
                <option value="day">Ngày</option>
                <option value="month">Tháng</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small">Từ ngày</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small">Đến ngày</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-sm btn-primary w-100">
                Áp dụng
              </button>
            </div>
          </form>
          {revenueQuery.isLoading && <p className="text-muted mb-0">Đang tải doanh thu…</p>}
          {revenueQuery.isError && <p className="text-danger mb-0">Không tải được dữ liệu doanh thu.</p>}
          {!revenueQuery.isLoading && !revenueQuery.isError && (
            <>
              <RevenueChart points={revenuePoints} groupBy={appliedRange.groupBy} />
              {revenuePoints.length > 0 && (
                <div className="table-responsive mt-3">
                  <table className="table table-sm table-bordered mb-0">
                    <thead>
                      <tr>
                        <th>Kỳ</th>
                        <th>Số đơn đã thu</th>
                        <th>Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenuePoints.map((row) => (
                        <tr key={row.period}>
                          <td>{row.period}</td>
                          <td>{row.paidBookings ?? 0}</td>
                          <td>{formatCurrency(row.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card mt-3">
        <div className="card-header">Hiệu suất từng sân</div>
        <div className="card-body table-responsive">
          {fieldsStatsQuery.isLoading && <p className="text-muted mb-0">Đang tải…</p>}
          {fieldsStatsQuery.isError && <p className="text-danger mb-0">Không tải được thống kê sân.</p>}
          {!fieldsStatsQuery.isLoading && !fieldsStatsQuery.isError && fieldStats.length === 0 && (
            <p className="text-muted mb-0">Chưa có dữ liệu đặt sân.</p>
          )}
          {fieldStats.length > 0 && (
            <table className="table table-sm table-hover mb-0">
              <thead>
                <tr>
                  <th>Sân</th>
                  <th>Số đơn</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {fieldStats.map((row) => (
                  <tr key={row.fieldId}>
                    <td>{row.fieldName}</td>
                    <td>{row.bookingCount}</td>
                    <td>{formatCurrency(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
