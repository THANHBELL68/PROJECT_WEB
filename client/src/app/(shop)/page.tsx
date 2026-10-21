import Link from 'next/link';
import { FeaturedProducts } from '@/components/FeaturedProducts';

export default function HomePage() {
  return <>
    <section className="hero hero-video">
      <video className="hero-video-media" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
        <source src="/aether-hero.mp4" type="video/mp4" />
      </video>
      <div className="hero-video-overlay" aria-hidden="true" />
      <div className="hero-copy hero-video-copy"><span className="eyebrow">AETHER / DAILY UNIFORM 2026</span><h1>Đẹp đơn giản<br />Mặc mỗi ngày</h1><p>Thiết kế tinh giản, chất liệu dễ chịu và phom dáng dành cho mọi khoảnh khắc thường nhật.</p><Link href="/products" className="button dark">Khám phá bộ sưu tập <span className="arrow">↗</span></Link></div>
      <div className="hero-index">AETHER — 2026</div>
    </section>
    <section className="section container"><div className="section-heading"><div><span className="eyebrow">THE AETHER COLLECTION</span><h2 className="category-heading">Mặc theo cách của bạn</h2></div><Link className="under-link" href="/products">Xem tất cả <span>↗</span></Link></div><div className="category-grid"><article className="category-card category-men"><img className="category-photo" src="/aether-men.jpg" alt="Người mẫu nam mặc vest xám và khăn xanh" /><span className="eyebrow">01 / EVERYDAY ESSENTIALS</span><h3>Nam</h3><Link href="/products?category=thoi-trang-nam">Khám phá thời trang nam ↗</Link></article><article className="category-card category-women"><img className="category-photo" src="/aether-women.jpg" alt="Người mẫu nữ trong khung cảnh dã ngoại" /><span className="eyebrow">02 / MODERN CLASSICS</span><h3>Nữ</h3><Link href="/products?category=thoi-trang-nu">Khám phá thời trang nữ ↗</Link></article></div></section>
    <Link href="/promotions" className="promotion-banner" aria-label="Ưu đãi đặc biệt">
      <img src="/aether-sale-banner.jpg" alt="Túi mua sắm và các thẻ giảm giá màu đỏ" />
      <h2>ƯU ĐÃI CỰC LỚN</h2></Link>
    <section className="section container" style={{ paddingTop: 0 }}><div className="section-heading"><div><span className="eyebrow">LOVED BY YOU</span><h2>Được yêu thích</h2><p>Những thiết kế trở thành lựa chọn quen thuộc mỗi ngày.</p></div><Link className="under-link" href="/products">Tất cả sản phẩm <span>↗</span></Link></div><FeaturedProducts /></section>
    <section className="values-strip"><div><span>01</span><strong>Thiết kế tinh giản</strong><p>Đẹp vừa đủ, dễ phối mỗi ngày.</p></div><div><span>02</span><strong>Chất lượng bền lâu</strong><p>Chọn lọc chất liệu và hoàn thiện kỹ lưỡng.</p></div><div><span>03</span><strong>Đồng hành tận tâm</strong><p>AETHER luôn sẵn sàng hỗ trợ bạn.</p></div></section>
  </>;
}
