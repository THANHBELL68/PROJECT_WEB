import { pool } from '../config/prisma.js';

const variantIdPattern = /^\d+$/;

async function ensureCart(client, userId) {
  const result = await client.query(
    `INSERT INTO carts (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [userId],
  );
  return result.rows[0].id;
}

async function readCart(client, userId) {
  const cartId = await ensureCart(client, userId);
  const result = await client.query(
    `SELECT ci.id, ci.variant_id, ci.quantity,
            p.id AS product_id, p.name AS product_name, p.slug,
            pv.sku, pv.price::text AS unit_price,
            concat_ws(' / ', s.name, c.name, m.name) AS variant_label,
            greatest(coalesce(i.quantity_on_hand, 0) - coalesce(i.quantity_reserved, 0), 0) AS available_stock
       FROM cart_items ci
       JOIN product_variants pv ON pv.id = ci.variant_id
       JOIN products p ON p.id = pv.product_id
       LEFT JOIN sizes s ON s.id = pv.size_id
       LEFT JOIN colors c ON c.id = pv.color_id
       LEFT JOIN materials m ON m.id = pv.material_id
       LEFT JOIN inventories i ON i.variant_id = pv.id
      WHERE ci.cart_id = $1
      ORDER BY ci.added_at, ci.id`,
    [cartId],
  );
  const items = result.rows.map((item) => ({
    ...item,
    line_total: (Number(item.unit_price) * item.quantity).toFixed(2),
  }));
  return {
    cartId: String(cartId),
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + Math.round(Number(item.unit_price) * 100) * item.quantity, 0) / 100,
  };
}

export async function getCart(req, res, next) {
  try {
    return res.json({ success: true, data: await readCart(pool, req.user.id) });
  } catch (error) {
    return next(error);
  }
}

export async function addCartItem(req, res, next) {
  const { variantId, quantity = 1 } = req.body ?? {};
  if (!variantIdPattern.test(String(variantId)) || !Number.isSafeInteger(quantity) || quantity < 1) {
    return res.status(400).json({ success: false, message: 'variantId hoặc quantity không hợp lệ' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cartId = await ensureCart(client, req.user.id);
    const variant = await client.query(
      `SELECT pv.id, coalesce(i.quantity_on_hand - i.quantity_reserved, 0) AS available_stock
         FROM product_variants pv
         JOIN products p ON p.id = pv.product_id
         LEFT JOIN inventories i ON i.variant_id = pv.id
        WHERE pv.id = $1 AND pv.is_active = true
          AND p.is_visible = true AND p.deleted_at IS NULL`,
      [variantId],
    );
    if (!variant.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy biến thể sản phẩm đang bán' });
    }

    const current = await client.query(
      'SELECT quantity FROM cart_items WHERE cart_id = $1 AND variant_id = $2 FOR UPDATE',
      [cartId, variantId],
    );
    const nextQuantity = (current.rows[0]?.quantity ?? 0) + quantity;
    if (nextQuantity > Number(variant.rows[0].available_stock)) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Số lượng vượt quá tồn kho khả dụng' });
    }
    await client.query(
      `INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (cart_id, variant_id) DO UPDATE SET quantity = EXCLUDED.quantity`,
      [cartId, variantId, nextQuantity],
    );
    const data = await readCart(client, req.user.id);
    await client.query('COMMIT');
    return res.status(201).json({ success: true, data });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return next(error);
  } finally {
    client.release();
  }
}

export async function updateCartItem(req, res, next) {
  const itemId = req.params.itemId;
  const { quantity } = req.body ?? {};
  if (!variantIdPattern.test(itemId) || !Number.isSafeInteger(quantity) || quantity < 1) {
    return res.status(400).json({ success: false, message: 'itemId hoặc quantity không hợp lệ' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cartId = await ensureCart(client, req.user.id);
    const item = await client.query(
      `SELECT ci.variant_id, coalesce(i.quantity_on_hand - i.quantity_reserved, 0) AS available_stock
         FROM cart_items ci
         LEFT JOIN inventories i ON i.variant_id = ci.variant_id
        WHERE ci.id = $1 AND ci.cart_id = $2 FOR UPDATE OF ci`,
      [itemId, cartId],
    );
    if (!item.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ' });
    }
    if (quantity > Number(item.rows[0].available_stock)) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Số lượng vượt quá tồn kho khả dụng' });
    }
    await client.query('UPDATE cart_items SET quantity = $1 WHERE id = $2', [quantity, itemId]);
    const data = await readCart(client, req.user.id);
    await client.query('COMMIT');
    return res.json({ success: true, data });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return next(error);
  } finally {
    client.release();
  }
}

export async function removeCartItem(req, res, next) {
  if (!variantIdPattern.test(req.params.itemId)) {
    return res.status(400).json({ success: false, message: 'itemId không hợp lệ' });
  }
  try {
    const cartIdResult = await pool.query('SELECT id FROM carts WHERE user_id = $1', [req.user.id]);
    if (!cartIdResult.rowCount) return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại' });
    const removed = await pool.query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [req.params.itemId, cartIdResult.rows[0].id]);
    if (!removed.rowCount) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm trong giỏ' });
    return res.json({ success: true, data: await readCart(pool, req.user.id) });
  } catch (error) {
    return next(error);
  }
}
