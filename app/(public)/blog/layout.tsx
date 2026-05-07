import type { Metadata } from 'next';
import { buildPageMetadata } from '@/helper/seo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'Real Estate Blog',
  description:
    'Read Samriddhi Real Estate insights on buying, selling, investing, pricing, and property trends in Nepal.',
  path: '/blog',
  keywords: [
    'real estate blog Nepal',
    'property market Nepal',
    'Samriddhi Real Estate blog',
    'buy property guide Nepal',
    'real estate investment Nepal',
  ],
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
