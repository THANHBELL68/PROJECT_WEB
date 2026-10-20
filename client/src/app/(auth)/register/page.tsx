'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageTitle } from '@/components/PageTitle';

export default function RegisterPage() {
  const { register } = useAuth(); const router = useRouter(); const [fullName,setFullName]=useState(''); const [email,setEmail]=useState(''); const [phone,setPhone]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(event:FormEvent){event.preventDefault();setBusy(true);setError('');try{await register({fullName,email:email||undefined,phone,password});router.replace('/profile');}catch(e){setError(e instanceof Error?e.message:'Không thể tạo tài khoản.');}finally{setBusy(false);}}
  return <main className="auth-page"><Link href="/" className="auth-brand">AETHER<span>®</span></Link><div className="auth-card"><PageTitle eyebrow="Thành viên Aether" title="Tạo tài khoản" description="Lưu thông tin và theo dõi hành trình đơn hàng của bạn." />{error&&<div className="notice error-notice" role="alert">{error}</div>}<form className="form-stack" onSubmit={submit}><label>Họ và tên<input required autoComplete="name" value={fullName} onChange={e=>setFullName(e.target.value)} /></label><label>Số điện thoại<input required autoComplete="tel" value={phone} onChange={e=>setPhone(e.target.value)} /></label><label>Email <span className="optional">(không bắt buộc)</span><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} /></label><label>Mật khẩu<input type="password" minLength={8} required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} /></label><button className="button dark full-width" disabled={busy}>{busy?'Đang tạo tài khoản…':'Đăng ký'}<span className="arrow">→</span></button></form><p className="auth-switch">Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p></div></main>;
}
