import { randomBytes } from 'node:crypto';
import { pool } from '../config/prisma.js';

const idPattern = /^[1-9]\d*$/;
const documentTypes = new Set(['import', 'export']);

export async function listInventory(req, res, next) {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 200);
  const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);
  const search = typeof req.query.q === 'string' && req.query.q.trim() ? req.query.q.trim() : null;
  try {
    const result = await pool.query(
      `SELECT i.variant_id, pv.sku, p.id AS product_id, p.name AS product_name,
              concat_ws(' / ',s.name,c.name,m.name) AS variant_label,
              i.quantity_on_hand, i.quantity_reserved,
              greatest(i.quantity_on_hand-i.quantity_reserved,0) AS available,
              i.updated_at
         FROM inventories i JOIN product_variants pv ON pv.id=i.variant_id
         JOIN products p ON p.id=pv.product_id
         LEFT JOIN sizes s ON s.id=pv.size_id
         LEFT JOIN colors c ON c.id=pv.color_id
         LEFT JOIN materials m ON m.id=pv.material_id
        WHERE ($1::text IS NULL OR p.name ILIKE '%'||$1||'%' OR pv.sku ILIKE '%'||$1||'%')
        ORDER BY p.name,pv.sku LIMIT $2 OFFSET $3`,
      [search, limit, offset],
    );
    return res.json({ success: true, data: result.rows.map((row) => ({ ...row, variant_id: String(row.variant_id), product_id: String(row.product_id) })) });
  } catch (error) {
    return next(error);
  }
}

export async function listStockDocuments(req, res, next) {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 30, 1), 100);
  const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);
  try {
    const result = await pool.query(
      `SELECT sd.id,sd.code,sd.type,sd.order_id,sd.supplier_id,sd.created_by,sd.note,sd.created_at,
              count(sdi.id)::int AS line_count,coalesce(sum(sdi.quantity),0)::int AS item_quantity
         FROM stock_documents sd LEFT JOIN stock_document_items sdi ON sdi.stock_document_id=sd.id
        GROUP BY sd.id ORDER BY sd.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    return res.json({ success: true, data: result.rows.map((row) => ({ ...row, id: String(row.id), order_id: row.order_id == null ? null : String(row.order_id), created_by: String(row.created_by) })) });
  } catch (error) {
    return next(error);
  }
}

export async function getStockDocument(req, res, next) {
  if (!idPattern.test(req.params.documentId)) return res.status(400).json({ success: false, message: 'documentId không hợp lệ' });
  try {
    const result = await pool.query(
      `SELECT sd.id,sd.code,sd.type,sd.order_id,sd.supplier_id,sd.shipping_carrier_id,sd.created_by,sd.note,sd.created_at,
              coalesce(jsonb_agg(jsonb_build_object('id',sdi.id,'variantId',sdi.variant_id,'sku',pv.sku,
                'productName',p.name,'quantity',sdi.quantity,'unitCost',sdi.unit_cost::text)
                ORDER BY sdi.id) FILTER (WHERE sdi.id IS NOT NULL),'[]'::jsonb) AS items
         FROM stock_documents sd LEFT JOIN stock_document_items sdi ON sdi.stock_document_id=sd.id
         LEFT JOIN product_variants pv ON pv.id=sdi.variant_id LEFT JOIN products p ON p.id=pv.product_id
        WHERE sd.id=$1 GROUP BY sd.id`,
      [req.params.documentId],
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu kho' });
    const row = result.rows[0];
    return res.json({ success: true, data: { ...row, id: String(row.id), order_id: row.order_id == null ? null : String(row.order_id) } });
  } catch (error) {
    return next(error);
  }
}

export async function createStockDocument(req, res, next) {
  const { type, supplierId = null, orderId = null, shippingCarrierId = null, note = null, items } = req.body ?? {};
  if (!documentTypes.has(type) || !Array.isArray(items) || items.length < 1 || items.length > 100 ||
      (note !== null && (typeof note !== 'string' || note.length > 1000))) {
    return res.status(400).json({ success: false, message: 'Thông tin phiếu kho không hợp lệ (chỉ hỗ trợ import/export, 1–100 dòng)' });
  }
  if ((supplierId !== null && !idPattern.test(String(supplierId))) ||
      (orderId !== null && !idPattern.test(String(orderId))) ||
      (shippingCarrierId !== null && !idPattern.test(String(shippingCarrierId)))) {
    return res.status(400).json({ success: false, message: 'supplierId, orderId hoặc shippingCarrierId không hợp lệ' });
  }
  if (type === 'import' && (orderId !== null || shippingCarrierId !== null)) {
    return res.status(400).json({ success: false, message: 'Phiếu nhập không nhận orderId/shippingCarrierId' });
  }
  if (type === 'export' && supplierId !== null) {
    return res.status(400).json({ success: false, message: 'Phiếu xuất không nhận supplierId' });
  }
  for (const item of items) {
    if (!idPattern.test(String(item?.variantId)) || !Number.isSafeInteger(item?.quantity) || item.quantity < 1 ||
        (item.unitCost != null && (!Number.isFinite(Number(item.unitCost)) || Number(item.unitCost) < 0))) {
      return res.status(400).json({ success: false, message: 'Mỗi dòng cần variantId, quantity dương và unitCost không âm' });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.user_id',$1,true)", [String(req.user.id)]);
    const prefix = type === 'import' ? 'IMP' : 'EXP';
    const code = `${prefix}-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`;
    const document = await client.query(
      `INSERT INTO stock_documents(code,type,supplier_id,order_id,shipping_carrier_id,created_by,note)
       VALUES($1,$2::stock_document_type,$3,$4,$5,$6,$7)
       RETURNING id,code,type,order_id,supplier_id,created_at`,
      [code, type, supplierId, orderId, shippingCarrierId, req.user.id, note?.trim() || null],
    );
    for (const item of items) {
      await client.query(
        `INSERT INTO stock_document_items(stock_document_id,variant_id,quantity,unit_cost)
         VALUES($1,$2,$3,$4)`,
        [document.rows[0].id, item.variantId, item.quantity, item.unitCost ?? null],
      );
    }
    const lines = await client.query(
      `SELECT sdi.variant_id,pv.sku,p.name AS product_name,sdi.quantity,sdi.unit_cost::text AS unit_cost
         FROM stock_document_items sdi JOIN product_variants pv ON pv.id=sdi.variant_id
         JOIN products p ON p.id=pv.product_id WHERE sdi.stock_document_id=$1 ORDER BY sdi.id`,
      [document.rows[0].id],
    );
    await client.query('COMMIT');
    return res.status(201).json({ success: true, data: { ...document.rows[0], id: String(document.rows[0].id), order_id: document.rows[0].order_id == null ? null : String(document.rows[0].order_id), items: lines.rows.map((row) => ({ ...row, variant_id: String(row.variant_id) })) } });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (['P0001', '23514', '23503', '23505'].includes(error.code)) {
      return res.status(409).json({ success: false, message: error.message });
    }
    return next(error);
  } finally {
    client.release();
  }
}
