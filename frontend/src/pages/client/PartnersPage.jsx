import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../constants/queryKeys';
import { fetchPartnerItemsApi } from '../../features/partnerItems/partnerItems.api';
import '../../styles/pages/customer.css';

export default function PartnersPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.partnerItems({ public: true, active: true }),
    queryFn: () => fetchPartnerItemsApi({ isActive: true, limit: 50 }),
  });

  const cards = data?.items ?? [];

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
            {isLoading && <p className="text-muted">Đang tải…</p>}
            {isError && <p className="text-danger">Không tải được danh sách đối tác.</p>}
            <div className="postGrid">
              {cards.map((card) => (
                <div key={card.id} className="postCard">
                  <div className="cardMedia">
                    <a href="#top">
                      {card.imageUrl ? (
                        <img src={card.imageUrl} alt={card.title} className="cardImage" />
                      ) : null}
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
