'use client';

import {useAuth} from '@/context/AuthContext';
import {PageTitle} from '@/components/PageTitle';

export default function SettingsPage(){const{user,hasPermission}=useAuth();if(!hasPermission('ACCOUNT_ROLE_MANAGER')&&!hasPermission('SYSTEM_CONFIG'))return <main className="admin-content"><PageTitle title="Không có quyền truy cập" description="Bạn không có quyền quản lý thiết lập và phân quyền."/></main>;return <main className="admin-content"><PageTitle eyebrow="Quản trị hệ thống" title="Cấu hình & quyền hạn" description="Quyền đang có trong phiên đăng nhập hiện tại."/><section className="admin-panel settings-card"><span className="eyebrow">Tài khoản hiện tại</span><h2>{user?.fullName||user?.email||'Quản trị viên'}</h2><p>Vai trò: {user?.roles?.map(role=>role.name).join(', ')||'—'}</p><div className="permission-list">{(user?.permissions||[]).map(permission=><span key={permission}>{permission}</span>)}</div><div className="notice">Backend hiện chưa cung cấp API xem nhật ký hệ thống, báo cáo toàn cục hoặc gán vai trò nhân viên. Màn hình này chỉ hiển thị quyền được trả về trong JWT.</div></section></main>}
