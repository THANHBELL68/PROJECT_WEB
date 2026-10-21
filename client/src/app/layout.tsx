import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { FashionChatbot } from '@/components/FashionChatbot';

export const metadata: Metadata = {
  title: 'AETHER — Thời trang thiết yếu mỗi ngày',
  description: 'Khám phá thời trang AETHER với thiết kế tinh giản, chất liệu dễ chịu và phom dáng dành cho mọi ngày.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body><Providers>{children}<FashionChatbot /></Providers></body></html>;
}
