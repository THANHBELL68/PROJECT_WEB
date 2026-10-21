UPDATE products
   SET is_visible = true,
       description = 'Sản phẩm mới, giá và lựa chọn kích thước/màu sắc sẽ được cập nhật sớm.'
 WHERE slug IN (
   'nu-ao-kieu-rayon-co-mo-tay-lung-3-4',
   'nam-ao-khoac-gia-long-cuu-can-gio-keo-khoa'
 );
