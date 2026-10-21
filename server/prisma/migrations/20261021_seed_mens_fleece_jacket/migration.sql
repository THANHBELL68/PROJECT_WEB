INSERT INTO categories(name, slug)
VALUES ('Thời trang nam', 'thoi-trang-nam')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products(name, slug, description, category_id, base_price, is_visible, is_featured)
SELECT 'Nam Áo Khoác Giả Lông Cừu Cản Gió Kéo Khóa',
       'nam-ao-khoac-gia-long-cuu-can-gio-keo-khoa',
       'Sản phẩm nam. Chưa thiết lập giá và biến thể bán hàng.',
       c.id, 0, false, false
  FROM categories c
 WHERE c.slug = 'thoi-trang-nam'
ON CONFLICT (slug) DO NOTHING;

WITH product AS (
  SELECT id FROM products WHERE slug = 'nam-ao-khoac-gia-long-cuu-can-gio-keo-khoa'
),
media(url, alt_text, is_primary, sort_order) AS (
  VALUES
    ('/media/products/mens-fleece-windproof-jacket/vngoods_69_486116_3x4.avif', 'Ảnh chính áo khoác nam', true, 0),
    ('/media/products/mens-fleece-windproof-jacket/goods_486116_sub11_3x4.avif', 'Ảnh chi tiết áo khoác nam', false, 1),
    ('/media/products/mens-fleece-windproof-jacket/goods_486116_sub20_3x4.avif', 'Ảnh chi tiết áo khoác nam', false, 2),
    ('/media/products/mens-fleece-windproof-jacket/vngoods_486116_sub3_3x4.avif', 'Ảnh chi tiết áo khoác nam', false, 3),
    ('/media/products/mens-fleece-windproof-jacket/vngoods_486116_sub4_3x4.avif', 'Ảnh chi tiết áo khoác nam', false, 4),
    ('/media/products/mens-fleece-windproof-jacket/fleece-windproof-jacket.mp4', 'Video áo khoác giả lông cừu cản gió kéo khóa', false, 5),
    ('/media/products/mens-fleece-windproof-jacket/video-intro.mp4', 'Video giới thiệu áo khoác nam', false, 6)
)
INSERT INTO product_images(product_id, url, alt_text, is_primary, sort_order)
SELECT product.id, media.url, media.alt_text, media.is_primary, media.sort_order
  FROM product CROSS JOIN media
 WHERE NOT EXISTS (
   SELECT 1 FROM product_images existing
    WHERE existing.product_id = product.id AND existing.url = media.url
 );
