'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import type { Product } from '@/types/api';
import { useCart } from '@/context/CartContext';
import { PageTitle } from '@/components/PageTitle';

export default function ProductDetailPage(){const params=useParams<{id:string}>();const router=useRouter();const {add}=useCart();const [product,setProduct]=useState<Product|null>(null);const [variant,setVariant]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 useEffect(()=>{let alive=true;productService.get(params.id).then(r=>{if(alive){setProduct(r.data);const first=r.data.product_variants?.find(v=>v.is_active!==false);if(first)setVariant(String(first.id));}}).catch(e=>alive&&setError(e instanceof Error?e.message:'Không tải được sản phẩm.'));return()=>{alive=false}},[params.id]);
 async function addToCart(buy=false){if(!variant){setError('Sản phẩm chưa có biến thể khả dụng.');return}setBusy(true);setError('');try{await add(variant);if(buy)router.push('/cart')}catch(e){setError(e instanceof Error?e.message:'Không thêm được sản phẩm vào giỏ.')}finally{setBusy(false)}}
 if(error&&!product)return <main className="container section"><PageTitle title="Không tải được sản phẩm" description={error}/><Link className="button outline" href="/products">Quay lại danh sách</Link></main>;
 if(!product)return <main className="container section"><p className="loading-copy">Đang tải sản phẩm…</p></main>;
 const variants=product.product_variants?.filter(v=>v.is_active!==false)??[];const selected=variants.find(v=>String(v.id)===variant);
 const image=product.product_images?.find(item=>item.is_primary)??product.product_images?.[0];
 return <main className="container section"><div className="breadcrumbs"><Link href="/">Trang chủ</Link><span>/</span><Link href="/products">Sản phẩm</Link><span>/</span>{product.name}</div><div className="detail-layout"><div className={`detail-art product-art ${image?'has-photo':''}`}>{image&&<img className="product-photo" src={image.url} alt={image.alt_text||product.name}/>}<span className="art-code">{product.categories?.name??'AETHER / ESSENTIALS'}</span>{!image&&<span className="detail-art-mark">A</span>}</div><section className="detail-copy"><span className="eyebrow">{product.categories?.name??'Bộ sưu tập thường ngày'}</span><h1>{product.name}</h1><strong className="detail-price">{Number(selected?.price??product.base_price).toLocaleString('vi-VN')} ₫</strong><p className="detail-description">{product.description||'Thiết kế tối giản cho nhịp sống hàng ngày, tập trung vào chất liệu và cảm giác thoải mái.'}</p><div className="detail-field"><span className="field-label">Kích thước / Màu sắc</span><div className="variant-options">{variants.length?variants.map(v=><button type="button" key={v.id} className={`variant-option ${variant===String(v.id)?'selected':''}`} onClick={()=>setVariant(String(v.id))}>{[v.sizes?.name,v.colors?.name].filter(Boolean).join(' / ')||v.sku}</button>):<span className="muted">Chưa có biến thể đang bán.</span>}</div></div><div className="stock-note">Tình trạng tồn kho sẽ được xác nhận khi thêm vào giỏ.</div>{error&&<div role="alert" className="notice error-notice">{error}</div>}<div className="detail-actions"><button className="button dark" disabled={busy||!variants.length} onClick={()=>void addToCart()}>Thêm vào giỏ <span className="arrow">+</span></button><button className="button outline" disabled={busy||!variants.length} onClick={()=>void addToCart(true)}>Mua ngay</button></div><p className="detail-footnote">Giao hàng và thanh toán được xác nhận ở bước đặt đơn.</p></section></div></main>;
}
