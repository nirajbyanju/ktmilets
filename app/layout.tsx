import siteMetadata from '@/data/siteMetadata'
import type { Metadata, Viewport } from 'next'
import "@/styles/globals.scss";
import SectionContainer from "@/components/SectionContainer";
import ToastProvider from "./providers";
import QueryProvider from "./QueryProvider";
import StructuredData from '@/components/seo/StructuredData';
import { absoluteUrl, buildSchemaGraph, organizationSchema, websiteSchema } from '@/helper/seo/site';

const basePath = process.env.BASE_PATH || ''

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  applicationName: siteMetadata.title,
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  keywords: [
    'KTM Test Preparation Centre',
    'KTM Test Prep',
    'IELTS online class Nepal',
    'PTE online class Nepal',
    'computer based IELTS Nepal',
    'Alfa IELTS mock test',
    'Alfa PTE mock test',
  ],
  authors: [{ name: siteMetadata.author }],
  creator: siteMetadata.author,
  publisher: siteMetadata.title,
  category: 'Education',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: absoluteUrl('/'),
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: absoluteUrl('/'),
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
    },
  },
  icons: {
    apple: `${basePath}/apple-icon.png`,
    icon: [
      {
        url: `${basePath}/web-app-manifest-192x192.png`,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: `${basePath}/web-app-manifest-512x512.png`,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: `${basePath}/icon0.svg`,
        color: '#5bbad5',
      },
    ],
  },
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    title: 'KTM Test Prep',
    statusBarStyle: 'default',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    description: siteMetadata.description,
    images: [siteMetadata.socialBanner],
  },
  other: {
    'msapplication-TileColor': '#000000',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7FAFC' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1F4D' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={siteMetadata.language}
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <StructuredData data={buildSchemaGraph(organizationSchema, websiteSchema)} />
        <ToastProvider>
          <QueryProvider>
            <SectionContainer>
              <main className="mb-auto">{children}</main>
            </SectionContainer>
            {/* {process.env.NODE_ENV === "development" && <AuthDebugger />} */}
          </QueryProvider>
        </ToastProvider>
      </body >
    </html >
  )
}
