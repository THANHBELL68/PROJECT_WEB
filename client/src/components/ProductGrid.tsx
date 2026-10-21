'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/types/api';
import { useCart } from '@/context/CartContext';
import { formatProductName } from '@/utils/productName';

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
    <div className="product-grid">{products.map((product, index) => { const displayName = formatProductName(product.name); const images = product.product_images?.filter((item) => !/\.(mp4|webm|ogg)(?:[?#].*)?$/i.test(item.url)) ?? []; const image = images.find((item) => item.is_primary) ?? images[0]; const hasVariants = product.product_variants?.some((item) => item.is_active !== false) ?? false; return <article className={`product-card product-card-${index % 4}`} key={product.id}>
      <Link href={`/products/${product.id}`} className={`product-art ${image ? 'has-photo' : ''}`}>{image && <img className="product-photo" src={image.url} alt={image.alt_text || displayName} />}<span className="art-code">{product.categories?.name ?? 'AETHER / ESSENTIALS'}</span></Link>
      {hasVariants && <button type="button" className="quick-add" aria-label={`Thêm ${displayName} vào giỏ`} onClick={() => void handleAdd(product)}>+</button>}
      <div className="product-info"><div><h3><Link href={`/products/${product.id}`}>{displayName}</Link></h3><p>{product.categories?.name ?? 'Bộ sưu tập thường ngày'}</p></div><span className="product-price">{Number(product.base_price).toLocaleString('vi-VN')}₫</span></div>
    </article>;})}</div>
  </>;
}
