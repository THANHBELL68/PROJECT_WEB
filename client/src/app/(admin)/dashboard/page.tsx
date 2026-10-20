'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import { PageTitle } from '@/components/PageTitle';

type Row = Record<string, unknown>;

export default function DashboardPage() {
  const { token, hasPermission } = useAuth();
  const canOrders = hasPermission('ORDER_HISTORY_ALL_VIEW');
  const canStock = hasPermission('WAREHOUSE_REPORT_VIEW');
  const canCatalog = hasPermission('PRODUCT_MANAGE');
  const [orders, setOrders] = useState<Row[]>([]);
  const [stock, setStock] = useState<Row[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    const requests: Promise<unknown>[] = [];
    if (canOrders) requests.push(adminService.orders(token).then(response => setOrders(response.data as Row[])));
    if (canStock) requests.push(adminService.inventory(token).then(response => setStock(response.data as Row[])));
    Promise.allSettled(requests).then(results => {
      const failed = results.find(result => result.status === 'rejected');
      if (failed?.status === 'rejected') setError(failed.reason instanceof Error ? failed.reason.message : 'Không tải được dữ liệu tổng quan.');
    });
  }, [token, canOrders, canStock]);

  const pending = orders.filter(order => ['new', 'processing'].includes(String(order.status))).length;
  return <main className="admin-content">
    <PageTitle eyebrow="Tổng quan" title="Xin chào, quản trị viên" description="Tình hình đơn hàng và tồn kho mới nhất từ hệ thống." />
    {error && <div className="notice error-notice" role="alert">{error}</div>}
    <div className="metric-grid">
      {canOrders && <><article className="metric-card"><span>Đơn hàng gần đây</span><strong>{orders.length}</strong><small>Dữ liệu từ API quản trị</small></article><article className="metric-card"><span>Cần xử lý</span><strong>{pending}</strong><small>Đơn mới hoặc đang xử lý</small></article></>}
      {canStock && <article className="metric-card"><span>Dòng tồn kho</span><strong>{stock.length}</strong><small>Biến thể đang được theo dõi</small></article>}
    </div>
    <div className="admin-quicklinks">
      {canOrders && <Link href="/orders">Quản lý đơn hàng <span>→</span></Link>}
      {canStock && <Link href="/stock">Báo cáo tồn kho <span>→</span></Link>}
      {canCatalog && <Link href="/catalog">Danh mục sản phẩm <span>→</span></Link>}
    </div>
    {canOrders && <section className="admin-panel"><div className="section-heading"><div><span className="eyebrow">Đơn mới</span><h2>Đơn hàng gần đây</h2></div><Link className="under-link" href="/orders">Xem tất cả →</Link></div><div className="table-wrap"><table><thead><tr><th>Mã đơn</th><th>Trạng thái</th><th>Số sản phẩm</th><th>Ngày tạo</th></tr></thead><tbody>
      {orders.slice(0, 6).map((order, index) => <tr key={String(order.id ?? index)}><td><Link href={`/orders/${order.id}`}><strong>{String(order.order_code || order.id)}</strong></Link></td><td><span className="status-pill">{String(order.status)}</span></td><td>{String(order.item_count ?? '—')}</td><td>{order.created_at ? new Date(String(order.created_at)).toLocaleDateString('vi-VN') : '—'}</td></tr>)}
    </tbody></table>{orders.length === 0 && <p className="muted table-empty">Chưa có dữ liệu đơn hàng.</p>}</div></section>}
  </main>;
}
