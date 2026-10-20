'use client';

import Link from 'next/link';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import { PageTitle } from '@/components/PageTitle';

type Doc = { id: string; code: string; type: string; created_at: string; line_count: number; item_quantity: number; note?: string };

export default function StockDocumentsPage() {
  const { token, hasPermission } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [type, setType] = useState('import');
  const [variantId, setVariantId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [orderId, setOrderId] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!token) return;
    try { const response = await adminService.stockDocuments(token); setDocs(response.data as Doc[]); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được phiếu kho.'); }
  }, [token]);
  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const payload = { type, note: note || null, ...(type === 'export' && orderId ? { orderId } : {}), items: [{ variantId, quantity: Number(quantity) }] };
      const response = await adminService.createStockDocument(token, payload) as { data?: { code?: string } };
      setMessage(`Đã tạo phiếu ${response.data?.code || ''}`);
      setVariantId(''); setQuantity('1'); setOrderId(''); setNote(''); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Tạo phiếu thất bại.'); }
    finally { setBusy(false); }
  }

  return <main className="admin-content">
    <Link className="back-link" href="/stock">← Báo cáo tồn kho</Link>
    <PageTitle eyebrow="Kho vận" title="Phiếu nhập / xuất" description="Lập chứng từ kho và xem lịch sử điều chuyển." />
    {error && <div className="notice error-notice" role="alert">{error}</div>}
    {message && <div className="notice success-notice" role="status">{message}</div>}
    {hasPermission('STOCK_IO_MANAGE') && <form className="admin-panel stock-form" onSubmit={submit}>
      <h2>Tạo phiếu mới</h2>
      <div className="form-grid">
        <label>Loại phiếu<select value={type} onChange={event => setType(event.target.value)}><option value="import">Nhập kho</option><option value="export">Xuất kho</option></select></label>
        <label>Mã biến thể (variantId)<input required inputMode="numeric" value={variantId} onChange={event => setVariantId(event.target.value)} placeholder="Ví dụ: 12" /></label>
        <label>Số lượng<input required type="number" min="1" step="1" value={quantity} onChange={event => setQuantity(event.target.value)} /></label>
        {type === 'export' && <label>Mã đơn hàng (orderId)<input inputMode="numeric" value={orderId} onChange={event => setOrderId(event.target.value)} placeholder="Nhập để gắn phiếu với đơn" /></label>}
        <label className="span-two">Ghi chú<input value={note} onChange={event => setNote(event.target.value)} placeholder="Lý do / thông tin phiếu" /></label>
      </div>
      <p className="summary-hint">Form hiện tạo một dòng hàng mỗi phiếu. Để chuyển đơn sang “Đang giao”, phiếu xuất cần gắn đúng orderId và đủ từng biến thể với số lượng của đơn.</p>
      <button className="button dark" disabled={busy || !variantId}>{busy ? 'Đang lưu…' : 'Tạo phiếu'}</button>
    </form>}
    <section className="admin-panel"><div className="table-wrap"><table><thead><tr><th>Mã phiếu</th><th>Loại</th><th>Số dòng</th><th>Tổng số lượng</th><th>Ngày tạo</th><th>Ghi chú</th></tr></thead><tbody>
      {docs.map(document => <tr key={document.id}><td><strong>{document.code}</strong></td><td>{document.type === 'import' ? 'Nhập kho' : 'Xuất kho'}</td><td>{document.line_count}</td><td>{document.item_quantity}</td><td>{new Date(document.created_at).toLocaleString('vi-VN')}</td><td>{document.note || '—'}</td></tr>)}
    </tbody></table>{!docs.length && <p className="muted table-empty">Chưa có phiếu kho.</p>}</div></section>
  </main>;
}
