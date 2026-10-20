'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import type { OrderSummary } from '@/types/api';
import { PageTitle } from '@/components/PageTitle';

const statusLabel:Record<string,string>={new:'Mới',processing:'Đang xử lý',packing:'Đang đóng gói',shipping:'Đang giao',completed:'Hoàn tất',cancelled:'Đã hủy'};
export default function ProfilePage(){const {user,token,loading,logout}=useAuth();const [orders,setOrders]=useState<OrderSummary[]>([]);const [error,setError]=useState('');useEffect(()=>{if(token)orderService.orders(token).then(r=>setOrders(r.data)).catch(e=>setError(e instanceof Error?e.message:'Không tải được lịch sử đơn.'))},[token]);
 if(loading)return <main className="container section"><p className="loading-copy">Đang tải tài khoản…</p></main>;
 if(!user)return <main className="container section"><PageTitle title="Tài khoản của bạn" description="Đăng nhập để xem hồ sơ và lịch sử đơn hàng."/><Link className="button dark" href="/login">Đăng nhập</Link></main>;
 return <main className="container section"><div className="profile-heading"><PageTitle eyebrow="Không gian của bạn" title={`Xin chào, ${user.fullName||'bạn'}`} description="Thông tin tài khoản và hành trình đơn hàng của bạn."/><button className="button outline" onClick={()=>logout()}>Đăng xuất</button></div><div className="profile-layout"><section className="profile-card"><span className="eyebrow">Thông tin tài khoản</span><h2>{user.fullName}</h2><p>{user.email||'Chưa cập nhật email'}</p><p>{user.phone||'Chưa cập nhật số điện thoại'}</p><div className="role-tags">{user.roles?.map(role=><span key={role.code}>{role.name}</span>)}</div><p className="summary-hint">Chỉnh sửa hồ sơ và địa chỉ chưa được backend hỗ trợ.</p></section><section className="orders-panel"><div className="section-heading"><div><span className="eyebrow">Gần đây</span><h2>Lịch sử đơn hàng</h2></div><span>{orders.length} đơn</span></div>{error&&<div className="notice error-notice">{error}</div>}{orders.length===0?<p className="muted">Bạn chưa có đơn hàng nào.</p>:<div className="table-wrap"><table><thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Trạng thái</th><th>Tổng tiền</th></tr></thead><tbody>{orders.map(order=><tr key={order.id}><td><strong>{order.order_code}</strong></td><td>{order.created_at?new Date(order.created_at).toLocaleDateString('vi-VN'):'—'}</td><td><span className="status-pill">{statusLabel[order.status]||order.status}</span></td><td>{Number(order.total_amount||0).toLocaleString('vi-VN')} ₫</td></tr>)}</tbody></table></div>}</section></div></main>;
}
