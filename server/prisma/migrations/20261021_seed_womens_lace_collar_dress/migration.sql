BEGIN;

INSERT INTO colors(name, hex_code)
VALUES ('Kem sọc', '#EDE6DB'), ('Xanh nhạt sọc', '#DDEAF7')
ON CONFLICT (name) DO UPDATE SET hex_code = EXCLUDED.hex_code;

INSERT INTO products(name, slug, description, category_id, base_price, is_visible, is_featured)
SELECT 'Đầm Nữ Cổ Ren Kẻ Sọc',
       'dam-nu-co-ren-ke-soc',
       'Đầm nữ cổ ren, tay ngắn, dáng xòe với họa tiết sọc nhẹ nhàng. Có màu kem và xanh nhạt.',
       c.id, 199000, true, false
  FROM categories c
 WHERE c.slug = 'thoi-trang-nu'
ON CONFLICT (slug) DO NOTHING;

WITH product AS (
  SELECT id FROM products WHERE slug = 'dam-nu-co-ren-ke-soc'
),
media(url, alt_text, is_primary, sort_order) AS (
  VALUES
    ('/media/products/womens-lace-collar-dress/01-cream-stripe.jpg', 'Đầm nữ cổ ren kẻ sọc màu kem', true, 0),
    ('/media/products/womens-lace-collar-dress/02-light-blue-stripe.jpg', 'Đầm nữ cổ ren kẻ sọc màu xanh nhạt', false, 1)
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
       'W-LACE-DRESS-' || upper(s.name) || '-' || upper(replace(c.name, ' ', '-')),
       199000, s.id, c.id, true, 0
  FROM products p
  JOIN sizes s ON s.name IN ('S', 'M', 'L', 'XL')
  JOIN colors c ON c.name IN ('Kem sọc', 'Xanh nhạt sọc')
 WHERE p.slug = 'dam-nu-co-ren-ke-soc'
ON CONFLICT (sku) DO UPDATE
  SET price = EXCLUDED.price,
      size_id = EXCLUDED.size_id,
      color_id = EXCLUDED.color_id,
      is_active = true;

COMMIT;
