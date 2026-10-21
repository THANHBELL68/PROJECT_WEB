'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

function BagIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></svg>; }
function UserIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/></svg>; }

export function Header() {
  const path = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [activeCategory, setActiveCategory] = useState('');
  useEffect(() => { setActiveCategory(new URLSearchParams(window.location.search).get('category') ?? ''); }, [path]);
  const categoryLinkClass = (category: string) => `nav-link ${path === '/products' && activeCategory === category ? 'active' : ''}`;
  return <>
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="AETHER trang chủ">AETHER<span>®</span></Link>
      <nav className="main-nav" aria-label="Điều hướng chính">
        <Link className={categoryLinkClass('thoi-trang-nam')} href="/products?category=thoi-trang-nam" onClick={() => setActiveCategory('thoi-trang-nam')}>Nam</Link>
        <Link className={categoryLinkClass('thoi-trang-nu')} href="/products?category=thoi-trang-nu" onClick={() => setActiveCategory('thoi-trang-nu')}>Nữ</Link>
        <Link className={`nav-link nav-sale ${path === '/promotions' ? 'active' : ''}`} href="/promotions">Khuyến mãi</Link>
        <Link className={`nav-link ${path === '/contact' ? 'active' : ''}`} href="/contact">Liên hệ</Link>
      </nav>
      <div className="header-actions">
        <Link className="header-icon icon-link" href="/cart" aria-label={`Giỏ hàng${count ? `, ${count} sản phẩm` : ', trống'}`}><BagIcon />{count > 0 && <span className="cart-count">{count}</span>}</Link>
        {user ? <div className="account-menu"><Link className="header-icon icon-link" href="/profile" aria-label="Trang cá nhân"><UserIcon /><span>{user.fullName?.split(' ')[0] || 'Tài khoản'}</span></Link><button className="text-button" onClick={() => { logout(); router.push('/'); }}>Thoát</button></div> : <Link className="header-icon icon-link" href="/login" aria-label="Đăng nhập, trang cá nhân"><UserIcon /><span>Đăng nhập</span></Link>}
      </div>
    </header>
  </>;
}
