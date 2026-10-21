BEGIN;

INSERT INTO colors(name, hex_code)
VALUES ('Be', '#B6A48A')
ON CONFLICT (name) DO UPDATE SET hex_code = EXCLUDED.hex_code;

INSERT INTO products(name, slug, description, category_id, base_price, is_visible, is_featured)
SELECT 'Quần Nam Chinos Dáng Gọn',
       'quan-nam-chinos-dang-gon',
       'Quần chinos nam phom dáng gọn gàng, dễ phối đồ hằng ngày. Có các màu be, đen và trắng.',
       c.id, 199000, true, false
  FROM categories c
 WHERE c.slug = 'thoi-trang-nam'
ON CONFLICT (slug) DO NOTHING;

WITH product AS (
  SELECT id FROM products WHERE slug = 'quan-nam-chinos-dang-gon'
),
media(url, alt_text, is_primary, sort_order) AS (
  VALUES
    ('/media/products/mens-chino-trousers/01-model-detail.jpg', 'Quần chinos nam màu be khi mặc', true, 0),
    ('/media/products/mens-chino-trousers/02-model-full-look.jpg', 'Toàn thân quần chinos nam màu be', false, 1),
    ('/media/products/mens-chino-trousers/03-waist-detail.jpg', 'Chi tiết cạp và túi quần chinos', false, 2),
    ('/media/products/mens-chino-trousers/04-back-detail.jpg', 'Mặt sau quần chinos nam', false, 3),
    ('/media/products/mens-chino-trousers/05-fabric-detail.jpg', 'Cận cảnh chất liệu quần chinos', false, 4),
    ('/media/products/mens-chino-trousers/06-hem-detail.jpg', 'Chi tiết gấu quần chinos', false, 5),
    ('/media/products/mens-chino-trousers/07-black-color.jpg', 'Quần chinos nam màu đen', false, 6),
    ('/media/products/mens-chino-trousers/08-beige-color.jpg', 'Quần chinos nam màu be', false, 7),
    ('/media/products/mens-chino-trousers/09-white-color.jpg', 'Quần chinos nam màu trắng', false, 8)
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
       'M-CHINO-' || upper(s.name) || '-' || upper(replace(c.name, ' ', '-')),
       199000, s.id, c.id, true, 0
  FROM products p
  JOIN sizes s ON s.name IN ('29', '30', '31')
  JOIN colors c ON c.name IN ('Be', 'Den', 'Trang')
 WHERE p.slug = 'quan-nam-chinos-dang-gon'
ON CONFLICT (sku) DO UPDATE
  SET price = EXCLUDED.price,
      size_id = EXCLUDED.size_id,
      color_id = EXCLUDED.color_id,
      is_active = true;

COMMIT;
