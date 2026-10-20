'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/types/api';
import { useCart } from '@/context/CartContext';

export function ProductGrid({ products }: { products: Product[] }) {
  const { add } = useCart();
  const [message, setMessage] = useState('');
  const handleAdd = async (product: Product) => {
    const variant = product.product_variants?.find((item) => item.is_active !== false);
    if (!variant) { setMessage('Sản phẩm chưa có biến thể để đặt mua.'); return; }
    try { await add(variant.id); setMessage(`Đã thêm ${product.name} vào giỏ.`); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Không thêm được sản phẩm.'); }
  };
  return <>
    {message && <div className="notice success-notice" role="status">{message}<button className="text-button" onClick={() => setMessage('')}>Đóng</button></div>}
    <div className="product-grid">{products.map((product, index) => { const image = product.product_images?.find((item) => item.is_primary) ?? product.product_images?.[0]; return <article className={`product-card product-card-${index % 4}`} key={product.id}>
      <Link href={`/products/${product.id}`} className={`product-art ${image ? 'has-photo' : ''}`}>{image && <img className="product-photo" src={image.url} alt={image.alt_text || product.name} />}<span className="art-code">{product.categories?.name ?? 'AETHER / ESSENTIALS'}</span></Link>
      <button type="button" className="quick-add" aria-label={`Thêm ${product.name} vào giỏ`} onClick={() => void handleAdd(product)}>+</button>
      <div className="product-info"><div><h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3><p>{product.categories?.name ?? 'Bộ sưu tập thường ngày'}</p></div><span className="product-price">{Number(product.base_price).toLocaleString('vi-VN')}₫</span></div>
    </article>;})}</div>
  </>;
}
