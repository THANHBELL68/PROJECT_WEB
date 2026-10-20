import Link from 'next/link';
import { FeaturedProducts } from '@/components/FeaturedProducts';

export default function HomePage() {
  return <>
    <section className="hero"><div className="hero-copy"><span className="eyebrow">AETHER / DAILY UNIFORM 2026</span><h1>Đơn giản<br />để sống.</h1><p>Những món đồ thiết yếu, dễ mặc và được tạo ra để đồng hành cùng nhịp sống của bạn.</p><Link href="/products" className="button dark">Khám phá bộ sưu tập <span className="arrow">↗</span></Link></div><div className="hero-art" aria-hidden="true"><div className="hero-shape" /></div></section>
    <section className="section container"><div className="section-heading"><div><span className="eyebrow">CURATED FOR YOU</span><h2>Chọn theo nhu cầu</h2></div><Link className="under-link" href="/products">Xem tất cả <span>↗</span></Link></div><div className="category-grid"><article className="category-card"><span className="eyebrow">01 / EVERYDAY</span><h3>Áo thun</h3><Link href="/products?category=ao-thun">Khám phá dòng áo thun ↗</Link></article><article className="category-card"><span className="eyebrow">02 / DENIM</span><h3>Quần jean</h3><Link href="/products?category=quan-jean">Khám phá dòng denim ↗</Link></article></div></section>
    <section className="section container" style={{ paddingTop: 0 }}><div className="section-heading"><div><span className="eyebrow">MADE FOR REPEAT</span><h2>Được yêu thích</h2><p>Phom dáng tốt, chất liệu dễ chịu, dùng được mỗi ngày.</p></div><Link className="under-link" href="/products">Tất cả sản phẩm <span>↗</span></Link></div><FeaturedProducts /></section>
    <section className="values-strip"><div><span>01</span><strong>Thiết kế có chủ đích</strong><p>Đẹp vừa đủ, tiện dụng tối đa.</p></div><div><span>02</span><strong>Chất lượng để dùng lâu</strong><p>Chất liệu tốt, phom dáng bền.</p></div><div><span>03</span><strong>Dịch vụ tận tâm</strong><p>Luôn ở đây để hỗ trợ bạn.</p></div></section>
  </>;
}
