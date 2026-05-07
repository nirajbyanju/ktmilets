import type { Metadata } from 'next';
import { absoluteUrl, authNoIndexMetadata } from '@/helper/seo/site';

export const metadata: Metadata = {
  ...authNoIndexMetadata,
  title: 'Reset Password',
  description: 'Reset your Samriddhi Real Estate account password.',
  alternates: {
    canonical: absoluteUrl('/reset-password'),
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
