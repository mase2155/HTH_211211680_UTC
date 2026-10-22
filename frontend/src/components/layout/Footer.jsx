import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import iconEmail from '../../assets/images/layout/icon_email_pro.jpg';
import iconFb from '../../assets/images/layout/icon_fb_pro.jpg';
import iconZalo from '../../assets/images/layout/icon_zalo_pro.jpg';
import logoBo from '../../assets/images/layout/logo-bo-cong-thuong.jpg';

export default function Footer() {
  return (
    <>
      <footer className="info-company">
        <div className="container">
          <div className="contact">
            <div>
              <h3>Thông Tin Chung</h3>
            </div>
            <div>
              <h2>HỆ THỐNG QUẢN LÝ SÂN BÓNG</h2>
            </div>
            <div className="phoneAndMail">
              <i className="fa-solid fa-phone" />
              <a href="tel:0559499585">055.949.9585</a>
            </div>
            <div className="phoneAndMail">
              <i className="fa-solid fa-envelope" />
              <a href="mailto:dev.hung.utc@gmail.com">dev.hung.utc@gmail.com</a>
            </div>
            <div className="phoneAndMail">
              <i className="fa-solid fa-location-dot" /> Số 132 Phố Cầu Giấy, Nghĩa Đô, Hà Nội
            </div>
          </div>
          <div className="about-us-footer">
            <h3>VỀ CHÚNG TÔI</h3>
            <Link to={ROUTES.booking}>Đặt Lịch</Link>
            <Link to={ROUTES.news}>Tin Tức</Link>
            <Link to={ROUTES.partners}>Đối Tác</Link>
            <Link to={ROUTES.contact}>Liên Hệ</Link>
          </div>
          <div className="connect-us">
            <h3>KẾT NỐI VỚI CHÚNG TÔI</h3>
            <div className="social">
              <a href="#">
                <img src={iconFb} alt="Facebook" />
              </a>
              <a href="#">
                <img src={iconZalo} alt="Zalo" />
              </a>
              <a href="#">
                <img src={iconEmail} alt="Email" />
              </a>
            </div>
            <div className="logo-bo-cong-thuong">
              <img className="w-60" src={logoBo} alt="logo-bo-cong-thuong" />
            </div>
          </div>
        </div>
      </footer>
      <section id="caption">
        <div className="author">
          <p>
            Created by{' '}
            <span>
              Hung Mase |{' '}
              <a href="https://www.facebook.com/hungmaseco2k5" target="_blank" rel="noreferrer">
                FB: Lê Đình Hùng
              </a>
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
