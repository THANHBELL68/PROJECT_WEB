import Link from 'next/link';

const contactItems = [
  { icon: '☎', label: 'Hotline', value: '0866105856', detail: '8:00 – 21h30, tất cả các ngày trong tuần', href: 'tel:0866105856' },
  { icon: '✉', label: 'Email', value: 'AETHER.Corporation@gmail.com', detail: 'Gửi email cho đội ngũ AETHER', href: 'mailto:AETHER.Corporation@gmail.com' },
  { icon: '⌖', label: 'Cửa hàng', value: 'Số 88, phường Xuân Phương', detail: 'Địa chỉ cửa hàng AETHER', href: null },
  { icon: '◷', label: 'Giờ mở cửa', value: 'Thứ 2 – Chủ nhật', detail: '9:00 – 22:00', href: null },
];

export default function ContactPage() {
  return <main className="contact-page">
    <section className="contact-hero">
      <span className="eyebrow">AETHER / WE ARE HERE FOR YOU</span>
      <h1>Liên hệ với Aether</h1>
      <p>Cần tư vấn về sản phẩm, đơn hàng hoặc dịch vụ? Đội ngũ AETHER luôn sẵn sàng hỗ trợ bạn.</p>
    </section>
    <section className="container contact-content">
      <div className="contact-section-heading"><span className="eyebrow">GET IN TOUCH</span><h2>Thông tin liên hệ</h2></div>
      <div className="contact-card-grid">{contactItems.map((item) => <article className="contact-card" key={item.label}>
        <span className="contact-card-icon" aria-hidden="true">{item.icon}</span>
        <h3>{item.label}</h3>
        {item.href ? <a className="contact-card-value" href={item.href}>{item.value}</a> : <p className="contact-card-value">{item.value}</p>}
        <p className="contact-card-detail">{item.detail}</p>
      </article>)}</div>
      <section className="contact-socials" aria-labelledby="contact-social-heading">
        <div><span className="eyebrow">FOLLOW AETHER</span><h2 id="contact-social-heading">Mạng xã hội</h2><p>Theo dõi AETHER để cập nhật bộ sưu tập và tin tức mới.</p></div>
        <ul><li>Facebook</li><li>Instagram</li><li>TikTok</li><li>Zalo</li></ul>
      </section>
      <div className="contact-cta"><p>Khám phá các thiết kế AETHER mới nhất</p><Link className="button dark" href="/products">MUA SẮM NGAY <span aria-hidden="true">↗</span></Link></div>
    </section>
  </main>;
}
