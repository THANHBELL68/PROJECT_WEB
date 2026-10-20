import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <><Header /><div className="shop-content">{children}</div><Footer /></>;
}
