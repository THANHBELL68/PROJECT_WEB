import { randomBytes } from 'node:crypto';
import { pool } from '../config/prisma.js';

const idPattern = /^\d+$/;
const requiredAddressFields = ['recipientName', 'recipientPhone', 'province', 'district', 'ward', 'streetAddress'];

function addressIsValid(address) {
  return address && requiredAddressFields.every((field) =>
    typeof address[field] === 'string' && address[field].trim().length > 0,
  );
}

function amountToCents(value) {
  return Math.round(Number(value) * 100);
}

export async function checkout(req, res, next) {
  const { paymentMethod = 'cod', address, note = null } = req.body ?? {};
  if (!['cod', 'bank_qr'].includes(paymentMethod) || !addressIsValid(address) ||
      (note !== null && (typeof note !== 'string' || note.length > 1000))) {
    return res.status(400).json({ success: false, message: 'Phương thức thanh toán hoặc địa chỉ giao hàng không hợp lệ' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cartResult = await client.query(
      `INSERT INTO carts (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
       RETURNING id`,
      [req.user.id],
    );
    const cartId = cartResult.rows[0].id;
    const cartLock = await client.query('SELECT id FROM carts WHERE id = $1 FOR UPDATE', [cartId]);
    const cartItems = await client.query(
      `SELECT ci.id, ci.variant_id, ci.quantity, pv.sku, pv.price::text AS unit_price,
              p.name AS product_name, p.is_visible, p.deleted_at, pv.is_active,
              concat_ws(' / ', s.name, c.name, m.name) AS variant_label
         FROM cart_items ci
         JOIN product_variants pv ON pv.id = ci.variant_id
         JOIN products p ON p.id = pv.product_id
         LEFT JOIN sizes s ON s.id = pv.size_id
         LEFT JOIN colors c ON c.id = pv.color_id
         LEFT JOIN materials m ON m.id = pv.material_id
        WHERE ci.cart_id = $1
        ORDER BY ci.variant_id`,
      [cartLock.rows[0].id],
    );
    if (!cartItems.rowCount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Giỏ hàng đang trống' });
    }
    if (cartItems.rows.some((item) => !item.is_active || !item.is_visible || item.deleted_at)) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Giỏ hàng có sản phẩm không còn được bán' });
    }

    const variantIds = cartItems.rows.map((item) => item.variant_id);
    const inventoryResult = await client.query(
      `SELECT variant_id, quantity_on_hand, quantity_reserved
         FROM inventories WHERE variant_id = ANY($1::bigint[])
        ORDER BY variant_id FOR UPDATE`,
      [variantIds],
    );
    const inventoryByVariant = new Map(inventoryResult.rows.map((row) => [String(row.variant_id), row]));
    for (const item of cartItems.rows) {
      const inventory = inventoryByVariant.get(String(item.variant_id));
      const available = inventory ? Number(inventory.quantity_on_hand) - Number(inventory.quantity_reserved) : 0;
      if (available < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(409).json({ success: false, message: `Không đủ tồn kho cho ${item.product_name}` });
      }
    }

    const subtotalCents = cartItems.rows.reduce(
      (total, item) => total + amountToCents(item.unit_price) * item.quantity,
      0,
    );
    const orderCode = `ORD-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
    const orderResult = await client.query(
      `INSERT INTO orders (order_code, user_id, payment_method, note)
       VALUES ($1, $2, $3::payment_method, $4) RETURNING id, order_code, status, payment_method`,
      [orderCode, req.user.id, paymentMethod, note?.trim() || null],
    );
    const order = orderResult.rows[0];

    for (const item of cartItems.rows) {
      const lineTotal = amountToCents(item.unit_price) * item.quantity;
      await client.query(
        `INSERT INTO order_items (order_id, variant_id, product_name, variant_label, unit_price, quantity, line_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [order.id, item.variant_id, item.product_name, item.variant_label || item.sku,
          item.unit_price, item.quantity, (lineTotal / 100).toFixed(2)],
      );
      // The database's reserve_order_item trigger reserves stock for this order item.
    }

    const userResult = await client.query('SELECT full_name, phone, email FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];
    await client.query(
      `INSERT INTO order_customers (order_id, customer_name, customer_phone, customer_email)
       VALUES ($1, $2, $3, $4)`,
      [order.id, user.full_name || user.phone, user.phone, user.email],
    );
    await client.query(
      `INSERT INTO order_shipping_addresses
        (order_id, recipient_name, recipient_phone, province, district, ward, street_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [order.id, ...requiredAddressFields.map((field) => address[field].trim())],
    );
    await client.query(
      `INSERT INTO order_amounts
        (order_id, subtotal, voucher_discount, points_used, points_discount, shipping_fee, total_amount)
       VALUES ($1, $2, 0, 0, 0, 0, $2)`,
      [order.id, (subtotalCents / 100).toFixed(2)],
    );
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      data: {
        id: String(order.id),
        orderCode: order.order_code,
        status: order.status,
        paymentMethod: order.payment_method,
        subtotal: (subtotalCents / 100).toFixed(2),
        total: (subtotalCents / 100).toFixed(2),
      },
    });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return next(error);
  } finally {
    client.release();
  }
}

export async function listOrders(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT o.id, o.order_code, o.status, o.payment_method, o.payment_status, o.created_at,
              oa.total_amount::text AS total_amount,
              (SELECT count(*) FROM order_items oi WHERE oi.order_id = o.id)::int AS item_count
         FROM orders o LEFT JOIN order_amounts oa ON oa.order_id = o.id
        WHERE o.user_id = $1 ORDER BY o.created_at DESC LIMIT 50`,
      [req.user.id],
    );
    return res.json({ success: true, data: result.rows.map((row) => ({ ...row, id: String(row.id) })) });
  } catch (error) {
    return next(error);
  }
}

export async function getOrder(req, res, next) {
  if (!idPattern.test(req.params.orderId)) {
    return res.status(400).json({ success: false, message: 'orderId không hợp lệ' });
  }
  try {
    const result = await pool.query(
      `SELECT o.id, o.order_code, o.status, o.payment_method, o.payment_status, o.note, o.created_at,
              oa.subtotal::text, oa.shipping_fee::text, oa.total_amount::text,
              to_jsonb(oc) - 'order_id' AS customer,
              to_jsonb(sa) - 'order_id' AS shipping_address,
              coalesce((SELECT jsonb_agg(jsonb_build_object(
                'variantId', oi.variant_id, 'productName', oi.product_name,
                'variantLabel', oi.variant_label, 'unitPrice', oi.unit_price::text,
                'quantity', oi.quantity, 'lineTotal', oi.line_total::text
              ) ORDER BY oi.id) FROM order_items oi WHERE oi.order_id = o.id), '[]'::jsonb) AS items
         FROM orders o
         LEFT JOIN order_amounts oa ON oa.order_id = o.id
         LEFT JOIN order_customers oc ON oc.order_id = o.id
         LEFT JOIN order_shipping_addresses sa ON sa.order_id = o.id
        WHERE o.id = $1 AND o.user_id = $2`,
      [req.params.orderId, req.user.id],
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    return res.json({ success: true, data: { ...result.rows[0], id: String(result.rows[0].id) } });
  } catch (error) {
    return next(error);
  }
}
