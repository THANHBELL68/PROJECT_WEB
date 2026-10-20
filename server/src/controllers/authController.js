import { pool } from '../config/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { createAccessToken } from '../utils/jwt.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function loadAccess(userId) {
  const result = await pool.query(
    `SELECT r.code AS role_code, r.name AS role_name, p.code AS permission_code
       FROM user_roles ur
       JOIN roles r ON r.id = ur.role_id
       LEFT JOIN role_permissions rp ON rp.role_id = r.id
       LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE ur.user_id = $1
      ORDER BY r.code, p.code`,
    [userId],
  );
  const roles = new Map();
  const permissions = new Set();
  for (const row of result.rows) {
    if (!roles.has(row.role_code)) roles.set(row.role_code, { code: row.role_code, name: row.role_name });
    if (row.permission_code) permissions.add(row.permission_code);
  }
  return { roles: [...roles.values()], permissions: [...permissions] };
}

function issueAuthResponse(res, user, access) {
  const accessToken = createAccessToken(user.id);
  return res.json({
    success: true,
    data: {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: String(user.id),
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        roles: access.roles,
        permissions: access.permissions,
      },
    },
  });
}

export async function register(req, res, next) {
  const { fullName, email, phone, password } = req.body ?? {};
  if (typeof fullName !== 'string' || !fullName.trim() ||
      typeof phone !== 'string' || !/^\+?[\d\s()-]{8,20}$/.test(phone.trim()) ||
      typeof password !== 'string' || password.length < 8 || password.length > 128 ||
      (email != null && (typeof email !== 'string' || !emailPattern.test(email.trim())))) {
    return res.status(400).json({ success: false, message: 'Thông tin đăng ký không hợp lệ (mật khẩu tối thiểu 8 ký tự)' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const role = await client.query("SELECT id FROM roles WHERE code = 'CUSTOMER'");
    if (!role.rowCount) {
      await client.query('ROLLBACK');
      return res.status(500).json({ success: false, message: 'Chưa cấu hình vai trò CUSTOMER' });
    }

    const passwordHash = await hashPassword(password);
    const inserted = await client.query(
      `INSERT INTO users (phone, email, password_hash, full_name, user_type, status)
       VALUES ($1, $2, $3, $4, 'customer'::user_type, 'active'::account_status)
       RETURNING id, full_name, email, phone`,
      [phone.trim(), email?.trim().toLowerCase() || null, passwordHash, fullName.trim()],
    );
    const user = inserted.rows[0];
    await client.query(
      'INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT (user_id, role_id) DO NOTHING',
      [user.id, role.rows[0].id],
    );
    await client.query('COMMIT');

    const access = await loadAccess(user.id);
    return issueAuthResponse(res, user, access);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Số điện thoại hoặc email đã được sử dụng' });
    }
    return next(error);
  } finally {
    client.release();
  }
}

export async function login(req, res, next) {
  const { identifier, password } = req.body ?? {};
  if (typeof identifier !== 'string' || !identifier.trim() || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: 'Cần cung cấp email/số điện thoại và mật khẩu' });
  }

  try {
    const value = identifier.trim();
    const result = await pool.query(
      `SELECT id, full_name, email, phone, password_hash
         FROM users
        WHERE (lower(email) = lower($1) OR phone = $1)
          AND status = 'active'::account_status
        LIMIT 1`,
      [value],
    );
    const user = result.rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: 'Thông tin đăng nhập không chính xác' });
    }

    await pool.query('UPDATE users SET last_login_at = now(), updated_at = now() WHERE id = $1', [user.id]);
    const access = await loadAccess(user.id);
    return issueAuthResponse(res, user, access);
  } catch (error) {
    return next(error);
  }
}
