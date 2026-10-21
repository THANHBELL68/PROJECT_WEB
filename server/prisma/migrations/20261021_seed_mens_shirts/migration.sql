BEGIN;

INSERT INTO colors(name, hex_code)
VALUES ('Navy', '#182338'), ('Be', '#A89A80'), ('Kem', '#F1ECDD')
ON CONFLICT (name) DO UPDATE SET hex_code = EXCLUDED.hex_code;

INSERT INTO products(name, slug, description, category_id, base_price, is_visible, is_featured)
SELECT 'Áo Polo Nam Basic', 'ao-polo-nam-basic',
       'Áo polo nam tay ngắn, phom dáng gọn gàng, có các màu navy, trắng, be và đen.',
       c.id, 199000, true, false
  FROM categories c WHERE c.slug = 'thoi-trang-nam'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products(name, slug, description, category_id, base_price, is_visible, is_featured)
SELECT 'Áo Thun Nam In Hình', 'ao-thun-nam-in-hinh',
       'Áo thun nam tay ngắn in hình, có màu kem và đen.',
       c.id, 199000, true, false
  FROM categories c WHERE c.slug = 'thoi-trang-nam'
ON CONFLICT (slug) DO NOTHING;

WITH products_to_seed(slug, url, alt_text, is_primary, sort_order) AS (
  VALUES
    ('ao-polo-nam-basic', '/media/products/mens-basic-polo/01-navy-front.jpg', 'Áo polo nam màu navy', true, 0),
    ('ao-polo-nam-basic', '/media/products/mens-basic-polo/02-white-front.jpg', 'Áo polo nam màu trắng', false, 1),
    ('ao-polo-nam-basic', '/media/products/mens-basic-polo/03-beige-front.jpg', 'Áo polo nam màu be', false, 2),
    ('ao-polo-nam-basic', '/media/products/mens-basic-polo/04-black-front.jpg', 'Áo polo nam màu đen', false, 3),
    ('ao-thun-nam-in-hinh', '/media/products/mens-graphic-tee/01-cream-front.jpg', 'Mặt trước áo thun nam màu kem', true, 0),
    ('ao-thun-nam-in-hinh', '/media/products/mens-graphic-tee/02-cream-back.jpg', 'Mặt sau áo thun nam màu kem', false, 1),
    ('ao-thun-nam-in-hinh', '/media/products/mens-graphic-tee/03-black-front.jpg', 'Áo thun nam in hình màu đen', false, 2)
)
INSERT INTO product_images(product_id, url, alt_text, is_primary, sort_order)
SELECT p.id, s.url, s.alt_text, s.is_primary, s.sort_order
  FROM products_to_seed s
  JOIN products p ON p.slug = s.slug
 WHERE NOT EXISTS (
   SELECT 1 FROM product_images existing
    WHERE existing.product_id = p.id AND existing.url = s.url
 );

INSERT INTO product_variants(product_id, sku, price, size_id, color_id, is_active, stock)
SELECT p.id,
       CASE WHEN p.slug = 'ao-polo-nam-basic' THEN 'M-POLO-' ELSE 'M-TEE-' END
         || upper(s.name) || '-' || upper(replace(c.name, ' ', '-')),
       199000, s.id, c.id, true, 0
  FROM products p
  JOIN sizes s ON s.name IN ('S', 'M', 'L', 'XL')
  JOIN colors c ON (p.slug = 'ao-polo-nam-basic' AND c.name IN ('Navy', 'Trang', 'Be', 'Den'))
                 OR (p.slug = 'ao-thun-nam-in-hinh' AND c.name IN ('Kem', 'Den'))
 WHERE p.slug IN ('ao-polo-nam-basic', 'ao-thun-nam-in-hinh')
ON CONFLICT (sku) DO UPDATE
  SET price = EXCLUDED.price,
      size_id = EXCLUDED.size_id,
      color_id = EXCLUDED.color_id,
      is_active = true;

COMMIT;
