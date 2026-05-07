import { MetadataRoute } from 'next';
import { absoluteUrl } from '@/helper/seo/site';
import {
  getSeoBlogSitemapEntries,
  getSeoPropertySitemapEntries,
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
    url: absoluteUrl('/about-us'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: absoluteUrl('/contact-us'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: absoluteUrl('/services'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: absoluteUrl('/how-it-works'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: absoluteUrl('/faqs'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: absoluteUrl('/properties-list'),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: absoluteUrl('/blog'),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: absoluteUrl('/calendar'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    url: absoluteUrl('/emiCalculator'),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
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
  const [propertyEntries, blogEntries] = await Promise.all([
    getSeoPropertySitemapEntries(),
    getSeoBlogSitemapEntries(),
  ]);

  const propertyRoutes: MetadataRoute.Sitemap = propertyEntries.map((entry) => ({
    url: absoluteUrl(`/properties/${entry.slug}`),
    lastModified: entry.updatedAt ? new Date(entry.updatedAt) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogEntries.map((entry) => ({
    url: absoluteUrl(`/blog/details/${entry.slug}`),
    lastModified: entry.updatedAt ? new Date(entry.updatedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...propertyRoutes, ...blogRoutes];
}
