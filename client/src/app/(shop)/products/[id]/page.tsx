'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import type { Product } from '@/types/api';
import { useCart } from '@/context/CartContext';
import { PageTitle } from '@/components/PageTitle';
import { formatProductName } from '@/utils/productName';

function isVideo(url: string) {
  return /\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(url);
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { add } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [variant, setVariant] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    productService.get(params.id)
      .then((result) => {
        if (!alive) return;
        setProduct(result.data);
        const first = result.data.product_variants?.find((item) => item.is_active !== false);
        if (first) setVariant(String(first.id));
      })
      .catch((reason) => alive && setError(reason instanceof Error ? reason.message : 'Không tải được sản phẩm.'));
    return () => { alive = false; };
  }, [params.id]);

  async function addToCart(buy = false) {
    if (!variant) { setError('Sản phẩm chưa có biến thể khả dụng.'); return; }
    setBusy(true);
    setError('');
    try { await add(variant); if (buy) router.push('/cart'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thêm được sản phẩm vào giỏ.'); }
    finally { setBusy(false); }
  }

  if (error && !product) return <main className="container section"><PageTitle title="Không tải được sản phẩm" description={error} /><Link className="button outline" href="/products">Quay lại danh sách</Link></main>;
  if (!product) return <main className="container section"><p className="loading-copy">Đang tải sản phẩm…</p></main>;

  const variants = product.product_variants?.filter((item) => item.is_active !== false) ?? [];
  const displayName = formatProductName(product.name);
  const selected = variants.find((item) => String(item.id) === variant);
  const media = product.product_images ?? [];
  const images = media.filter((item) => !isVideo(item.url)).sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const videos = media.filter((item) => isVideo(item.url));
  const gallery = [...images, ...videos];
  const sizeOptions = [...new Map(variants.flatMap((item) => item.sizes ? [[item.sizes.id, item.sizes] as const] : [])).values()];
  const colorOptions = [...new Map(variants.flatMap((item) => item.colors ? [[item.colors.id, item.colors] as const] : [])).values()];

  function chooseSize(sizeId: number) {
    const match = variants.find((item) => item.sizes?.id === sizeId && (!selected?.colors || item.colors?.id === selected.colors.id))
      ?? variants.find((item) => item.sizes?.id === sizeId);
    if (match) setVariant(String(match.id));
  }

  function chooseColor(colorId: number) {
    const match = variants.find((item) => item.colors?.id === colorId && (!selected?.sizes || item.sizes?.id === selected.sizes.id))
      ?? variants.find((item) => item.colors?.id === colorId);
    if (match) setVariant(String(match.id));
  }

  function colorLabel(name: string) {
    return ({ Den: 'Đen', Trang: 'Trắng', Xanh: 'Xanh' } as Record<string, string>)[name] ?? name;
  }

  return <main className="container section">
    <div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><Link href="/products">Sản phẩm</Link><span>/</span>{displayName}</div>
    <div className="detail-layout">
      <div className="detail-gallery">
        {gallery.length ? gallery.map((item, index) => <div className={`detail-gallery-item ${isVideo(item.url) ? 'is-video' : ''}`} key={`${item.url}-${index}`}>
          {isVideo(item.url)
            ? <video controls preload="metadata" aria-label={item.alt_text || product.name}><source src={item.url} type="video/mp4" /></video>
            : <img src={item.url} alt={item.alt_text || displayName} />}
        </div>) : <div className="detail-art"><span className="detail-art-mark">A</span></div>}
      </div>
      <section className="detail-copy">
        <span className="eyebrow">{product.categories?.name ?? 'Bộ sưu tập thường ngày'}</span>
        <h1 className={['nam-ao-khoac-gia-long-cuu-can-gio-keo-khoa', 'nu-ao-kieu-rayon-co-mo-tay-lung-3-4'].includes(product.slug) ? 'product-title-spaced' : undefined}>{displayName}</h1>
        <strong className="detail-price">{Number(selected?.price ?? product.base_price).toLocaleString('vi-VN')} ₫</strong>
        <p className="detail-description">{product.description || 'Thiết kế tối giản cho nhịp sống hàng ngày, tập trung vào chất liệu và cảm giác thoải mái.'}</p>
        {sizeOptions.length > 0 && <div className="detail-field"><span className="field-label">Chọn kích cỡ</span><div className="variant-options">{sizeOptions.map((size) => <button type="button" key={size.id} className={`variant-option ${selected?.sizes?.id === size.id ? 'selected' : ''}`} onClick={() => chooseSize(size.id)}>{size.name}</button>)}</div></div>}
        {colorOptions.length > 0 && <div className="detail-field"><span className="field-label">Chọn màu sắc{selected?.colors ? `: ${colorLabel(selected.colors.name)}` : ''}</span><div className="variant-options color-options">{colorOptions.map((color) => <button type="button" key={color.id} className={`variant-option color-option ${selected?.colors?.id === color.id ? 'selected' : ''}`} onClick={() => chooseColor(color.id)} aria-label={colorLabel(color.name)}><span className="color-swatch" style={{ backgroundColor: color.hex_code || '#ddd' }} />{colorLabel(color.name)}</button>)}</div></div>}
        {!sizeOptions.length && !colorOptions.length && !variants.length && <div className="detail-field"><span className="field-label">Biến thể</span><span className="muted">Chưa có biến thể đang bán.</span></div>}
        <div className="stock-note">Tình trạng tồn kho sẽ được xác nhận khi thêm vào giỏ.</div>
        {error && <div role="alert" className="notice error-notice">{error}</div>}
        <div className="detail-actions"><button className="button dark" disabled={busy || !variants.length} onClick={() => void addToCart()}>Thêm vào giỏ <span className="arrow">+</span></button><button className="button outline" disabled={busy || !variants.length} onClick={() => void addToCart(true)}>Mua ngay</button></div>
        <p className="detail-footnote">Giao hàng và thanh toán được xác nhận ở bước đặt đơn.</p>
      </section>
    </div>
  </main>;
}
