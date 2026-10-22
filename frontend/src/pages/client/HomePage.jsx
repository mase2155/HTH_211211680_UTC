import { Link } from 'react-router-dom';
import bannerImg from '../../assets/images/homepage/banner.png';
import { ROUTES } from '../../constants/routes';
import '../../styles/pages/homepage.css';

export default function HomePage() {
  return (
    <div className="home-page">
      <section className="banner-section position-relative overflow-hidden text-white py-5">
        <div className="container position-relative z-2 text-center">
          <h1 className="banner-title fw-bold mb-3">
            ALOBO – Website chuyên biệt cho đặt lịch
            <br />
            trực tuyến &amp; quản lý sân Pickleball – Cầu Lông – Tennis – Bóng Đá
          </h1>
          <div className="banner-features mb-4">
            <p className="mb-1">CHUYÊN BIỆT CHO SÂN THỂ THAO</p>
            <p className="mb-1">TĂNG TỶ LỆ LẤP ĐẦY SÂN TRỐNG</p>
            <p className="mb-1">DỄ SỬ DỤNG</p>
            <p className="mb-1">HIỆU QUẢ RẤT CAO</p>
            <p className="mb-3">HƠN 2.500+ CHỦ SÂN ĐANG DÙNG</p>
            <div className="banner-divider mx-auto" />
          </div>
          <Link to={ROUTES.booking} className="btn btn-warning btn-lg text-uppercase fw-bold mb-4">
            Đặt lịch ngay
          </Link>
          <div className="banner-img-container mt-4">
            <img src={bannerImg} alt="ALOBO Illustration" className="img-fluid banner-main-img" />
          </div>
        </div>
      </section>

      <section className="main-features-section py-5">
        <div className="container text-center">
          <div className="section-header mb-4">
            <h2 className="section-title fw-bold">Chức Năng Chính</h2>
            <div className="title-underline mx-auto" />
          </div>
          <div className="row g-4 justify-content-center">
            {[
              {
                icon: 'fa-chart-line text-purple',
                title: 'Xem Tình Trạng Sân',
                desc: 'Theo dõi sân trống, đơn đặt và trạng thái thanh toán theo thời gian thực.',
              },
              {
                icon: 'fa-calendar-days text-blue',
                title: 'Quản Lý Lịch Đặt',
                desc: 'Đặt lịch trực tuyến, chọn khung giờ và xác nhận đơn nhanh chóng.',
              },
              {
                icon: 'fa-receipt text-purple',
                title: 'Thống Kê Doanh Thu',
                desc: 'Báo cáo doanh thu và hiệu suất từng sân cho chủ sân và quản trị.',
              },
            ].map((item) => (
              <div key={item.title} className="col-12 col-md-6 col-lg-4">
                <div className="feature-card text-start p-4">
                  <div className="card-icon-box mb-3">
                    <i className={`fa-solid ${item.icon}`} />
                  </div>
                  <h5 className="card-title fw-bold mb-2">{item.title}</h5>
                  <p className="card-desc mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
