BEGIN;

DELETE FROM user_roles ur
USING users u, roles r
WHERE ur.user_id = u.id
  AND ur.role_id = r.id
  AND lower(u.email) = lower('email-cua-ban@gmail.com')
  AND r.code = 'CUSTOMER';

UPDATE users
SET user_type = 'staff'::user_type
WHERE lower(email) = lower('email-cua-ban@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE lower(u.email) = lower('email-cua-ban@gmail.com')
  AND r.code = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

COMMIT;
-- =======================================

BEGIN;

DELETE FROM user_roles ur
USING users u, roles r
WHERE ur.user_id = u.id
  AND ur.role_id = r.id
  AND lower(u.email) = lower('cs@example.com')
  AND r.code = 'CUSTOMER';

UPDATE users
SET user_type = 'staff'::user_type
WHERE lower(email) = lower('cs@example.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE lower(u.email) = lower('cs@example.com')
  AND r.code = 'CS_STAFF'
ON CONFLICT DO NOTHING;

COMMIT;

-- ===========================


BEGIN;

DELETE FROM user_roles ur
USING users u, roles r
WHERE ur.user_id = u.id
  AND ur.role_id = r.id
  AND lower(u.email) = lower('warehouse@example.com')
  AND r.code = 'CUSTOMER';

UPDATE users
SET user_type = 'staff'::user_type
WHERE lower(email) = lower('warehouse@example.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE lower(u.email) = lower('warehouse@example.com')
  AND r.code = 'WAREHOUSE_MANAGER'
ON CONFLICT DO NOTHING;

COMMIT;