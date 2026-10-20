'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProductGrid } from '@/components/ProductGrid';
import { productService } from '@/services/productService';
import type { Product } from '@/types/api';

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [size, setSize] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { setCategoryFilter(new URLSearchParams(window.location.search).get('category') ?? ''); }, []);
  useEffect(() => {
    setLoading(true);
    let active = true;
    const timer = window.setTimeout(() => {
      productService.list(search ? { search } : {}).then((result) => { if (active) { setAllProducts(result.data); setError(''); } }).catch((reason) => { if (active) setError(reason.message); }).finally(() => { if (active) setLoading(false); });
    }, search ? 250 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [search]);

  const categories = useMemo(() => Array.from(new Map(allProducts.flatMap((product) => product.categories ? [[product.categories.slug, product.categories.name] as const] : [])).entries(), ([slug, name]) => ({ slug, name })), [allProducts]);

  const products = useMemo(() => allProducts.filter((product) => {
    if (categoryFilter && product.categories?.slug !== categoryFilter) return false;
    if (maxPrice && Number(product.base_price) > Number(maxPrice)) return false;
    if (size && !product.product_variants?.some((variant) => variant.sizes?.name === size)) return false;
    return true;
  }), [allProducts, categoryFilter, maxPrice, size]);

  return <section className="container"><div className="page-head"><span className="eyebrow">THE AETHER EDIT</span><h1>Tất cả sản phẩm</h1><p>Những thiết kế thiết yếu, sẵn sàng cho mọi ngày thường.</p></div>
    <div className="filter-row"><input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm sản phẩm…" aria-label="Tìm kiếm sản phẩm" /><select className="select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="">Tất cả danh mục</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><select className="select" value={size} onChange={(event) => setSize(event.target.value)}><option value="">Mọi kích thước</option>{['S','M','L','XL'].map((item) => <option key={item}>{item}</option>)}</select><select className="select" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}><option value="">Mọi mức giá</option><option value="300000">Dưới 300.000₫</option><option value="500000">Dưới 500.000₫</option><option value="1000000">Dưới 1.000.000₫</option></select></div>
    {error ? <div className="notice error-notice">{error}</div> : loading ? <div className="loading-state"><span className="spinner" />Đang tải sản phẩm…</div> : products.length ? <ProductGrid products={products} /> : <div className="empty-state">Không tìm thấy sản phẩm phù hợp.</div>}
    <p className="form-help" style={{ textAlign: 'right', marginTop: 18 }}>{products.length} sản phẩm</p>
  </section>;
}
