'use client';

import Link from 'next/link';
import {useEffect,useState} from 'react';
import {useAuth} from '@/context/AuthContext';
import {adminService} from '@/services/adminService';
import type {OrderSummary} from '@/types/api';
import {PageTitle} from '@/components/PageTitle';

export default function AdminOrdersPage(){const{token}=useAuth();const[orders,setOrders]=useState<OrderSummary[]>([]);const[error,setError]=useState('');useEffect(()=>{if(token)adminService.orders(token).then(r=>setOrders(r.data)).catch(e=>setError(e instanceof Error?e.message:'Không tải được đơn hàng.'))},[token]);const labels:Record<string,string>={new:'Mới',processing:'Đang xử lý',packing:'Đang đóng gói',shipping:'Đang giao',completed:'Hoàn tất',cancelled:'Đã hủy'};return <main className="admin-content"><PageTitle eyebrow="Vận hành" title="Đơn hàng" description="Theo dõi, xác nhận và cập nhật tiến độ xử lý đơn."/>{error&&<div className="notice error-notice">{error}</div>}<section className="admin-panel"><div className="table-wrap"><table><thead><tr><th>Mã đơn</th><th>Ngày tạo</th><th>Số món</th><th>Thanh toán</th><th>Trạng thái</th><th></th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><strong>{o.order_code}</strong></td><td>{o.created_at?new Date(o.created_at).toLocaleString('vi-VN'):'—'}</td><td>{o.item_count??'—'}</td><td>{o.payment_method||'—'}</td><td><span className="status-pill">{labels[o.status]||o.status}</span></td><td><Link className="under-link" href={`/orders/${o.id}`}>Chi tiết →</Link></td></tr>)}</tbody></table>{orders.length===0&&<p className="muted table-empty">Chưa có đơn hàng.</p>}</div></section></main>}
