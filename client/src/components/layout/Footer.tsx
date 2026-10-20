import Link from 'next/link';

export function Footer() {
  return <footer className="site-footer">
    <div className="footer-top"><Link className="wordmark" href="/">AETHER<span>®</span></Link><p>Những món đồ tốt, cho mỗi ngày.</p><Link href="/products">Khám phá bộ sưu tập <span>↗</span></Link></div>
    <div className="footer-bottom"><span>© 2026 AETHER LABS</span><span>Được tạo cho cuộc sống thường ngày</span><Link href="/profile">Hỗ trợ khách hàng</Link></div>
  </footer>;
}
