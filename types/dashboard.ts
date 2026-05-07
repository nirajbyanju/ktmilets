export type DashboardPeriod = "week" | "month" | "year";

export interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  pendingDeals: number;
  monthlyViews: number;
}

export interface DashboardLinkItem {
  id: string;
  label: string;
  description?: string;
  url?: string;
  external: boolean;
  count?: number | null;
  variant: "primary" | "secondary" | "success" | "warning" | "info" | "neutral";
}

export interface DashboardRecentProperty {
  id: string;
  title: string;
  propertyCode?: string;
  address?: string;
  price?: number | null;
  formattedPrice?: string;
  listingType?: string;
  propertyType?: string;
  status?: string;
  createdAt?: string;
  url?: string;
  views?: number | null;
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  description?: string;
  type?: string;
  createdAt?: string;
  userName?: string;
  url?: string;
}

export interface DashboardPerformanceMetric {
  id: string;
  label: string;
  value: number | null;
  formattedValue: string;
  progress?: number | null;
  description?: string;
  tone: "primary" | "secondary" | "success" | "warning" | "info";
}

export interface DashboardPerformanceSummary {
  metrics: DashboardPerformanceMetric[];
  totalRevenueYtd: number | null;
  totalRevenueYtdFormatted?: string;
  totalRevenueYtdEstimated: boolean;
}

export interface DashboardReportEntry {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  status?: string;
}

export interface DashboardCurrentUser {
  id?: string | number;
  displayName: string;
  email?: string;
  roles: string[];
}

export interface DashboardSummaryPayload {
  stats: DashboardStats;
  quickActions: DashboardLinkItem[];
  recentProperties: DashboardRecentProperty[];
  recentActivity: DashboardActivityItem[];
  performance: DashboardPerformanceSummary;
  quickLinks: DashboardLinkItem[];
  currentUser: DashboardCurrentUser | null;
}
