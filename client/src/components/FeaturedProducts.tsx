import Link from 'next/link';

const highlights = [
  { image: '/aether-favorites-colors.jpg', alt: 'Áo nỉ với nhiều màu sắc', number: '01', title: 'Màu sắc nổi bật' },
  { image: '/aether-favorites-accessories.jpg', alt: 'Thắt lưng, đồng hồ và nước hoa', number: '02', title: 'Chi tiết tạo khác biệt' },
  { image: '/aether-favorites-essentials.jpg', alt: 'Các thiết kế trang phục thường ngày', number: '03', title: 'Thiết yếu mỗi ngày' },
];

export function FeaturedProducts() {
  return <div className="favorites-grid">
    {highlights.map((item) => <Link className="favorite-card" href="/products" key={item.number}>
      <img src={item.image} alt={item.alt} />
      <span className="favorite-number">{item.number} / AETHER EDIT</span>
      <div className="favorite-copy"><h3>{item.title}</h3><span>Khám phá sản phẩm <b>↗</b></span></div>
    </Link>)}
  </div>;
}
