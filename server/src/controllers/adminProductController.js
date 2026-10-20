import { pool } from '../config/prisma.js';

const idPattern = /^[1-9]\d*$/;

function slugify(value) {
  return value.toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function conflictOrNext(error, next, res) {
  if (['23505', '23503', '23514', 'P0001'].includes(error.code)) {
    return res.status(409).json({ success: false, message: error.message });
  }
  return next(error);
}

export async function listAdminProducts(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT p.id,p.name,p.slug,p.description,p.category_id,p.base_price::text,p.is_visible,p.deleted_at,
              count(pv.id)::int AS variant_count
         FROM products p LEFT JOIN product_variants pv ON pv.product_id=p.id
        GROUP BY p.id ORDER BY p.created_at DESC LIMIT 100`,
    );
    return res.json({ success: true, data: result.rows.map((row) => ({ ...row, id: String(row.id) })) });
  } catch (error) {
    return next(error);
  }
}

export async function createProduct(req, res, next) {
  const { name, slug, description = null, categoryId, basePrice = 0, variants = [] } = req.body ?? {};
  const finalSlug = typeof slug === 'string' && slug.trim() ? slugify(slug.trim()) : (typeof name === 'string' ? slugify(name.trim()) : '');
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 255 || !finalSlug ||
      !idPattern.test(String(categoryId)) || !Number.isFinite(Number(basePrice)) || Number(basePrice) < 0 ||
      (description !== null && typeof description !== 'string') || !Array.isArray(variants) || variants.length > 100) {
    return res.status(400).json({ success: false, message: 'Thông tin sản phẩm không hợp lệ' });
  }
  for (const variant of variants) {
    if (typeof variant.sku !== 'string' || !variant.sku.trim() || !Number.isFinite(Number(variant.price)) || Number(variant.price) < 0 ||
        ['sizeId', 'colorId', 'materialId'].some((key) => variant[key] != null && !idPattern.test(String(variant[key])))) {
      return res.status(400).json({ success: false, message: 'Biến thể cần SKU, giá không âm và ID thuộc tính hợp lệ' });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const product = await client.query(
      `INSERT INTO products(name,slug,description,category_id,base_price,created_by)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING id,name,slug,category_id,base_price::text,is_visible`,
      [name.trim(), finalSlug, description, categoryId, Number(basePrice).toFixed(2), req.user.id],
    );
    for (const variant of variants) {
      await client.query(
        `INSERT INTO product_variants(product_id,sku,price,size_id,color_id,material_id,is_active)
         VALUES($1,$2,$3,$4,$5,$6,$7)`,
        [product.rows[0].id, variant.sku.trim(), Number(variant.price).toFixed(2), variant.sizeId ?? null,
          variant.colorId ?? null, variant.materialId ?? null, variant.isActive !== false],
      );
    }
    const createdVariants = await client.query(
      'SELECT id,sku,price::text,is_active FROM product_variants WHERE product_id=$1 ORDER BY id',
      [product.rows[0].id],
    );
    await client.query('COMMIT');
    return res.status(201).json({ success: true, data: { ...product.rows[0], id: String(product.rows[0].id), variants: createdVariants.rows.map((row) => ({ ...row, id: String(row.id) })) } });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    return conflictOrNext(error, next, res);
  } finally {
    client.release();
  }
}

export async function updateProduct(req, res, next) {
  const { productId } = req.params;
  if (!idPattern.test(productId)) return res.status(400).json({ success: false, message: 'productId không hợp lệ' });
  const { name, description, categoryId, isVisible } = req.body ?? {};
  const updates = [];
  const values = [productId];
  const add = (column, value) => { values.push(value); updates.push(`${column}=$${values.length}`); };
  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 255) return res.status(400).json({ success: false, message: 'name không hợp lệ' });
    add('name', name.trim());
  }
  if (description !== undefined) {
    if (description !== null && typeof description !== 'string') return res.status(400).json({ success: false, message: 'description không hợp lệ' });
    add('description', description);
  }
  if (categoryId !== undefined) {
    if (!idPattern.test(String(categoryId))) return res.status(400).json({ success: false, message: 'categoryId không hợp lệ' });
    add('category_id', categoryId);
  }
  if (isVisible !== undefined) {
    if (typeof isVisible !== 'boolean') return res.status(400).json({ success: false, message: 'isVisible phải là boolean' });
    add('is_visible', isVisible);
    if (isVisible) updates.push('deleted_at=NULL');
    else updates.push('deleted_at=coalesce(deleted_at,now())');
  }
  if (!updates.length) return res.status(400).json({ success: false, message: 'Không có trường nào để cập nhật' });
  try {
    const result = await pool.query(
      `UPDATE products SET ${updates.join(',')} WHERE id=$1 RETURNING id,name,slug,description,category_id,base_price::text,is_visible,deleted_at`,
      values,
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    return res.json({ success: true, data: { ...result.rows[0], id: String(result.rows[0].id) } });
  } catch (error) {
    return conflictOrNext(error, next, res);
  }
}

export async function updateVariant(req, res, next) {
  const { variantId } = req.params;
  if (!idPattern.test(variantId)) return res.status(400).json({ success: false, message: 'variantId không hợp lệ' });
  const { price, isActive } = req.body ?? {};
  if (price === undefined && isActive === undefined) return res.status(400).json({ success: false, message: 'Cần price hoặc isActive' });
  if (price !== undefined && (!Number.isFinite(Number(price)) || Number(price) < 0)) return res.status(400).json({ success: false, message: 'price phải là số không âm' });
  if (isActive !== undefined && typeof isActive !== 'boolean') return res.status(400).json({ success: false, message: 'isActive phải là boolean' });
  const values = [variantId];
  const updates = [];
  if (price !== undefined) { values.push(Number(price).toFixed(2)); updates.push(`price=$${values.length}`); }
  if (isActive !== undefined) { values.push(isActive); updates.push(`is_active=$${values.length}`); }
  try {
    const result = await pool.query(
      `UPDATE product_variants SET ${updates.join(',')} WHERE id=$1 RETURNING id,product_id,sku,price::text,is_active`,
      values,
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Không tìm thấy biến thể' });
    return res.json({ success: true, data: { ...result.rows[0], id: String(result.rows[0].id), product_id: String(result.rows[0].product_id) } });
  } catch (error) {
    return conflictOrNext(error, next, res);
  }
}

export async function hideProduct(req, res, next) {
  const { productId } = req.params;
  if (!idPattern.test(productId)) return res.status(400).json({ success: false, message: 'productId không hợp lệ' });
  try {
    const result = await pool.query(
      'UPDATE products SET is_visible=false,deleted_at=coalesce(deleted_at,now()) WHERE id=$1 RETURNING id,name,is_visible,deleted_at',
      [productId],
    );
    if (!result.rowCount) return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    return res.json({ success: true, data: { ...result.rows[0], id: String(result.rows[0].id) } });
  } catch (error) {
    return next(error);
  }
}
