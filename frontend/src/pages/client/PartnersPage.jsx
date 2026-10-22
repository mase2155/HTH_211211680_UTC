import { partnerCards } from '../../constants/newsPosts';
import '../../styles/pages/customer.css';

export default function PartnersPage() {
  return (
    <div className="partners-page">
      <div className="all-section">
        <section className="banner_content container">
          <div className="clientSection">
            <h2 className="clientTitle">Khách hàng của chúng tôi</h2>
            <div className="clientDescription">
              <p>ALOBO BOOKING ĐANG ĐƯỢC RẤT NHIỀU CHỦ SÂN TIN TƯỞNG VÀ ĐỒNG HÀNH SUỐT THỜI GIAN VỪA QUA.</p>
              <p>
                LÀ ĐƠN VỊ TIÊN PHONG CUNG CẤP GIẢI PHÁP QUẢN LÝ SÂN VÀ TỐI ƯU QUY TRÌNH VẬN HÀNH CHO CÁC SÂN THỂ
                THAO GIÚP CÁC CHỦ SÂN TIẾT KIỆM THỜI GIAN VÀ TIỀN BẠC
              </p>
            </div>
          </div>
        </section>
        <section>
          <div className="container">
            <div className="postGrid">
              {partnerCards.map((card) => (
                <div key={card.id} className="postCard">
                  <div className="cardMedia">
                    <a href="#top">
                      <img src={card.image} alt={card.imageAlt} className="cardImage" />
                    </a>
                  </div>
                  <div className="cardBody">
                    <div className="cardTitle">
                      <a href="#top">{card.title}</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
