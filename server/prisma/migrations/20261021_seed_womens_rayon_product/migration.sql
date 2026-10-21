INSERT INTO categories(name, slug)
VALUES ('Thời trang nữ', 'thoi-trang-nu')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products(name, slug, description, category_id, base_price, is_visible, is_featured)
SELECT 'Nữ Áo Kiểu Vải Rayon Cổ Mở - Tay Lửng 3-4',
       'nu-ao-kieu-rayon-co-mo-tay-lung-3-4',
       'Sản phẩm nữ. Chưa thiết lập giá và biến thể bán hàng.',
       c.id, 0, false, false
  FROM categories c
 WHERE c.slug = 'thoi-trang-nu'
ON CONFLICT (slug) DO NOTHING;

WITH product AS (
  SELECT id FROM products WHERE slug = 'nu-ao-kieu-rayon-co-mo-tay-lung-3-4'
),
media(url, alt_text, is_primary, sort_order) AS (
  VALUES
    ('/media/products/womens-rayon-blouse/vngoods_00_479073_3x4.avif', 'Ảnh chính sản phẩm nữ', true, 0),
    ('/media/products/womens-rayon-blouse/goods_479073_sub14_3x4.avif', 'Ảnh chi tiết sản phẩm nữ', false, 1),
    ('/media/products/womens-rayon-blouse/vngoods_10_479073_3x4.avif', 'Ảnh chi tiết sản phẩm nữ', false, 2),
    ('/media/products/womens-rayon-blouse/vngoods_479073_sub3_3x4.avif', 'Ảnh chi tiết sản phẩm nữ', false, 3),
    ('/media/products/womens-rayon-blouse/rayon-blouse-uniqlo.mp4', 'Video áo kiểu vải Rayon cổ mở tay lửng', false, 4),
    ('/media/products/womens-rayon-blouse/womens-fashion-video.mp4', 'Video thời trang nữ', false, 5),
    ('/media/products/womens-rayon-blouse/video-intro.mp4', 'Video giới thiệu sản phẩm', false, 6)
)
INSERT INTO product_images(product_id, url, alt_text, is_primary, sort_order)
SELECT product.id, media.url, media.alt_text, media.is_primary, media.sort_order
  FROM product CROSS JOIN media
 WHERE NOT EXISTS (
   SELECT 1 FROM product_images existing
    WHERE existing.product_id = product.id AND existing.url = media.url
 );
