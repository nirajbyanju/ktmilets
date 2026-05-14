import type { Metadata } from 'next';
import { absoluteUrl, authNoIndexMetadata } from '@/helper/seo/site';

export const metadata: Metadata = {
  ...authNoIndexMetadata,
  title: 'Forgot Password',
  description: 'Request a password reset for your KTM Test Prep account.',
  alternates: {
    canonical: absoluteUrl('/forgot-password'),
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
