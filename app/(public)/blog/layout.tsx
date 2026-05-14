import type { Metadata } from 'next';
import { buildPageMetadata } from '@/helper/seo/site';

export const metadata: Metadata = buildPageMetadata({
  title: 'KTM Test Prep Blog',
  description:
    'Read KTM Test Preparation Centre insights on IELTS, PTE, mock-test practice, exam booking support, and online classes.',
  path: '/blog',
  keywords: [
    'IELTS blog Nepal',
    'PTE blog Nepal',
    'KTM Test Preparation Centre blog',
    'IELTS online class Nepal',
    'PTE online class Nepal',
  ],
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
