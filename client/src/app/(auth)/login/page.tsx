'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageTitle } from '@/components/PageTitle';

export default function LoginPage() {
  const { login } = useAuth(); const router = useRouter();
  const [identifier, setIdentifier] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(''); try { await login(identifier, password); const next = new URLSearchParams(window.location.search).get('next'); router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : '/profile'); } catch (e) { setError(e instanceof Error ? e.message : 'Không thể đăng nhập.'); } finally { setBusy(false); } }
  return <main className="auth-page"><Link href="/" className="auth-brand">AETHER<span>®</span></Link><div className="auth-card"><PageTitle eyebrow="Chào mừng trở lại" title="Đăng nhập" description="Đăng nhập để theo dõi đơn hàng và tiếp tục mua sắm." />{error && <div className="notice error-notice" role="alert">{error}</div>}<form className="form-stack" onSubmit={submit}><label>Email hoặc số điện thoại<input autoComplete="username" required value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="ban@email.com" /></label><label>Mật khẩu<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" /></label><button className="button dark full-width" disabled={busy}>{busy?'Đang đăng nhập…':'Đăng nhập'}<span className="arrow">→</span></button></form><p className="auth-switch">Chưa có tài khoản? <Link href="/register">Đăng ký</Link></p></div></main>;
}
