UPDATE product_variants
   SET is_active = false
 WHERE product_id IN (
   SELECT id FROM products
    WHERE slug IN (
      'nu-ao-kieu-rayon-co-mo-tay-lung-3-4',
      'nam-ao-khoac-gia-long-cuu-can-gio-keo-khoa'
    )
 )
   AND color_id IS NULL;

INSERT INTO product_variants(product_id, sku, price, size_id, color_id, is_active, stock)
SELECT p.id,
       CASE WHEN p.slug = 'nu-ao-kieu-rayon-co-mo-tay-lung-3-4' THEN 'W-RAYON-' ELSE 'M-FLEECE-' END
         || upper(s.name) || '-' || upper(replace(c.name, ' ', '-')),
       199000,
       s.id,
       c.id,
       true,
       0
  FROM products p
  JOIN sizes s ON s.name IN ('S', 'M', 'L', 'XL')
 CROSS JOIN colors c
 WHERE p.slug IN (
   'nu-ao-kieu-rayon-co-mo-tay-lung-3-4',
   'nam-ao-khoac-gia-long-cuu-can-gio-keo-khoa'
 )
ON CONFLICT (sku) DO UPDATE
  SET price = EXCLUDED.price,
      size_id = EXCLUDED.size_id,
      color_id = EXCLUDED.color_id,
      is_active = true;
