import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ROUTES } from '../../constants/routes';
import { queryKeys } from '../../constants/queryKeys';
import { fetchNewsPostsApi } from '../../features/newsPosts/newsPosts.api';
import { fetchPartnerItemsApi } from '../../features/partnerItems/partnerItems.api';
import { fetchStatsOverviewApi } from '../../features/stats/stats.api';

const base = ROUTES.admin;

export default function AdminDashboard() {
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
          <div className="card-header">Thống kê nhanh</div>
          <div className="card-body row g-3">
            <div className="col-sm-4">
              <strong>Tổng đơn:</strong> {overview.totalBookings}
            </div>
            <div className="col-sm-4">
              <strong>Đã hủy:</strong> {overview.cancelledBookings}
            </div>
            <div className="col-sm-4">
              <strong>Doanh thu (đã thu):</strong>{' '}
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                overview.totalRevenue ?? 0,
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
