import type { Metadata } from 'next';
import siteMetadata from '@/data/siteMetadata';
import { ktmContact, ktmSocials } from '@/data/ktm';

export const COMPANY_NAME = siteMetadata.title;
export const COMPANY_DESCRIPTION = siteMetadata.description;
export const COMPANY_PHONE = ktmContact.phone;
export const COMPANY_EMAIL = siteMetadata.email;
export const COMPANY_ADDRESS = ktmContact.address;
export const COMPANY_HOURS = ['Su-Fr 08:00-17:00'];

type MetadataConfig = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: 'website' | 'article';
  images?: string[];
};

export type BreadcrumbItem = {
  name: string;
  path: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

const normalizePath = (path: string) => {
  if (!path || path === '/') {
    return '/';
  }

  return path.startsWith('/') ? path : `/${path}`;
};

export const absoluteUrl = (path: string = '/') =>
  new URL(normalizePath(path), siteMetadata.siteUrl).toString();

const normalizeImage = (image: string) =>
  image.startsWith('http') ? image : absoluteUrl(image);

export const buildPageMetadata = ({
  title,
  description,
  path,
  keywords = [],
  type = 'website',
  images,
}: MetadataConfig): Metadata => {
  const openGraphImages = (images?.length ? images : [siteMetadata.socialBanner]).map(normalizeImage);
  const fullTitle = `${title} | ${COMPANY_NAME}`;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: absoluteUrl(path),
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: absoluteUrl(path),
      siteName: COMPANY_NAME,
      locale: siteMetadata.locale,
      type,
      images: openGraphImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: openGraphImages,
    },
  };
};

export const buildSchemaGraph = (...items: Array<Record<string, unknown>>) => ({
  '@context': 'https://schema.org',
  '@graph': items.map((item) => {
    const nextItem = { ...item };
    delete nextItem['@context'];
    return nextItem;
  }),
});

export const organizationSchema = {
  '@type': 'EducationalOrganization',
  '@id': `${siteMetadata.siteUrl}#organization`,
  name: COMPANY_NAME,
  url: siteMetadata.siteUrl,
  description: COMPANY_DESCRIPTION,
  logo: absoluteUrl(siteMetadata.siteLogo),
  image: absoluteUrl(siteMetadata.siteLogo),
  telephone: COMPANY_PHONE,
  email: COMPANY_EMAIL,
  areaServed: ['Nepal', 'Kathmandu', 'Students abroad'],
  address: {
    '@type': 'PostalAddress',
    streetAddress: ktmContact.address,
    addressLocality: 'Kathmandu',
    addressCountry: 'NP',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: COMPANY_PHONE,
      email: COMPANY_EMAIL,
      contactType: 'customer support',
      areaServed: 'NP',
      availableLanguage: ['en', 'ne'],
    },
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:00',
    },
  ],
  sameAs: ktmSocials.map((social) => social.href),
};

export const websiteSchema = {
  '@type': 'WebSite',
  '@id': `${siteMetadata.siteUrl}#website`,
  url: siteMetadata.siteUrl,
  name: COMPANY_NAME,
  description: COMPANY_DESCRIPTION,
  publisher: {
    '@id': `${siteMetadata.siteUrl}#organization`,
  },
  inLanguage: 'en-NP',
  potentialAction: {
    '@type': 'RegisterAction',
    target: absoluteUrl('/registration'),
    name: 'Register for IELTS or PTE online class',
  },
};

export const buildBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const buildAboutPageSchema = (description: string) => ({
  '@type': 'AboutPage',
  '@id': `${absoluteUrl('/about')}#webpage`,
  url: absoluteUrl('/about'),
  name: `About Us | ${COMPANY_NAME}`,
  description,
  isPartOf: {
    '@id': `${siteMetadata.siteUrl}#website`,
  },
  about: {
    '@id': `${siteMetadata.siteUrl}#organization`,
  },
});

export const buildContactPageSchema = (description: string) => ({
  '@type': 'ContactPage',
  '@id': `${absoluteUrl('/contact')}#webpage`,
  url: absoluteUrl('/contact'),
  name: `Contact Us | ${COMPANY_NAME}`,
  description,
  isPartOf: {
    '@id': `${siteMetadata.siteUrl}#website`,
  },
  about: {
    '@id': `${siteMetadata.siteUrl}#organization`,
  },
  mainEntity: {
    '@id': `${siteMetadata.siteUrl}#organization`,
  },
});

export const buildFaqSchema = (items: FaqItem[]) => ({
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

type BlogPostSchemaConfig = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  authorName?: string | null;
  category?: string | null;
  keywords?: string[];
};

type PropertySchemaConfig = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  price?: number | string | null;
  currency?: string | null;
  listingType?: string | null;
  propertyType?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  address?: {
    streetAddress?: string | null;
    addressLocality?: string | null;
    addressRegion?: string | null;
    postalCode?: string | null;
    addressCountry?: string | null;
  };
  landArea?: number | string | null;
  landUnit?: string | null;
};

export const buildBlogPostingSchema = ({
  title,
  description,
  path,
  image,
  publishedAt,
  updatedAt,
  authorName,
  category,
  keywords = [],
}: BlogPostSchemaConfig) => ({
  '@type': 'BlogPosting',
  '@id': `${absoluteUrl(path)}#article`,
  mainEntityOfPage: absoluteUrl(path),
  headline: title,
  description,
  image: image ? [normalizeImage(image)] : undefined,
  datePublished: publishedAt || undefined,
  dateModified: updatedAt || publishedAt || undefined,
  articleSection: category || undefined,
  keywords: keywords.length > 0 ? keywords.join(', ') : undefined,
  author: {
    '@type': 'Person',
    name: authorName || COMPANY_NAME,
  },
  publisher: {
    '@id': `${siteMetadata.siteUrl}#organization`,
  },
});

type WebPageSchemaConfig = {
  title: string;
  description: string;
  path: string;
  type?: string;
};

export const buildWebPageSchema = ({
  title,
  description,
  path,
  type = 'WebPage',
}: WebPageSchemaConfig) => ({
  '@type': type,
  '@id': `${absoluteUrl(path)}#webpage`,
  url: absoluteUrl(path),
  name: `${title} | ${COMPANY_NAME}`,
  description,
  isPartOf: {
    '@id': `${siteMetadata.siteUrl}#website`,
  },
  about: {
    '@id': `${siteMetadata.siteUrl}#organization`,
  },
});

export const buildPropertyListingSchema = ({
  title,
  description,
  path,
  image,
  price,
  currency,
  listingType,
  propertyType,
  publishedAt,
  updatedAt,
  address,
  landArea,
  landUnit,
}: PropertySchemaConfig) => ({
  '@type': 'RealEstateListing',
  '@id': `${absoluteUrl(path)}#listing`,
  url: absoluteUrl(path),
  name: title,
  description,
  image: image ? [normalizeImage(image)] : undefined,
  datePosted: publishedAt || undefined,
  dateModified: updatedAt || publishedAt || undefined,
  category: [listingType, propertyType].filter(Boolean).join(' | ') || undefined,
  mainEntity: {
    '@type': 'Residence',
    name: title,
    description,
    address: address
      ? {
          '@type': 'PostalAddress',
          streetAddress: address.streetAddress || undefined,
          addressLocality: address.addressLocality || undefined,
          addressRegion: address.addressRegion || undefined,
          postalCode: address.postalCode || undefined,
          addressCountry: address.addressCountry || 'NP',
        }
      : undefined,
    floorSize:
      landArea !== null && landArea !== undefined && landArea !== ''
        ? {
            '@type': 'QuantitativeValue',
            value: landArea,
            unitText: landUnit || undefined,
          }
        : undefined,
  },
  offers:
    price !== null && price !== undefined && price !== ''
      ? {
          '@type': 'Offer',
          price,
          priceCurrency: currency || 'NPR',
          availability: 'https://schema.org/InStock',
        }
      : undefined,
});

export const authNoIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-snippet': 0,
      'max-image-preview': 'none',
      'max-video-preview': 0,
    },
  },
};
