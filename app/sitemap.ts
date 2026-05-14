import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/helper/seo/site';
import {
  getSeoBlogSitemapEntries,
} from '@/helper/seo/publicApi';

const now = new Date();
const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: absoluteUrl('/'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    url: absoluteUrl('/about'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: absoluteUrl('/contact'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: absoluteUrl('/ielts'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    url: absoluteUrl('/pte'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    url: absoluteUrl('/demo'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: absoluteUrl('/exam-booking'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: absoluteUrl('/mock-tests'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: absoluteUrl('/registration'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: absoluteUrl('/payment'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: absoluteUrl('/blog'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: absoluteUrl('/privacy-policy'),
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.4,
  },
  {
    url: absoluteUrl('/terms-and-conditions'),
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.4,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogEntries] = await Promise.all([
    getSeoBlogSitemapEntries(),
  ]);

  const blogRoutes: MetadataRoute.Sitemap = blogEntries.map((entry) => ({
    url: absoluteUrl(`/blog/details/${entry.slug}`),
    lastModified: entry.updatedAt ? new Date(entry.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
