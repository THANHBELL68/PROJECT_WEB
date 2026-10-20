'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminService } from '@/services/adminService';
import { PageTitle } from '@/components/PageTitle';

type Item = { id: string | number; name: string; slug?: string; base_price?: string | number; is_visible?: boolean; deleted_at?: string | null };

export default function CatalogPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState(''); const [price, setPrice] = useState(''); const [categoryId, setCategoryId] = useState(''); const [sku, setSku] = useState('');
  const [editId, setEditId] = useState(''); const [editName, setEditName] = useState(''); const [editCategory, setEditCategory] = useState(''); const [visible, setVisible] = useState(true);
  const [variantId, setVariantId] = useState(''); const [variantPrice, setVariantPrice] = useState(''); const [variantActive, setVariantActive] = useState(true);
  const [error, setError] = useState(''); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { if (!token) return; try { const response = await adminService.products(token); setItems(response.data as Item[]); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được danh mục.'); } }, [token]);
  useEffect(() => { void load(); }, [load]);
  async function save(action: () => Promise<unknown>, success: string) { setBusy(true); setError(''); setMessage(''); try { await action(); setMessage(success); await load(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Thao tác thất bại.'); } finally { setBusy(false); } }
  async function create(event: FormEvent) { event.preventDefault(); if (!token) return; await save(() => adminService.createProduct(token, { name, basePrice: Number(price), categoryId: Number(categoryId), variants: [{ sku, price: Number(price) }] }), 'Đã tạo sản phẩm và biến thể đầu tiên.'); setName(''); setPrice(''); setCategoryId(''); setSku(''); }
  async function update(event: FormEvent) { event.preventDefault(); if (!token || !editId) return; await save(() => adminService.updateProduct(token, editId, { name: editName, categoryId: Number(editCategory), isVisible: visible }), 'Đã cập nhật sản phẩm.'); }
  async function updateVariant(event: FormEvent) { event.preventDefault(); if (!token || !variantId) return; await save(() => adminService.updateVariant(token, variantId, { price: Number(variantPrice), isActive: variantActive }), 'Đã cập nhật biến thể.'); setVariantId(''); setVariantPrice(''); }
  async function hide(id: string | number) { if (!token) return; await save(() => adminService.hideProduct(token, String(id)), 'Đã ẩn sản phẩm khỏi cửa hàng.'); }

  return <main className="admin-content">
    <PageTitle eyebrow="Danh mục" title="Sản phẩm" description="Quản lý sản phẩm, cập nhật biến thể và thực hiện xóa mềm." />
    {error && <div className="notice error-notice" role="alert">{error}</div>}{message && <div className="notice success-notice" role="status">{message}</div>}
    <form className="admin-panel catalog-create" onSubmit={create}><h2>Thêm sản phẩm</h2><div className="form-grid">
      <label>Tên sản phẩm<input required value={name} onChange={event => setName(event.target.value)} /></label><label>Giá cơ bản<input required type="number" min="0" value={price} onChange={event => setPrice(event.target.value)} /></label>
      <label>ID danh mục<input required type="number" min="1" value={categoryId} onChange={event => setCategoryId(event.target.value)} placeholder="ID danh mục có trong DB" /></label><label>SKU biến thể đầu tiên<input required value={sku} onChange={event => setSku(event.target.value)} placeholder="Ví dụ: TEE-BLK-M" /></label>
    </div><p className="summary-hint">Sản phẩm mới được tạo kèm một biến thể đầu tiên. Các biến thể tiếp theo có thể cập nhật bằng ID biến thể bên dưới.</p><button className="button dark" disabled={busy}>{busy ? 'Đang lưu…' : 'Tạo sản phẩm'}</button></form>
    <div className="catalog-tools"><form className="admin-panel" onSubmit={update}><h2>Cập nhật sản phẩm</h2><div className="form-grid">
      <label>ID sản phẩm<input required inputMode="numeric" value={editId} onChange={event => setEditId(event.target.value)} /></label><label>Tên mới<input required value={editName} onChange={event => setEditName(event.target.value)} /></label><label>ID danh mục mới<input required type="number" min="1" value={editCategory} onChange={event => setEditCategory(event.target.value)} /></label><label>Hiển thị<select value={String(visible)} onChange={event => setVisible(event.target.value === 'true')}><option value="true">Đang bán</option><option value="false">Ẩn khỏi cửa hàng</option></select></label>
    </div><button className="button outline" disabled={busy || !editId}>Cập nhật thông tin</button></form>
    <form className="admin-panel" onSubmit={updateVariant}><h2>Cập nhật biến thể</h2><div className="form-grid">
      <label>ID biến thể<input required inputMode="numeric" value={variantId} onChange={event => setVariantId(event.target.value)} /></label><label>Giá mới<input required type="number" min="0" value={variantPrice} onChange={event => setVariantPrice(event.target.value)} /></label><label>Trạng thái<select value={String(variantActive)} onChange={event => setVariantActive(event.target.value === 'true')}><option value="true">Đang hoạt động</option><option value="false">Ngừng bán</option></select></label>
    </div><button className="button outline" disabled={busy || !variantId}>Cập nhật biến thể</button></form></div>
    <section className="admin-panel"><div className="table-wrap"><table><thead><tr><th>ID</th><th>Tên</th><th>Slug</th><th>Giá</th><th>Trạng thái</th><th></th></tr></thead><tbody>
      {items.map(item => <tr key={String(item.id)}><td>{item.id}</td><td><strong>{item.name}</strong></td><td>{item.slug || '—'}</td><td>{Number(item.base_price || 0).toLocaleString('vi-VN')} ₫</td><td>{item.is_visible === false ? 'Đã ẩn' : 'Đang bán'}</td><td>{item.is_visible !== false && <button type="button" className="text-button danger-text" onClick={() => void hide(item.id)}>Ẩn sản phẩm</button>}</td></tr>)}
    </tbody></table>{!items.length && <p className="muted table-empty">Chưa có sản phẩm.</p>}</div></section>
  </main>;
}
