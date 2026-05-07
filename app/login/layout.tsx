import type { Metadata } from 'next';
import { absoluteUrl, authNoIndexMetadata } from '@/helper/seo/site';

export const metadata: Metadata = {
  ...authNoIndexMetadata,
  title: 'Login',
  description: 'Sign in to your Samriddhi Real Estate account.',
  alternates: {
    canonical: absoluteUrl('/login'),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
