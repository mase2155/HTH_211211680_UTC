import '../../styles/pages/contact.css';

const contactFeatures = [
  {
    icon: 'fa-headset',
    iconClass: 'icon-support',
    title: 'Hỗ trợ 24/7',
    desc: 'Với hệ thống support chuyên nghiệp hỗ trợ, giải đáp và hỗ trợ mọi thắc mắc của khách hàng một cách nhanh nhất.',
  },
  {
    icon: 'fa-desktop',
    iconClass: 'icon-admin',
    title: 'Dễ dàng sử dụng',
    desc: 'Trang có giao diện trực quan, dễ sử dụng cho toàn bộ đối tượng có thể xem và thao tác',
  },
  {
    icon: 'fa-rocket',
    iconClass: 'icon-speed',
    title: 'Thanh toán và đặt cọc dễ dàng',
    desc: 'Khách hàng có thể đặt lịch và thanh toán cọc hoặc toàn bộ tiền thuê một cách nhanh chóng và được sao lưu thông tin chính xác',
  },
  {
    icon: 'fa-building-columns',
    iconClass: 'icon-design',
    title: 'Số tài khoản duy nhất',
    desc: (
      <>
        4595559999
        <br />
        Ngân hàng TMCP Kỹ Thương Việt Nam - Techcombank
      </>
    ),
  },
  {
    icon: 'fa-mobile-screen-button',
    iconClass: 'icon-offer',
    title: 'Hỗ trợ về sự cố phát sinh',
    desc: (
      <>
        Ông Lê Đình Hùng
        <br />
        Contact: 0559499585
      </>
    ),
  },
  {
    icon: 'fa-envelope-open-text',
    iconClass: 'icon-saving',
    title: 'Email liên hệ',
    desc: (
      <>
        Quản lý: Lê Đình Hùng
        <br />
        dev.hung.utc@gmail.com
      </>
    ),
  },
];

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="main_content">
        <div className="map_section">
          <iframe
            title="Bản đồ Trường Đại học Giao thông Vận tải"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.8639311820624!2d105.8019445759695!3d21.02878798062061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab3b2b027d7f%3A0xbe03657af3f0355f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBHaWFvIHThuqduZyBW4bqtbiBU4bqjaSAoVVRDk!5e0!3m2!1svi!2s!4v1680000000000!5m2!1svi!2s"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="features-wrapper py-5">
          <div className="container">
            <div className="row g-4">
              {contactFeatures.map((item) => (
                <div key={item.title} className="col-12 col-md-4">
                  <div className="feature-card text-center p-4">
                    <div className={`icon-circle ${item.iconClass} mx-auto mb-3`}>
                      <i className={`fa-solid ${item.icon}`} />
                    </div>
                    <h5 className="feature-title fw-bold mb-2">{item.title}</h5>
                    <p className="feature-desc text-muted mb-0">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
