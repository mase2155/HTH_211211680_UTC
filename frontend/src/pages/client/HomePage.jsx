import { Link } from 'react-router-dom';
import bannerImg from '../../assets/images/homepage/banner.png';
import img2 from '../../assets/images/homepage/img2.png';
import img3 from '../../assets/images/homepage/img3.webp';
import { ROUTES } from '../../constants/routes';
import '../../styles/pages/homepage.css';

const mainFeatures = [
  {
    icon: 'fa-chart-line text-purple',
    title: 'Xem Tình Trạng Sân',
    desc: 'Giúp chủ sân xem được sân nào giờ nào còn trống hay đã được đặt. Chủ sân có thể xem được đơn nào chưa thanh toán, đã thanh toán hay còn đang sử dụng dịch vụ ở sân. Ngoài ra có thể xem được khách nào là khách lẻ, khách nào cố định.',
  },
  {
    icon: 'fa-box-open text-orange',
    title: 'Bán Dịch Vụ',
    desc: 'Tính năng bán hàng của phần mềm quản lý ALOBO cho phép chủ sân dễ dàng bán các dịch vụ như nước uống, vợt, bóng, cầu, đồ ăn,... một cách nhanh chóng và hiệu quả. Giúp theo dõi doanh thu từ việc bán dịch vụ.',
  },
  {
    icon: 'fa-calendar-days text-blue',
    title: 'Quản Lý Lịch Đặt',
    desc: 'ALOBO cung cấp đầy đủ tính năng quản lý và tạo lịch đặt theo ngày, linh hoạt, cố định theo tháng. Đồng thời bạn có thể theo dõi và duyệt đơn đặt lịch từ khách hàng, giúp bạn tổ chức công việc một cách thuận tiện và dễ dàng.',
  },
  {
    icon: 'fa-receipt text-purple',
    title: 'Thống Kê Doanh Thu',
    desc: 'ALOBO cung cấp báo cáo và thống kê chi tiết về doanh thu, số lượng đặt lịch, các dịch vụ ở sân và nhiều chỉ số kinh doanh khác. Điều này giúp bạn đánh giá hiệu quả kinh doanh, tối ưu và đưa ra quyết định đúng đắn.',
  },
  {
    icon: 'fa-users text-orange',
    title: 'Quản Lý Khách Hàng',
    desc: 'ALOBO cho phép bạn lưu trữ thông tin khách hàng, lịch sử đặt lịch và thống kê tổng tiền đã chi của khách. Bạn có thể tạo ra chương trình khuyến mãi tri ân khách hàng, tăng tương tác và tạo sự hài lòng cho khách hàng.',
  },
  {
    icon: 'fa-file-invoice text-blue',
    title: 'Nhiều Chức Năng Hot Khác',
    desc: 'ALOBO còn cung cấp thêm các tính năng chuyên biệt khác cho việc quản lý như tạo sự kiện vé xe (social), cổng thanh toán tự động, quản lý chi nhánh, quản lý khách hàng, quản lý thu chi,...',
  },
];

const whyChooseCards = [
  {
    icon: 'fa-chart-line',
    iconClass: 'icon-blue',
    title: 'Tăng Doanh Thu',
    desc: 'Phần mềm giúp thống kê tình hình kinh doanh hiện tại. Tăng tỉ lệ lấp đầy sân trống từ đó tăng doanh thu.',
  },
  {
    icon: 'fa-sliders',
    iconClass: 'icon-pink',
    title: 'Tăng Hiệu Quả Quản Lý',
    desc: 'Phần mềm ALOBO giúp tự động hóa các quy trình nghiệp vụ như đặt lịch, thanh toán, báo cáo,... giúp tiết kiệm thời gian và chi phí nhân lực. Ngoài ra, phần mềm còn giúp quản lý thông tin khách hàng, lịch sử giao dịch,... giúp nâng cao hiệu quả chăm sóc khách hàng.',
  },
  {
    icon: 'fa-face-smile',
    iconClass: 'icon-green',
    title: 'Tăng Trải Nghiệm Khách Hàng',
    desc: 'Phần mềm giúp khách hàng dễ dàng đặt lịch, thanh toán và theo dõi lịch sử giao dịch,... giúp khách hàng chủ động đặt và quay lại nhiều lần hơn.',
  },
  {
    icon: 'fa-users-rectangle',
    iconClass: 'icon-yellow',
    title: 'Tăng Tính Cạnh Tranh',
    desc: 'Phần mềm ALOBO giúp doanh nghiệp nâng cao hiệu quả hoạt động kinh doanh, tăng khả năng tiếp cận khách hàng tốt, từ đó tăng nâng cao độ uy tín trên cộng đồng.',
  },
];

const onlineBookingCards = [
  {
    icon: 'fa-calendar-check',
    iconClass: 'icon-green',
    title: 'Đặt Lịch',
    desc: 'Quên đi việc ngồi đợi hàng tiếng đồng hồ – nay bạn chỉ cần ngồi ở nhà và đặt lịch trực tuyến một cách nhanh chóng và thuận tiện.',
  },
  {
    icon: 'fa-map-location-dot',
    iconClass: 'icon-yellow',
    title: 'Dễ Dàng Tìm Kiếm',
    desc: 'Tìm kiếm những sân cung cấp dịch vụ vây gắn vị trí hiện tại của bạn. Bạn có thể xem thông tin chi tiết về các địa điểm, bao gồm đánh giá và xếp hạng từ cộng đồng người dùng khác.',
  },
  {
    icon: 'fa-award',
    iconClass: 'icon-blue',
    title: 'Tăng Trải Nghiệm Khách Hàng',
    desc: 'Trải nghiệm những dịch vụ chất lượng ở sân, có cơ hội trở thành thành viên thân thiết và nhận được những ưu đãi đặc biệt.',
  },
];

function FeatureStackCard({ icon, iconClass, title, desc, isLast }) {
  return (
    <div className={`custom-card p-3 ${isLast ? '' : 'mb-3'}`}>
      <div className="d-flex align-items-start">
        <div className={`card-icon-wrapper ${iconClass} me-3`}>
          <i className={`fa-solid ${icon}`} />
        </div>
        <div>
          <h5 className="fw-bold mb-1">{title}</h5>
          <p className="mb-0 text-muted">{desc}</p>
        </div>
      </div>
    </div>
  );
}

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
            {mainFeatures.map((item) => (
              <div key={item.title} className="col-12 col-md-6 col-lg-4">
                <div className="feature-card text-start p-4 position-relative">
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

      <section className="why-choose-section py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-main-title fw-bold">Tại Sao Bạn Nên Chọn Ứng Dụng Của Chúng Tôi</h2>
            <div className="title-underline mx-auto" />
          </div>
          <div className="row align-items-center mb-5 pb-4">
            <div className="col-lg-5 mb-4 mb-lg-0 text-center">
              <div className="feature-side-image">
                <img src={img2} alt="Quản Lý Đặt Lịch" className="img-fluid" />
              </div>
            </div>
            <div className="col-lg-7">
              <div className="content-block-header mb-4">
                <h3 className="block-title fw-bold">ALOBO – Website Quản Lý Và Đặt Lịch</h3>
                <p className="block-desc text-muted">
                  Quản lý tình trạng kinh doanh – Quản lý doanh thu – Quản lý chi nhánh và hơn thế nữa
                </p>
              </div>
              <div className="features-stack">
                {whyChooseCards.map((card, index) => (
                  <FeatureStackCard key={card.title} {...card} isLast={index === whyChooseCards.length - 1} />
                ))}
              </div>
            </div>
          </div>
          <div className="row align-items-center pt-4">
            <div className="col-lg-7 order-2 order-lg-1">
              <div className="content-block-header mb-4">
                <h3 className="block-title fw-bold">ALOBO – Phần Mềm Đặt Lịch Trực Tuyến</h3>
                <p className="block-desc text-muted">
                  Khách chơi có thể dễ dàng tìm kiếm sân Pickleball, cầu lông hay các môn thể thao để đặt lịch và sử
                  dụng những dịch vụ thông minh khác.
                </p>
              </div>
              <div className="features-stack">
                {onlineBookingCards.map((card, index) => (
                  <FeatureStackCard key={card.title} {...card} isLast={index === onlineBookingCards.length - 1} />
                ))}
              </div>
              <div className="mt-4">
                <Link to={ROUTES.booking} className="btn btn-warning btn-lg text-uppercase fw-bold">
                  Đặt lịch ngay
                </Link>
              </div>
            </div>
            <div className="col-lg-5 order-1 order-lg-2 mb-4 mb-lg-0 text-center">
              <div className="feature-side-image">
                <img src={img3} alt="Đặt Lịch Trực Tuyến" className="img-fluid" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section py-5 text-white">
        <div className="container py-4">
          <div className="row text-center justify-content-center g-4">
            <div className="col-12 col-md-4">
              <div className="stat-item">
                <div className="stat-icon mb-3">
                  <i className="fa-solid fa-mobile-screen" />
                </div>
                <h2 className="stat-number fw-bold mb-1">10000+</h2>
                <p className="stat-label mb-0">Lượt truy cập</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="stat-item">
                <div className="stat-icon mb-3">
                  <i className="fa-solid fa-handshake" />
                </div>
                <h2 className="stat-number fw-bold mb-1">100+</h2>
                <p className="stat-label mb-0">Khách hàng</p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="stat-item">
                <div className="stat-icon mb-3">
                  <i className="fa-solid fa-award" />
                </div>
                <h2 className="stat-number fw-bold mb-1">3+</h2>
                <p className="stat-label mb-0">Năm kinh nghiệm</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
