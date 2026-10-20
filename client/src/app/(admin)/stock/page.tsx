'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useAuth} from '@/context/AuthContext';
import {adminService} from '@/services/adminService';
import {PageTitle} from '@/components/PageTitle';

type StockRow={variant_id:string;sku:string;product_name:string;variant_label:string;quantity_on_hand:number;quantity_reserved:number;available:number};
export default function StockPage(){const{token,hasPermission}=useAuth();const[rows,setRows]=useState<StockRow[]>([]);const[query,setQuery]=useState('');const[error,setError]=useState('');useEffect(()=>{if(token)adminService.inventory(token).then(r=>setRows(r.data as StockRow[])).catch(e=>setError(e instanceof Error?e.message:'Không tải được tồn kho.'))},[token]);const filtered=rows.filter(r=>`${r.product_name} ${r.sku}`.toLowerCase().includes(query.toLowerCase()));return <main className="admin-content"><PageTitle eyebrow="Kho vận" title="Tồn kho" description="Theo dõi tồn thực tế, số lượng đã giữ và hàng có thể bán."/>{error&&<div className="notice error-notice">{error}</div>}<div className="admin-toolbar"><input className="search-input" placeholder="Tìm sản phẩm hoặc SKU…" value={query} onChange={e=>setQuery(e.target.value)}/>{hasPermission('STOCK_IO_MANAGE')&&<Link className="button dark" href="/stock/documents">Phiếu nhập / xuất <span className="arrow">→</span></Link>}</div><section className="admin-panel"><div className="table-wrap"><table><thead><tr><th>Sản phẩm</th><th>Biến thể</th><th>SKU</th><th>Tồn kho</th><th>Đã giữ</th><th>Có thể bán</th></tr></thead><tbody>{filtered.map(r=><tr key={r.variant_id}><td><strong>{r.product_name}</strong></td><td>{r.variant_label||'—'}</td><td>{r.sku}</td><td>{r.quantity_on_hand}</td><td>{r.quantity_reserved}</td><td><span className={`stock-value ${r.available<5?'low-stock':''}`}>{r.available}</span></td></tr>)}</tbody></table>{!filtered.length&&<p className="muted table-empty">Không có dòng tồn kho phù hợp.</p>}</div></section></main>}
