'use client';

import { useEffect, useState } from 'react';
import { ProductGrid } from './ProductGrid';
import { productService } from '@/services/productService';
import type { Product } from '@/types/api';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');
  useEffect(() => { productService.list().then((result) => setProducts(result.data.slice(0, 4))).catch((reason) => setError(reason.message)); }, []);
  if (error) return <div className="notice">Chưa tải được sản phẩm. {error}</div>;
  if (!products.length) return <div className="loading-state"><span className="spinner" />Đang tải sản phẩm…</div>;
  return <ProductGrid products={products} />;
}
