'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export function Header() {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const linkClass = (href: string) => `nav-link ${path.startsWith(href) ? 'active' : ''}`;
  return <>
    <div className="announcement">THIẾT YẾU MỖI NGÀY · MIỄN PHÍ GIAO HÀNG TỪ 899K</div>
    <header className="site-header">
      <Link className="wordmark" href="/">AETHER<span>®</span></Link>
      <nav className="main-nav" aria-label="Điều hướng chính">
        <Link className={linkClass('/products')} href="/products">Sản phẩm</Link>
        <Link className={linkClass('/products?category=ao-thun')} href="/products?category=ao-thun">Áo thun</Link>
        <Link className={linkClass('/products?category=quan-jean')} href="/products?category=quan-jean">Quần jean</Link>
      </nav>
      <div className="header-actions">
        <Link className="header-icon" href="/cart" aria-label={`Giỏ hàng, ${count} sản phẩm`}>Giỏ <span className="cart-count">{count}</span></Link>
        {user ? <div className="account-menu"><Link href="/profile">{user.fullName?.split(' ')[0] || 'Tài khoản'}</Link><button className="text-button" onClick={() => { logout(); router.push('/'); }}>Thoát</button></div> : <Link className="header-icon" href="/login">Đăng nhập</Link>}
      </div>
    </header>
  </>;
}
