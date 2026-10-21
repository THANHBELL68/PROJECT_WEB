INSERT INTO product_variants(product_id, sku, price, size_id, is_active, stock)
SELECT p.id,
       'W-RAYON-' || upper(s.name),
       199000,
       s.id,
       true,
       0
  FROM products p
  JOIN sizes s ON s.name IN ('S', 'M', 'L', 'XL')
 WHERE p.slug = 'nu-ao-kieu-rayon-co-mo-tay-lung-3-4'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO product_variants(product_id, sku, price, size_id, is_active, stock)
SELECT p.id,
       'M-FLEECE-' || upper(s.name),
       199000,
       s.id,
       true,
       0
  FROM products p
  JOIN sizes s ON s.name IN ('S', 'M', 'L', 'XL')
 WHERE p.slug = 'nam-ao-khoac-gia-long-cuu-can-gio-keo-khoa'
ON CONFLICT (sku) DO NOTHING;
