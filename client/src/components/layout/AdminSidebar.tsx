'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const links = [
  { href: '/dashboard', label: 'Tổng quan', icon: '◫', permission: 'REPORT_ALL_VIEW' },
  { href: '/orders', label: 'Đơn hàng', icon: '▤', permission: 'ORDER_HISTORY_ALL_VIEW' },
  { href: '/stock', label: 'Tồn kho', icon: '▦', permission: 'WAREHOUSE_REPORT_VIEW' },
  { href: '/stock/documents', label: 'Phiếu kho', icon: '⇄', permission: 'STOCK_IO_MANAGE' },
  { href: '/catalog', label: 'Sản phẩm', icon: '◇', permission: 'PRODUCT_MANAGE' },
  { href: '/settings', label: 'Cài đặt', icon: '⚙', permission: 'ACCOUNT_ROLE_MANAGER' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, hasPermission } = useAuth();
  return <aside className="admin-sidebar">
    <Link className="admin-brand" href="/dashboard"><span className="brand-mark">A</span><span>AETHER<span className="admin-caption">OPERATIONS</span></span></Link>
    <div className="sidebar-label">WORKSPACE</div>
    <nav>{links.filter((item) => hasPermission(item.permission) || (item.href === '/settings' && hasPermission('SYSTEM_CONFIG'))).map((item) => <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) ? 'active' : ''}`}><span>{item.icon}</span>{item.label}</Link>)}</nav>
    <div className="sidebar-bottom"><div className="staff-avatar">{user?.fullName?.slice(0, 1) || 'A'}</div><div><strong>{user?.fullName || 'Nhân viên'}</strong><small>{user?.roles?.[0]?.name || 'Đang đăng nhập'}</small></div></div>
  </aside>;
}
