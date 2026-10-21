import Link from 'next/link';

const offers = [
  { icon: '⚡', title: 'Trạm Giảm Sâu', label: 'Sale đến 50%', text: 'Áp dụng cho các sản phẩm Best-Seller và bộ sưu tập mùa trước. Số lượng size có hạn!' },
  { icon: '👯', title: 'Trạm Combo', label: 'Càng mua càng rẻ', text: 'Mua 2 sản phẩm bất kỳ giảm thêm 10%; mua 3 sản phẩm bất kỳ giảm thêm 15% tổng hóa đơn.' },
  { icon: '🚚', title: 'Trạm Freeship', label: 'Từ 500.000đ', text: 'Miễn phí vận chuyển toàn quốc cho mọi đơn hàng từ 500.000đ.' },
  { icon: '🎂', title: 'Đặc quyền Member', label: 'Thêm 10%', text: 'Nhận ưu đãi thêm 10% vào tháng sinh nhật. Áp dụng kèm các chương trình sale khác.' },
];

export default function PromotionsPage() {
  return <main className="promotion-page">
    <section className="promotion-page-hero">
      <img src="/aether-sale-banner.jpg" alt="Túi mua sắm và các thẻ giảm giá" />
      <div className="promotion-page-shade" />
      <div className="promotion-page-hero-copy">
        <span className="eyebrow">🌟 CHƯƠNG TRÌNH ƯU ĐÃI ĐANG DIỄN RA</span>
        <h1>💥 HOT: TRẠM KHÔNG GIAN ƯU ĐÃI – CHẠM LÀ MUA NGAY!</h1>
        <p><strong>AETHER</strong> gửi tặng bạn bữa tiệc ưu đãi lớn nhất mùa này. F5 tủ đồ với những thiết kế cực chất, chất liệu cao cấp cùng mức giá không thể hời hơn. <strong>Giảm ngay đến 50% toàn bộ sản phẩm</strong> từ hôm nay!</p>
        <Link href="/products" className="button dark">MUA SẮM NGAY <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
    <section className="section container promotion-offers">
      <div className="section-heading"><div><span className="eyebrow">AETHER SPECIAL</span><h2>🎁 TỔNG HỢP CÁC TRẠM ƯU ĐÃI KHÔNG THỂ BỎ LỠ</h2></div></div>
      <div className="promotion-offer-grid">{offers.map((offer) => <article className="promotion-offer-card" key={offer.title}><span className="promotion-offer-icon" aria-hidden="true">{offer.icon}</span><span className="promotion-offer-label">{offer.label}</span><h3>{offer.title}</h3><p>{offer.text}</p></article>)}</div>
    </section>
    <section className="promotion-conditions"><div className="container promotion-conditions-inner">
      <div><span className="eyebrow">THÔNG TIN CHƯƠNG TRÌNH</span><h2>⏳ ĐIỀU KIỆN &amp; THỜI GIAN ÁP DỤNG</h2></div>
      <ul><li><strong>Thời gian:</strong> Đang cập nhật.</li><li><strong>Đối tượng:</strong> Toàn bộ khách hàng mua sắm Online tại website AETHER.</li><li><strong>Lưu ý:</strong> Không áp dụng đồng thời với các mã giảm giá (Voucher) khác ngoài chương trình combo.</li><li>Sản phẩm sale sâu trên 40% không hỗ trợ đổi trả, trừ trường hợp lỗi từ nhà sản xuất.</li></ul>
    </div></section>
    <section className="section container promotion-service"><div className="section-heading"><div><span className="eyebrow">AETHER CARE</span><h2>🛡️ ĐỒNG HÀNH CÙNG CHẤT LƯỢNG AETHER</h2></div></div>
      <div className="promotion-service-grid"><article><h3>Giao hàng hỏa tốc</h3><p>Ship nội thành trong 2H, ship tỉnh từ 2–4 ngày.</p></article><article><h3>Kiểm tra hàng trước</h3><p>Khách hàng được quyền kiểm tra hàng trước khi thanh toán.</p></article><article><h3>Đổi size linh hoạt</h3><p>Hỗ trợ đổi size trong vòng 7 ngày kể từ khi nhận hàng.</p></article></div>
    </section>
    <section className="promotion-last-call"><span className="eyebrow">AETHER / DAILY WEAR</span><h2>🔥 ĐỪNG BỎ LỠ MÓN ĐỒ YÊU THÍCH CỦA BẠN!</h2><p>Hàng nghìn khách hàng đã sở hữu diện mạo mới cùng <strong>AETHER</strong>. Chọn ngay những bộ cánh thời thượng nhất trước khi hết size!</p><Link href="/products" className="button dark">SĂN KHUYẾN MÃI NGAY <span aria-hidden="true">↗</span></Link></section>
  </main>;
}
