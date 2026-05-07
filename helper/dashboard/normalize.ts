import type {
  DashboardActivityItem,
  DashboardCurrentUser,
  DashboardLinkItem,
  DashboardPerformanceMetric,
  DashboardPerformanceSummary,
  DashboardRecentProperty,
  DashboardReportEntry,
  DashboardStats,
  DashboardSummaryPayload,
} from "@/types/dashboard";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readRecord = (value: unknown): UnknownRecord | null => (isRecord(value) ? value : null);

const readArray = <TItem = unknown>(value: unknown): TItem[] =>
  Array.isArray(value) ? (value as TItem[]) : [];

const readString = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  return fallback;
};

const readNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value.replace(/,/g, "").trim());
    return Number.isFinite(normalized) ? normalized : null;
  }

  return null;
};

const readBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no"].includes(normalized)) {
      return false;
    }
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  return fallback;
};

const readLabel = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  const record = readRecord(value);
  if (!record) {
    return fallback;
  }

  return readString(
    record.label ??
      record.name ??
      record.title ??
      record.slug ??
      record.value,
    fallback
  );
};

const extractPayload = (payload: unknown): unknown => {
  if (!isRecord(payload)) {
    return payload;
  }

  const firstLevel = payload.data ?? payload.result ?? payload.payload;

  if (firstLevel !== undefined) {
    return firstLevel;
  }

  return payload;
};

const readNestedArray = (source: unknown, keys: string[]): unknown[] => {
  const record = readRecord(source);
  if (!record) {
    return [];
  }

  for (const key of keys) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

const pickArraySource = (source: unknown, keys: string[]): unknown[] => {
  const nested = readNestedArray(source, keys);
  return nested.length > 0 ? nested : readArray(source);
};

const readNestedRecord = (source: unknown, keys: string[]): UnknownRecord | null => {
  const record = readRecord(source);
  if (!record) {
    return null;
  }

  for (const key of keys) {
    const candidate = record[key];
    if (isRecord(candidate)) {
      return candidate;
    }
  }

  return null;
};

const toId = (value: unknown, fallback: string): string => {
  const normalized = readString(value);
  return normalized || fallback;
};

const clampProgress = (value: number | null): number | null => {
  if (value === null) {
    return null;
  }

  return Math.max(0, Math.min(100, value));
};

const normalizeVariant = (value: unknown): DashboardLinkItem["variant"] => {
  const normalized = readString(value).toLowerCase();

  if (["primary", "main"].includes(normalized)) return "primary";
  if (["secondary", "accent"].includes(normalized)) return "secondary";
  if (["success", "positive"].includes(normalized)) return "success";
  if (["warning", "pending"].includes(normalized)) return "warning";
  if (["info", "blue"].includes(normalized)) return "info";

  return "neutral";
};

const normalizeMetricTone = (value: unknown): DashboardPerformanceMetric["tone"] => {
  const normalized = normalizeVariant(value);

  if (normalized === "neutral") {
    return "primary";
  }

  return normalized;
};

const formatCompactNumber = (value: number | null): string => {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-NP", {
    notation: "compact",
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
};

const formatCurrency = (value: number | null): string => {
  if (value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(value);
};

const normalizeLinkItem = (value: unknown, index: number, prefix: string): DashboardLinkItem => {
  const record = readRecord(value) ?? {};
  const url = readString(record.url ?? record.path ?? record.href ?? record.link);

  return {
    id: toId(record.id ?? record.slug ?? record.key, `${prefix}-${index + 1}`),
    label: readString(record.label ?? record.title ?? record.name, `Item ${index + 1}`),
    description: readString(record.description ?? record.summary ?? record.subtitle) || undefined,
    url: url || undefined,
    external: /^https?:\/\//.test(url),
    count: readNumber(record.count ?? record.total ?? record.badge_count),
    variant: normalizeVariant(record.variant ?? record.color ?? record.type),
  };
};

const normalizeRecentProperty = (value: unknown, index: number): DashboardRecentProperty => {
  const record = readRecord(value) ?? {};
  const price = readNumber(record.price ?? record.advertise_price ?? record.amount);
  const formattedPrice = readString(
    record.formatted_price ??
      record.formattedPrice ??
      record.price_formatted
  );

  return {
    id: toId(record.id ?? record.property_code, `property-${index + 1}`),
    title: readString(record.title ?? record.name, `Property ${index + 1}`),
    propertyCode: readString(record.property_code ?? record.code) || undefined,
    address: readString(
      record.address ??
        record.full_address ??
        record.location ??
        record.area
    ) || undefined,
    price,
    formattedPrice: formattedPrice || (price !== null ? formatCurrency(price) : undefined),
    listingType: readLabel(record.listing_type ?? record.listingType) || undefined,
    propertyType: readLabel(record.property_type ?? record.propertyType) || undefined,
    status: readLabel(record.status ?? record.property_status ?? record.propertyStatus) || undefined,
    createdAt: readString(record.created_at ?? record.createdAt ?? record.date) || undefined,
    url: readString(record.url ?? record.path) || undefined,
    views: readNumber(record.views ?? record.views_count),
  };
};

const normalizeActivityItem = (value: unknown, index: number): DashboardActivityItem => {
  const record = readRecord(value) ?? {};
  const user = readRecord(record.user);

  return {
    id: toId(record.id ?? record.key, `activity-${index + 1}`),
    title: readString(
      record.title ?? record.action ?? record.name ?? record.label,
      `Activity ${index + 1}`
    ),
    description: readString(record.description ?? record.message ?? record.summary) || undefined,
    type: readString(record.type ?? record.activity_type ?? record.category) || undefined,
    createdAt: readString(
      record.created_at ?? record.createdAt ?? record.logged_at ?? record.timestamp
    ) || undefined,
    userName:
      readString(record.user_name ?? record.userName) ||
      readString(user?.name ?? user?.firstName ?? user?.email) ||
      undefined,
    url: readString(record.url ?? record.path) || undefined,
  };
};

const makeMetric = (
  id: string,
  label: string,
  rawValue: unknown,
  options?: {
    formatter?: (value: number | null) => string;
    progress?: unknown;
    description?: unknown;
    tone?: DashboardPerformanceMetric["tone"];
  }
): DashboardPerformanceMetric | null => {
  const value = readNumber(rawValue);
  if (value === null) {
    return null;
  }

  const formatter = options?.formatter ?? formatCompactNumber;

  return {
    id,
    label,
    value,
    formattedValue: formatter(value),
    progress: clampProgress(readNumber(options?.progress ?? value)),
    description: readString(options?.description) || undefined,
    tone: options?.tone ?? "primary",
  };
};

export const normalizeDashboardPerformance = (payload: unknown): DashboardPerformanceSummary => {
  const root = extractPayload(payload);
  const source =
    readNestedRecord(root, ["performance"]) ??
    readRecord(root) ??
    {};

  const arrayMetrics = readNestedArray(source, ["metrics", "items"]).map((item, index) => {
    const record = readRecord(item) ?? {};
    const value = readNumber(record.value ?? record.count ?? record.total ?? record.amount);

    return {
      id: toId(record.id ?? record.key, `metric-${index + 1}`),
      label: readString(record.label ?? record.title ?? record.name, `Metric ${index + 1}`),
      value,
      formattedValue:
        readString(record.formatted_value ?? record.formattedValue) ||
        formatCompactNumber(value),
      progress: clampProgress(readNumber(record.progress ?? record.percent ?? record.percentage)),
      description: readString(record.description ?? record.subtitle) || undefined,
      tone: normalizeMetricTone(record.tone ?? record.variant ?? record.color),
    } satisfies DashboardPerformanceMetric;
  });

  const derivedMetrics = [
    makeMetric("response-rate", "Response Rate", source.response_rate ?? source.responseRate, {
      formatter: (value) => (value === null ? "N/A" : `${value}%`),
      progress: source.response_rate ?? source.responseRate,
      tone: "success",
    }),
    makeMetric("listings-viewed", "Listings Viewed", source.listings_viewed ?? source.listingsViewed ?? source.monthly_views, {
      formatter: formatCompactNumber,
      progress: source.listings_viewed_progress ?? source.listingsViewedProgress,
      tone: "info",
    }),
    makeMetric("conversion-rate", "Conversion Rate", source.conversion_rate ?? source.conversionRate, {
      formatter: (value) => (value === null ? "N/A" : `${value}%`),
      progress: source.conversion_rate ?? source.conversionRate,
      tone: "secondary",
    }),
  ].filter(Boolean) as DashboardPerformanceMetric[];

  const totalRevenueYtd =
    readNumber(source.total_revenue_ytd ?? source.totalRevenueYtd) ??
    readNumber(source.estimated_total_revenue ?? source.estimatedTotalRevenue);

  const totalRevenueYtdFormatted =
    readString(source.total_revenue_ytd_formatted ?? source.totalRevenueYtdFormatted) ||
    (totalRevenueYtd !== null ? formatCurrency(totalRevenueYtd) : undefined);

  return {
    metrics: arrayMetrics.length > 0 ? arrayMetrics : derivedMetrics,
    totalRevenueYtd,
    totalRevenueYtdFormatted,
    totalRevenueYtdEstimated: readBoolean(
      source.total_revenue_ytd_estimated ??
        source.totalRevenueYtdEstimated ??
        source.estimated,
      false
    ),
  };
};

export const normalizeDashboardReport = (payload: unknown): DashboardReportEntry[] => {
  const root = extractPayload(payload);
  const items = pickArraySource(root, ["report", "reports", "items", "data"]);

  return items.map((item, index) => {
    const record = readRecord(item) ?? {};
    const numericValue = readNumber(record.value ?? record.total ?? record.count ?? record.amount);

    return {
      id: toId(record.id ?? record.key, `report-${index + 1}`),
      title: readString(record.title ?? record.label ?? record.name ?? record.metric, `Report ${index + 1}`),
      value:
        readString(record.formatted_value ?? record.formattedValue ?? record.value) ||
        (numericValue !== null ? formatCompactNumber(numericValue) : "N/A"),
      subtitle: readString(record.subtitle ?? record.description ?? record.period ?? record.date) || undefined,
      change: readString(record.change ?? record.change_percent ?? record.trend) || undefined,
      status: readLabel(record.status) || undefined,
    };
  });
};

export const normalizeDashboardSummary = (payload: unknown): DashboardSummaryPayload => {
  const root = extractPayload(payload);
  const record = readRecord(root) ?? {};
  const statsSource = readNestedRecord(record, ["stats"]) ?? {};
  const performance = normalizeDashboardPerformance(record.performance ?? record);

  const currentUserSource =
    readNestedRecord(record, ["current_user", "currentUser", "user"]) ?? null;

  const currentUser: DashboardCurrentUser | null = currentUserSource
    ? {
        id: currentUserSource.id as string | number | undefined,
        displayName:
          [
            readString(currentUserSource.firstName ?? currentUserSource.first_name),
            readString(currentUserSource.lastName ?? currentUserSource.last_name),
          ]
            .filter(Boolean)
            .join(" ")
            .trim() ||
          readString(currentUserSource.name ?? currentUserSource.userName ?? currentUserSource.username ?? currentUserSource.email, "User"),
        email: readString(currentUserSource.email) || undefined,
        roles: readArray(currentUserSource.roles).map((role) => readLabel(role)).filter(Boolean),
      }
    : null;

  const stats: DashboardStats = {
    totalProperties: readNumber(statsSource.total_properties ?? statsSource.totalProperties) ?? 0,
    activeListings: readNumber(statsSource.active_listings ?? statsSource.activeListings) ?? 0,
    pendingDeals: readNumber(statsSource.pending_deals ?? statsSource.pendingDeals) ?? 0,
    monthlyViews: readNumber(statsSource.monthly_views ?? statsSource.monthlyViews) ?? 0,
  };

  return {
    stats,
    quickActions: readNestedArray(record, ["quick_actions", "quickActions"]).map((item, index) =>
      normalizeLinkItem(item, index, "quick-action")
    ),
    recentProperties: readNestedArray(record, ["recent_properties", "recentProperties"]).map((item, index) =>
      normalizeRecentProperty(item, index)
    ),
    recentActivity: readNestedArray(record, ["recent_activity", "recentActivity"]).map((item, index) =>
      normalizeActivityItem(item, index)
    ),
    performance,
    quickLinks: readNestedArray(record, ["quick_links", "quickLinks"]).map((item, index) =>
      normalizeLinkItem(item, index, "quick-link")
    ),
    currentUser,
  };
};

export const normalizeDashboardRecentProperties = (payload: unknown): DashboardRecentProperty[] => {
  const root = extractPayload(payload);
  const items = pickArraySource(root, ["recent_properties", "recentProperties", "items", "data"]);

  return items.map((item, index) => normalizeRecentProperty(item, index));
};

export const normalizeDashboardRecentActivity = (payload: unknown): DashboardActivityItem[] => {
  const root = extractPayload(payload);
  const items = pickArraySource(root, ["recent_activity", "recentActivity", "items", "data"]);

  return items.map((item, index) => normalizeActivityItem(item, index));
};
