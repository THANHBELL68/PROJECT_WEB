UPDATE products
   SET base_price = 199000,
       description = 'Thiết kế thời trang thường ngày. Giá bán 199.000₫.'
 WHERE slug IN (
   'nu-ao-kieu-rayon-co-mo-tay-lung-3-4',
   'nam-ao-khoac-gia-long-cuu-can-gio-keo-khoa'
 );
