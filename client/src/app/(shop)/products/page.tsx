'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductGrid } from '@/components/ProductGrid';
import { productService } from '@/services/productService';
import type { Product } from '@/types/api';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [size, setSize] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { setCategoryFilter(searchParams.get('category') ?? ''); }, [searchParams]);
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

  const selectedCategory = categories.find((item) => item.slug === categoryFilter);
  const categoryHero = categoryFilter === 'thoi-trang-nam'
    ? { image: '/pexels-solliefoto-298864.jpg', title: 'Thời trang Nam', alt: 'Trang phục và giày da nam trưng bày trong cửa hàng' }
    : categoryFilter === 'thoi-trang-nu'
      ? { image: '/pexels-tima-miroshnichenko-7202900.jpg', title: 'Thời trang Nữ', alt: 'Bốn người mẫu nữ mặc trang phục hiện đại' }
      : null;
  return <>
    {!categoryFilter && <section className="category-page-hero category-page-hero-all" aria-label="Tất cả sản phẩm">
      <img src="/aether-all-products.jpg" alt="Đội ngũ AETHER trong cửa hàng thời trang" />
      <div className="category-page-hero-overlay" />
      <div className="category-page-hero-copy"><span className="eyebrow">AETHER / THE COLLECTION</span><h1>Tất cả sản phẩm</h1><p>Khám phá những thiết kế dành cho phong cách của bạn.</p></div>
    </section>}
    {categoryHero && <section className={`category-page-hero ${categoryFilter === 'thoi-trang-nam' ? 'category-page-hero-men' : 'category-page-hero-women'}`} aria-label={categoryHero.title}>
      <img src={categoryHero.image} alt={categoryHero.alt} />
      <div className="category-page-hero-overlay" />
      <div className="category-page-hero-copy"><span className="eyebrow">AETHER / THE COLLECTION</span><h1>{categoryHero.title}</h1><p>Khám phá những thiết kế dành riêng cho phong cách của bạn.</p></div>
    </section>}
    <section className="container"><div className="page-head"><span className="eyebrow">THE AETHER EDIT</span><h1>{selectedCategory?.name ?? (categoryHero?.title || 'Tất cả sản phẩm')}</h1><p>{selectedCategory ? `Khám phá các sản phẩm thuộc danh mục ${selectedCategory.name}.` : 'Những thiết kế thiết yếu, sẵn sàng cho mọi ngày thường.'}</p></div>
    <div className="filter-row"><input className="input" value={search} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm sản phẩm…" aria-label="Tìm kiếm sản phẩm" /><select className="select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="">Tất cả danh mục</option>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><select className="select" value={size} onChange={(event) => setSize(event.target.value)}><option value="">Mọi kích thước</option>{['S','M','L','XL'].map((item) => <option key={item}>{item}</option>)}</select><select className="select" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)}><option value="">Mọi mức giá</option><option value="300000">Dưới 300.000₫</option><option value="500000">Dưới 500.000₫</option><option value="1000000">Dưới 1.000.000₫</option></select></div>
    {searchFocused && <div className="product-search-categories"><span className="eyebrow">Khám phá theo danh mục</span><div className="product-search-category-group"><strong>Nam</strong><div>{['Áo thun', 'Áo khoác', 'Quần jean', 'Quần dài'].map((item) => <button key={`nam-${item}`} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setSearch(item); setSearchFocused(false); }}>{item}</button>)}</div></div><div className="product-search-category-group"><strong>Nữ</strong><div>{['Áo thun', 'Áo kiểu', 'Áo khoác', 'Quần jean', 'Váy'].map((item) => <button key={`nu-${item}`} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setSearch(item); setSearchFocused(false); }}>{item}</button>)}</div></div></div>}
    {error ? <div className="notice error-notice">{error}</div> : loading ? <div className="loading-state"><span className="spinner" />Đang tải sản phẩm…</div> : products.length ? <ProductGrid products={products} /> : <div className="empty-state">Không tìm thấy sản phẩm phù hợp.</div>}
    <p className="form-help" style={{ textAlign: 'right', marginTop: 18 }}>{products.length} sản phẩm</p>
    </section>
  </>;
}

export default function ProductsPage() {
  return <Suspense fallback={<section className="container"><div className="loading-state">Đang tải danh mục sản phẩm…</div></section>}><ProductsPageContent /></Suspense>;
}
