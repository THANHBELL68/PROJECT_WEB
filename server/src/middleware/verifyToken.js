import { createHmac, timingSafeEqual } from 'node:crypto';
import prisma from '../config/prisma.js';

function decodeAndVerifyJwt(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  let header;
  let payload;
  try {
    header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString('utf8'));
    payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  // Accept only HMAC-SHA256 tokens to prevent algorithm-confusion attacks.
  if (header?.alg !== 'HS256' || !payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  const expected = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest();
  const actual = Buffer.from(signature, 'base64url');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  const now = Math.floor(Date.now() / 1000);
  if ((payload.exp !== undefined && (!Number.isFinite(payload.exp) || now >= payload.exp)) ||
      (payload.nbf !== undefined && (!Number.isFinite(payload.nbf) || now < payload.nbf))) {
    return null;
  }

  return payload;
}

/** Authenticate the Bearer JWT and attach the user's current roles and permission codes. */
export async function verifyToken(req, res, next) {
  const authorization = req.get('authorization');
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return res.status(401).json({ success: false, message: 'Thiếu Bearer token' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is not configured');
    return res.status(500).json({ success: false, message: 'Cấu hình xác thực chưa sẵn sàng' });
  }

  const claims = decodeAndVerifyJwt(match[1], secret);
  if (!claims) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }

  const rawUserId = claims.userId ?? claims.id ?? claims.sub;
  if (!(typeof rawUserId === 'string' && /^\d+$/.test(rawUserId)) &&
      !(Number.isSafeInteger(rawUserId) && rawUserId > 0)) {
    return res.status(401).json({ success: false, message: 'Token không chứa user id hợp lệ' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { id: BigInt(rawUserId) },
      select: {
        id: true,
        email: true,
        user_roles: {
          select: {
            roles: {
              select: {
                id: true,
                code: true,
                name: true,
                role_permissions: {
                  select: { permissions: { select: { code: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Tài khoản không tồn tại' });
    }

    const roles = user.user_roles.map(({ roles: role }) => ({ id: role.id, code: role.code, name: role.name }));
    const permissions = [...new Set(user.user_roles.flatMap(({ roles: role }) =>
      role.role_permissions.map(({ permissions: permission }) => permission.code),
    ))];

    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      roles,
      permissions,
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

export default verifyToken;
