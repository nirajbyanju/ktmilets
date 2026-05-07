import { absoluteUrl } from '@/helper/seo/site';

type UnknownRecord = Record<string, unknown>;

export type SeoPropertyDetail = {
  id: number | string | null;
  slug: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  image: string | null;
  price: number | string | null;
  currency: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  listingType: string | null;
  propertyType: string | null;
  landArea: number | string | null;
  landUnit: string | null;
  address: {
    streetAddress: string | null;
    addressLocality: string | null;
    addressRegion: string | null;
    postalCode: string | null;
    addressCountry: string | null;
  };
};

export type SeoBlogDetail = {
  id: number | string | null;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  publishedAt: string | null;
  updatedAt: string | null;
  authorName: string | null;
  category: string | null;
  keywords: string[];
};

export type SitemapEntry = {
  slug: string;
  updatedAt: string | null;
};

type PaginationInfo = {
  currentPage: number;
  lastPage: number;
};

const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? '';
const SEO_REVALIDATE_SECONDS = 60 * 30;
const MAX_SITEMAP_PAGES = 25;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toStringValue = (value: unknown): string | null => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const toNumberOrString = (value: unknown): number | string | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : value.trim();
  }

  return null;
};

const toPositiveInteger = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
};

const toPlainText = (value: unknown) => {
  const text = toStringValue(value);
  if (!text) {
    return '';
  }

  return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const ensureAbsoluteImage = (value: unknown): string | null => {
  const image = toStringValue(value);
  if (!image) {
    return null;
  }

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  return absoluteUrl(image.startsWith('/') ? image : `/${image}`);
};

const unwrapResponseData = (payload: unknown): unknown => {
  if (!isRecord(payload)) {
    return payload;
  }

  if ('data' in payload && payload.data !== undefined) {
    return payload.data;
  }

  if ('result' in payload && payload.result !== undefined) {
    return payload.result;
  }

  return payload;
};

const pickFirstObject = (value: unknown): UnknownRecord | null => {
  if (Array.isArray(value)) {
    const firstObject = value.find(isRecord);
    return firstObject ?? null;
  }

  if (!isRecord(value)) {
    return null;
  }

  if (Array.isArray(value.data)) {
    const firstObject = value.data.find(isRecord);
    return firstObject ?? null;
  }

  if (isRecord(value.data)) {
    return value.data;
  }

  return value;
};

const pickListItems = (value: unknown): UnknownRecord[] => {
  if (Array.isArray(value)) {
    return value.filter(isRecord);
  }

  if (!isRecord(value)) {
    return [];
  }

  if (Array.isArray(value.data)) {
    return value.data.filter(isRecord);
  }

  if (Array.isArray(value.items)) {
    return value.items.filter(isRecord);
  }

  if (isRecord(value.data) && Array.isArray(value.data.data)) {
    return value.data.data.filter(isRecord);
  }

  if (isRecord(value.data) && Array.isArray(value.data.items)) {
    return value.data.items.filter(isRecord);
  }

  return [];
};

const extractPaginationInfo = (payload: unknown): PaginationInfo | null => {
  if (!isRecord(payload)) {
    return null;
  }

  const candidates = [
    payload,
    isRecord(payload.data) ? payload.data : null,
    isRecord(payload.meta) ? payload.meta : null,
    isRecord(payload.pagination) ? payload.pagination : null,
    isRecord(payload.data) && isRecord(payload.data.meta) ? payload.data.meta : null,
    isRecord(payload.data) && isRecord(payload.data.pagination) ? payload.data.pagination : null,
  ].filter((candidate): candidate is UnknownRecord => Boolean(candidate));

  for (const candidate of candidates) {
    const currentPage =
      toPositiveInteger(candidate.current_page) ??
      toPositiveInteger(candidate.currentPage) ??
      toPositiveInteger(candidate.page);
    const lastPage =
      toPositiveInteger(candidate.last_page) ??
      toPositiveInteger(candidate.lastPage) ??
      toPositiveInteger(candidate.total_pages) ??
      toPositiveInteger(candidate.totalPages);

    if (currentPage && lastPage) {
      return { currentPage, lastPage };
    }
  }

  return null;
};

const firstImageFromProperty = (property: UnknownRecord): string | null => {
  const images = Array.isArray(property.images) ? property.images.filter(isRecord) : [];
  const featuredImage =
    images.find((image) => image.is_featured === true || image.is_featured === 1) ?? images[0];

  return ensureAbsoluteImage(featuredImage?.full_url ?? featuredImage?.image_url);
};

const tagListFromValue = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => toStringValue(entry))
      .filter((entry): entry is string => Boolean(entry));
  }

  const raw = toStringValue(value);
  if (!raw) {
    return [];
  }

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

async function fetchPublicApi(path: string): Promise<unknown> {
  if (!PUBLIC_API_BASE_URL) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${PUBLIC_API_BASE_URL}${path}`, {
      headers: {
        Accept: 'application/json',
      },
      next: {
        revalidate: SEO_REVALIDATE_SECONDS,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getSeoPropertyDetail(slug: string): Promise<SeoPropertyDetail | null> {
  const payload = await fetchPublicApi(`/public/properties/${encodeURIComponent(slug)}/details`);
  const property = pickFirstObject(unwrapResponseData(payload));

  if (!property) {
    return null;
  }

  const address = isRecord(property.address) ? property.address : {};
  const listingType = isRecord(property.listing_type) ? property.listing_type : {};
  const propertyType = isRecord(property.property_type) ? property.property_type : {};
  const landUnit = isRecord(property.land_unit) ? property.land_unit : {};

  return {
    id: toNumberOrString(property.id),
    slug: toStringValue(property.slug) || slug,
    title: toStringValue(property.title) || 'Property Detail',
    description: toPlainText(property.description),
    seoTitle: toStringValue(property.seo_title) || '',
    seoDescription: toPlainText(property.seo_description),
    image: firstImageFromProperty(property),
    price: toNumberOrString(property.advertise_price),
    currency: toStringValue(property.currency),
    publishedAt: toStringValue(property.publishedat) || toStringValue(property.created_at),
    updatedAt: toStringValue(property.updated_at),
    listingType: toStringValue(listingType.label ?? listingType.name),
    propertyType: toStringValue(propertyType.label ?? propertyType.name),
    landArea: toNumberOrString(property.land_area),
    landUnit: toStringValue(landUnit.label ?? landUnit.name),
    address: {
      streetAddress: toStringValue(address.full_address),
      addressLocality:
        toStringValue(address.area) ||
        toStringValue(address.municipality) ||
        toStringValue(address.district),
      addressRegion: toStringValue(address.district) || toStringValue(address.state),
      postalCode: toStringValue(address.postal_code),
      addressCountry: toStringValue(address.country) || 'NP',
    },
  };
}

export async function getSeoBlogDetail(slug: string): Promise<SeoBlogDetail | null> {
  const payload = await fetchPublicApi(`/public/blog/${encodeURIComponent(slug)}`);
  const blog = pickFirstObject(unwrapResponseData(payload));

  if (!blog) {
    return null;
  }

  const category = isRecord(blog.category) ? blog.category : {};
  const user = isRecord(blog.user) ? blog.user : {};

  return {
    id: toNumberOrString(blog.id),
    slug: toStringValue(blog.slug) || slug,
    title: toStringValue(blog.title) || 'Blog Article',
    description:
      toPlainText(blog.excerpt) ||
      toPlainText(blog.content) ||
      toPlainText(blog.contentWithIds),
    image: ensureAbsoluteImage(blog.thumbnail),
    publishedAt: toStringValue(blog.publishDate) || toStringValue(blog.publish_date) || toStringValue(blog.createdAt),
    updatedAt: toStringValue(blog.updatedAt),
    authorName:
      toStringValue(blog.author) ||
      toStringValue(user.full_name) ||
      toStringValue(user.username),
    category: toStringValue(category.label ?? category.name),
    keywords: tagListFromValue(blog.tags),
  };
}

export async function getSeoPropertySitemapEntries(limit = 200): Promise<SitemapEntry[]> {
  const entries = new Map<string, SitemapEntry>();

  for (let page = 1; page <= MAX_SITEMAP_PAGES; page += 1) {
    const payload = await fetchPublicApi(`/public/properties/list?limit=${limit}&page=${page}`);
    const items = pickListItems(unwrapResponseData(payload));

    items.forEach((item) => {
      const slug = toStringValue(item.slug);

      if (!slug) {
        return;
      }

      entries.set(slug, {
        slug,
        updatedAt: toStringValue(item.updated_at) || toStringValue(item.publishedat),
      });
    });

    const pagination = extractPaginationInfo(payload);

    if ((pagination && page >= pagination.lastPage) || items.length < limit) {
      break;
    }

    if (!pagination && items.length === 0) {
      break;
    }
  }

  return Array.from(entries.values());
}

export async function getSeoBlogSitemapEntries(limit = 200): Promise<SitemapEntry[]> {
  const entries = new Map<string, SitemapEntry>();

  for (let page = 1; page <= MAX_SITEMAP_PAGES; page += 1) {
    const payload = await fetchPublicApi(`/public/blog?limit=${limit}&page=${page}`);
    const items = pickListItems(unwrapResponseData(payload));

    items.forEach((item) => {
      const slug = toStringValue(item.slug);

      if (!slug) {
        return;
      }

      entries.set(slug, {
        slug,
        updatedAt:
          toStringValue(item.updatedAt) ||
          toStringValue(item.publishDate) ||
          toStringValue(item.publish_date),
      });
    });

    const pagination = extractPaginationInfo(payload);

    if ((pagination && page >= pagination.lastPage) || items.length < limit) {
      break;
    }

    if (!pagination && items.length === 0) {
      break;
    }
  }

  return Array.from(entries.values());
}
