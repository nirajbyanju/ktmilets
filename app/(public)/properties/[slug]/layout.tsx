import type { Metadata } from 'next';
import StandardPageStructuredData from '@/components/seo/StandardPageStructuredData';
import {
  COMPANY_NAME,
  absoluteUrl,
  buildPropertyListingSchema,
} from '@/helper/seo/site';
import { getSeoPropertyDetail } from '@/helper/seo/publicApi';

type LayoutParams = {
  slug: string;
};

const resolveParams = async (
  params: Promise<LayoutParams> | LayoutParams
): Promise<LayoutParams> => Promise.resolve(params);

export async function generateMetadata({
  params,
}: {
  params: Promise<LayoutParams> | LayoutParams;
}): Promise<Metadata> {
  const { slug } = await resolveParams(params);
  const property = await getSeoPropertyDetail(slug);

  if (!property) {
    return {
      title: `Property Detail | ${COMPANY_NAME}`,
      description: 'Explore verified property details from Samriddhi Real Estate.',
      alternates: {
        canonical: absoluteUrl(`/properties/${slug}`),
      },
    };
  }

  const title = property.seoTitle || property.title;
  const description =
    property.seoDescription ||
    property.description ||
    'Explore verified property details from Samriddhi Real Estate.';
  const canonicalPath = `/properties/${property.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
    },
    openGraph: {
      title: `${title} | ${COMPANY_NAME}`,
      description,
      type: 'website',
      url: absoluteUrl(canonicalPath),
      images: property.image ? [property.image] : undefined,
    },
    twitter: {
      card: property.image ? 'summary_large_image' : 'summary',
      title: `${title} | ${COMPANY_NAME}`,
      description,
      images: property.image ? [property.image] : undefined,
    },
  };
}

export default async function PropertyDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams> | LayoutParams;
}) {
  const { slug } = await resolveParams(params);
  const property = await getSeoPropertyDetail(slug);

  if (!property) {
    return <>{children}</>;
  }

  const canonicalPath = `/properties/${property.slug}`;

  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Properties', path: '/properties-list' },
          { name: property.title, path: canonicalPath },
        ]}
        schemas={[
          buildPropertyListingSchema({
            title: property.title,
            description: property.seoDescription || property.description,
            path: canonicalPath,
            image: property.image,
            price: property.price,
            currency: property.currency,
            listingType: property.listingType,
            propertyType: property.propertyType,
            publishedAt: property.publishedAt,
            updatedAt: property.updatedAt,
            landArea: property.landArea,
            landUnit: property.landUnit,
            address: property.address,
          }),
        ]}
      />
      {children}
    </>
  );
}
