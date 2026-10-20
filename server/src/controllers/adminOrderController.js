import { pool } from '../config/prisma.js';

const idPattern = /^[1-9]\d*$/;
const progressStatuses = new Set(['packing', 'shipping', 'completed']);

function badId(value) {
  return !idPattern.test(value ?? '');
}

function handleOrderError(error, next, res) {
  if (['P0001', '23514', '23503', '23505'].includes(error.code)) {
    return res.status(409).json({ success: false, message: error.message });
  }
  return next(error);
}

export async function listAllOrders(req, res, next) {
  const { status, q } = req.query;
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 30, 1), 100);
  const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);
  const statuses = ['new', 'processing', 'packing', 'shipping', 'completed', 'cancelled'];
  if (status && !statuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Trạng thái đơn hàng không hợp lệ' });
  }

  try {
    const result = await pool.query(
      `SELECT o.id, o.order_code, o.user_id, o.status, o.payment_method, o.payment_status, o.created_at,
              oa.total_amount::text AS total_amount, oc.customer_name, oc.customer_phone,
              (SELECT count(*)::int FROM order_items oi WHERE oi.order_id=o.id) AS item_count
         FROM orders o
         LEFT JOIN order_amounts oa ON oa.order_id=o.id
         LEFT JOIN order_customers oc ON oc.order_id=o.id
        WHERE ($1::order_status IS NULL OR o.status=$1::order_status)
          AND ($2::text IS NULL OR o.order_code ILIKE '%' || $2 || '%' OR oc.customer_phone ILIKE '%' || $2 || '%')
        ORDER BY o.created_at DESC LIMIT $3 OFFSET $4`,
      [status || null, typeof q === 'string' && q.trim() ? q.trim() : null, limit, offset],
    );
    return res.json({ success: true, data: result.rows.map((row) => ({ ...row, id: String(row.id), user_id: row.user_id == null ? null : String(row.user_id) })) });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminOrder(req, res, next) {
  if (badId(req.params.orderId)) return res.status(400).json({ success: false, message: 'orderId không hợp lệ' });
  try {
    const result = await pool.query(
      `SELECT o.id, o.order_code, o.user_id, o.status, o.payment_method, o.payment_status, o.note, o.created_at,
              oa.subtotal::text, oa.shipping_fee::text, oa.total_amount::text,
              to_jsonb(oc)-'order_id' AS customer,
              to_jsonb(sa)-'order_id' AS shipping_address,
              coalesce((SELECT jsonb_agg(jsonb_build_object('variantId',oi.variant_id,'productName',oi.product_name,
                'variantLabel',oi.variant_label,'unitPrice',oi.unit_price::text,'quantity',oi.quantity,'lineTotal',oi.line_total::text)
                ORDER BY oi.id) FROM order_items oi WHERE oi.order_id=o.id),'[]'::jsonb) AS items,
              coalesce((SELECT jsonb_agg(jsonb_build_object('from',h.from_status,'to',h.to_status,'note',h.note,'at',h.created_at,'changedBy',h.changed_by)
                ORDER BY h.created_at,h.id) FROM order_status_histories h WHERE h.order_id=o.id),'[]'::jsonb) AS history
         FROM orders o LEFT JOIN order_amounts oa ON oa.order_id=o.id
         LEFT JOIN order_customers oc ON oc.order_id=o.id
         LEFT JOIN order_shipping_addresses sa ON sa.order_id=o.id
        WHERE o.id=$1`,
      [req.params.orderId],
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    const order = result.rows[0];
    return res.json({ success: true, data: { ...order, id: String(order.id), user_id: order.user_id == null ? null : String(order.user_id) } });
  } catch (error) {
    return next(error);
  }
}

export async function confirmOrder(req, res, next) {
  if (badId(req.params.orderId)) return res.status(400).json({ success: false, message: 'orderId không hợp lệ' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.user_id',$1,true)", [String(req.user.id)]);
    const current = await client.query('SELECT status FROM orders WHERE id=$1 FOR UPDATE', [req.params.orderId]);
    if (!current.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    if (current.rows[0].status !== 'new') {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Chỉ xác nhận được đơn ở trạng thái new' });
    }
    const result = await client.query("UPDATE orders SET status='processing'::order_status WHERE id=$1 RETURNING id,order_code,status", [req.params.orderId]);
    await client.query('COMMIT');
    return res.json({ success: true, data: { ...result.rows[0], id: String(result.rows[0].id) } });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return handleOrderError(error, next, res);
  } finally {
    client.release();
  }
}

export async function cancelOrder(req, res, next) {
  const { reason } = req.body ?? {};
  if (badId(req.params.orderId)) return res.status(400).json({ success: false, message: 'orderId không hợp lệ' });
  if (typeof reason !== 'string' || reason.trim().length < 3 || reason.trim().length > 500) {
    return res.status(400).json({ success: false, message: 'Lý do hủy cần từ 3 đến 500 ký tự' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.user_id',$1,true)", [String(req.user.id)]);
    const current = await client.query('SELECT id,status FROM orders WHERE id=$1 FOR UPDATE', [req.params.orderId]);
    if (!current.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    if (!['new', 'processing'].includes(current.rows[0].status)) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Chỉ hủy được đơn ở trạng thái new hoặc processing' });
    }
    await client.query(
      'INSERT INTO order_cancellations(order_id,reason,cancelled_by) VALUES($1,$2,$3)',
      [req.params.orderId, reason.trim(), req.user.id],
    );
    const result = await client.query('SELECT id,order_code,status FROM orders WHERE id=$1', [req.params.orderId]);
    await client.query('COMMIT');
    return res.json({ success: true, data: { ...result.rows[0], id: String(result.rows[0].id) } });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return handleOrderError(error, next, res);
  } finally {
    client.release();
  }
}

export async function updateOrderStatus(req, res, next) {
  const { status } = req.body ?? {};
  if (badId(req.params.orderId)) return res.status(400).json({ success: false, message: 'orderId không hợp lệ' });
  if (!progressStatuses.has(status)) {
    return res.status(400).json({ success: false, message: 'status chỉ nhận packing, shipping hoặc completed' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.user_id',$1,true)", [String(req.user.id)]);
    const current = await client.query('SELECT id,status FROM orders WHERE id=$1 FOR UPDATE', [req.params.orderId]);
    if (!current.rowCount) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
    }
    const expectedPrevious = { packing: 'processing', shipping: 'packing', completed: 'shipping' }[status];
    if (current.rows[0].status !== expectedPrevious) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: `Chuyển sang ${status} chỉ áp dụng khi đơn đang ở ${expectedPrevious}` });
    }
    if (status === 'shipping') {
      const incomplete = await client.query(
        `SELECT oi.variant_id
           FROM order_items oi
          WHERE oi.order_id=$1
          GROUP BY oi.variant_id
         HAVING sum(oi.quantity) <> coalesce((
           SELECT sum(sdi.quantity) FROM stock_document_items sdi
           JOIN stock_documents sd ON sd.id=sdi.stock_document_id
           WHERE sd.type='export' AND sd.order_id=$1 AND sdi.variant_id=oi.variant_id
         ),0) LIMIT 1`,
        [req.params.orderId],
      );
      if (incomplete.rowCount) {
        await client.query('ROLLBACK');
        return res.status(409).json({ success: false, message: 'Chưa xuất đủ các sản phẩm trong phiếu kho cho đơn hàng' });
      }
    }
    const result = await client.query('UPDATE orders SET status=$1::order_status WHERE id=$2 RETURNING id,order_code,status', [status, req.params.orderId]);
    await client.query('COMMIT');
    return res.json({ success: true, data: { ...result.rows[0], id: String(result.rows[0].id) } });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return handleOrderError(error, next, res);
  } finally {
    client.release();
  }
}
