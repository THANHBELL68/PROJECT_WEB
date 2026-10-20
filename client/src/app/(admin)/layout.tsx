'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, hasPermission, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => { if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`); }, [loading, user, router, pathname]);
  const allowed = ['REPORT_ALL_VIEW', 'ORDER_HISTORY_ALL_VIEW', 'WAREHOUSE_REPORT_VIEW', 'STOCK_IO_MANAGE', 'PRODUCT_MANAGE', 'ACCOUNT_ROLE_MANAGER', 'SYSTEM_CONFIG'].some(hasPermission);
  if (loading || !user) return <div className="full-state"><span className="spinner" />Đang xác thực tài khoản…</div>;
  if (!allowed) return <div className="full-state"><div className="state-icon">403</div><h1>Không có quyền truy cập</h1><p>Tài khoản này không có quyền sử dụng khu vực vận hành.</p><Link className="button dark" href="/">Về cửa hàng</Link></div>;
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <div><span className="eyebrow">AETHER OPERATIONS</span><span className="admin-top-title"> / Workspace</span></div>
          <div className="admin-top-actions">
            <span className="status-dot" />Hệ thống hoạt động
            <Link href="/">Xem cửa hàng ↗</Link>
            <button className="text-button" onClick={() => { logout(); router.push('/login'); }}>Đăng xuất</button>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
