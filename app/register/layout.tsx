import type { Metadata } from 'next';
import { absoluteUrl, authNoIndexMetadata } from '@/helper/seo/site';

export const metadata: Metadata = {
  ...authNoIndexMetadata,
  title: 'Register',
  description: 'Create your KTM Test Prep account.',
  alternates: {
    canonical: absoluteUrl('/register'),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
