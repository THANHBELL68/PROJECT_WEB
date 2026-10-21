BEGIN;

INSERT INTO products(name, slug, description, category_id, base_price, is_visible, is_featured)
SELECT 'Áo Thun Nữ Cổ Tròn',
       'ao-thun-nu-co-tron',
       'Áo thun nữ cổ tròn tay ngắn màu trắng, dễ phối cùng trang phục hằng ngày.',
       c.id, 199000, true, false
  FROM categories c
 WHERE c.slug = 'thoi-trang-nu'
ON CONFLICT (slug) DO NOTHING;

WITH product AS (
  SELECT id FROM products WHERE slug = 'ao-thun-nu-co-tron'
),
media(url, alt_text, is_primary, sort_order) AS (
  VALUES
    ('/media/products/womens-basic-tee/01-model-detail.jpg', 'Áo thun nữ trắng mặc trên người mẫu, ảnh cận', true, 0),
    ('/media/products/womens-basic-tee/02-model-full-look.jpg', 'Toàn thân người mẫu mặc áo thun nữ trắng', false, 1)
)
INSERT INTO product_images(product_id, url, alt_text, is_primary, sort_order)
SELECT product.id, media.url, media.alt_text, media.is_primary, media.sort_order
  FROM product CROSS JOIN media
 WHERE NOT EXISTS (
   SELECT 1 FROM product_images existing
    WHERE existing.product_id = product.id AND existing.url = media.url
 );

INSERT INTO product_variants(product_id, sku, price, size_id, color_id, is_active, stock)
SELECT p.id,
       'W-TEE-' || upper(s.name) || '-TRANG',
       199000, s.id, c.id, true, 0
  FROM products p
  JOIN sizes s ON s.name IN ('S', 'M', 'L', 'XL')
  JOIN colors c ON c.name = 'Trang'
 WHERE p.slug = 'ao-thun-nu-co-tron'
ON CONFLICT (sku) DO UPDATE
  SET price = EXCLUDED.price,
      size_id = EXCLUDED.size_id,
      color_id = EXCLUDED.color_id,
      is_active = true;

COMMIT;
