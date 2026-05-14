import type { Metadata } from 'next';
import StandardPageStructuredData from '@/components/seo/StandardPageStructuredData';
import {
  COMPANY_NAME,
  buildBlogPostingSchema,
  absoluteUrl,
} from '@/helper/seo/site';
import { getSeoBlogDetail } from '@/helper/seo/publicApi';

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
  const blog = await getSeoBlogDetail(slug);

  if (!blog) {
    return {
      title: `Blog Article | ${COMPANY_NAME}`,
      description: 'Read the latest KTM Test Preparation Centre article.',
      alternates: {
        canonical: absoluteUrl(`/blog/details/${slug}`),
      },
    };
  }

  const title = blog.title;
  const description =
    blog.description || 'Read the latest KTM Test Preparation Centre article.';
  const canonicalPath = `/blog/details/${blog.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(canonicalPath),
    },
    openGraph: {
      title: `${title} | ${COMPANY_NAME}`,
      description,
      type: 'article',
      url: absoluteUrl(canonicalPath),
      images: blog.image ? [blog.image] : undefined,
      publishedTime: blog.publishedAt || undefined,
      modifiedTime: blog.updatedAt || blog.publishedAt || undefined,
    },
    twitter: {
      card: blog.image ? 'summary_large_image' : 'summary',
      title: `${title} | ${COMPANY_NAME}`,
      description,
      images: blog.image ? [blog.image] : undefined,
    },
  };
}

export default async function BlogDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<LayoutParams> | LayoutParams;
}) {
  const { slug } = await resolveParams(params);
  const blog = await getSeoBlogDetail(slug);

  if (!blog) {
    return <>{children}</>;
  }

  const canonicalPath = `/blog/details/${blog.slug}`;

  return (
    <>
      <StandardPageStructuredData
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: blog.title, path: canonicalPath },
        ]}
        schemas={[
          buildBlogPostingSchema({
            title: blog.title,
            description: blog.description,
            path: canonicalPath,
            image: blog.image,
            publishedAt: blog.publishedAt,
            updatedAt: blog.updatedAt,
            authorName: blog.authorName,
            category: blog.category,
            keywords: blog.keywords,
          }),
        ]}
      />
      {children}
    </>
  );
}
