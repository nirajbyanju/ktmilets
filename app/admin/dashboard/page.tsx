'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { IconType } from "react-icons";
import {
  FiActivity,
  FiArrowRight,
  FiBarChart2,
  FiClock,
  FiExternalLink,
  FiEye,
  FiHome,
  FiLayers,
  FiRefreshCw,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

import {
  getDashboardPerformance,
  getDashboardRecentActivity,
  getDashboardRecentProperties,
  getDashboardReport,
  getDashboardSummary,
} from "@/apis/dashboard/dashboard.api";
import ContentLoader from "@/components/loader/ContentLoader";
import AdminLoader from "@/components/loader/Loader";
import type {
  DashboardActivityItem,
  DashboardCurrentUser,
  DashboardLinkItem,
  DashboardPerformanceSummary,
  DashboardPeriod,
  DashboardRecentProperty,
  DashboardReportEntry,
} from "@/types/dashboard";
import useAuthStore from "@/stores/auth/AuthStore";

const SUMMARY_LIMIT = 5;
const RECENT_PROPERTIES_LIMIT = 8;
const RECENT_ACTIVITY_LIMIT = 8;
const REPORT_LIMIT = 8;

const PERIOD_OPTIONS: DashboardPeriod[] = ["week", "month", "year"];
const PERIOD_LABELS: Record<DashboardPeriod, string> = {
  week: "This week",
  month: "This month",
  year: "This year",
};

const panelClassName = "rounded-opsh-lg border border-opsh-grey bg-white shadow-opsh-sm";

const readString = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  return "";
};

const readStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => readString(entry))
    .filter(Boolean);
};

const formatCompactNumber = (value?: number | null): string => {
  if (value === undefined || value === null) {
    return "0";
  }

  return new Intl.NumberFormat("en-NP", {
    notation: "compact",
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value);
};

const formatCurrency = (value?: number | null): string => {
  if (value === undefined || value === null) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDateTime = (value?: string): string => {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-NP", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatRelativeTime = (value?: string): string => {
  if (!value) {
    return "Just now";
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return value;
  }

  const diffInMinutes = Math.round((timestamp - Date.now()) / 60_000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffInMinutes) < 60) {
    return formatter.format(diffInMinutes, "minute");
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return formatter.format(diffInHours, "hour");
  }

  const diffInDays = Math.round(diffInHours / 24);
  return formatter.format(diffInDays, "day");
};

const getStatusClasses = (value?: string): string => {
  const normalized = readString(value).toLowerCase();

  if (["active", "available", "approved", "view"].includes(normalized)) {
    return "bg-opsh-success/10 text-opsh-success";
  }

  if (["pending", "draft", "follow-up", "follow_up"].includes(normalized)) {
    return "bg-opsh-warning/15 text-opsh-darkgrey";
  }

  if (["sold", "closed", "leased", "inactive"].includes(normalized)) {
    return "bg-opsh-danger/10 text-opsh-danger";
  }

  return "bg-opsh-info/10 text-opsh-info";
};

const getLinkVariantClasses = (variant: DashboardLinkItem["variant"]): string => {
  switch (variant) {
    case "primary":
      return "border-opsh-primary/20 bg-opsh-primary/5 text-opsh-primary hover:bg-opsh-primary/10";
    case "secondary":
      return "border-opsh-secondary/20 bg-opsh-secondary/5 text-opsh-secondary hover:bg-opsh-secondary/10";
    case "success":
      return "border-opsh-success/20 bg-opsh-success/5 text-opsh-success hover:bg-opsh-success/10";
    case "warning":
      return "border-opsh-warning/20 bg-opsh-warning/10 text-opsh-darkgrey hover:bg-opsh-warning/15";
    case "info":
      return "border-opsh-info/20 bg-opsh-info/5 text-opsh-info hover:bg-opsh-info/10";
    default:
      return "border-opsh-grey bg-opsh-background text-opsh-darkgrey hover:bg-opsh-background-dark";
  }
};

const getMetricBarClasses = (tone: DashboardPerformanceSummary["metrics"][number]["tone"]): string => {
  switch (tone) {
    case "success":
      return "bg-opsh-success";
    case "secondary":
      return "bg-opsh-secondary";
    case "warning":
      return "bg-opsh-warning";
    case "info":
      return "bg-opsh-info";
    default:
      return "bg-opsh-primary";
  }
};

const getUserDisplayName = (currentUser: DashboardCurrentUser | null, authUser: Record<string, unknown> | null) => {
  if (currentUser?.displayName) {
    return currentUser.displayName;
  }

  const firstName = readString(authUser?.firstName ?? authUser?.first_name);
  const lastName = readString(authUser?.lastName ?? authUser?.last_name);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  if (fullName) {
    return fullName;
  }

  return (
    readString(authUser?.name ?? authUser?.userName ?? authUser?.username ?? authUser?.email) || "Admin User"
  );
};

const getUserRoles = (currentUser: DashboardCurrentUser | null, authUser: Record<string, unknown> | null) => {
  if (currentUser?.roles.length) {
    return currentUser.roles;
  }

  const roles = readStringArray(authUser?.roles);
  return roles.length > 0 ? roles : ["Administrator"];
};

function DashboardPanel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${panelClassName} ${className}`.trim()}>
      <div className="flex items-start justify-between gap-4 border-b border-opsh-grey px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-opsh-black">{title}</h2>
          {description ? <p className="mt-1 text-sm text-opsh-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function EmptyPanelState({ message }: { message: string }) {
  return (
    <div className="rounded-opsh-md border border-dashed border-opsh-grey bg-opsh-background px-4 py-10 text-center text-sm text-opsh-muted">
      {message}
    </div>
  );
}

function StatCard({
  title,
  value,
  helper,
  icon: Icon,
  accentClassName,
  iconShellClassName,
}: {
  title: string;
  value: string;
  helper: string;
  icon: IconType;
  accentClassName: string;
  iconShellClassName: string;
}) {
  return (
    <div className={`${panelClassName} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-opsh-muted">{title}</p>
          <p className={`mt-3 text-3xl font-bold ${accentClassName}`}>{value}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-opsh-text-dark">{helper}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-opsh-lg ${iconShellClassName}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const authUser = useAuthStore((state) => state.user as Record<string, unknown> | null);

  const summaryQuery = useQuery({
    queryKey: ["dashboard", "summary", period, SUMMARY_LIMIT],
    queryFn: ({ signal }) => getDashboardSummary(period, SUMMARY_LIMIT, signal),
  });

  const recentPropertiesQuery = useQuery({
    queryKey: ["dashboard", "recent-properties", period, RECENT_PROPERTIES_LIMIT],
    queryFn: ({ signal }) => getDashboardRecentProperties(period, RECENT_PROPERTIES_LIMIT, signal),
  });

  const recentActivityQuery = useQuery({
    queryKey: ["dashboard", "recent-activity", RECENT_ACTIVITY_LIMIT],
    queryFn: ({ signal }) => getDashboardRecentActivity(RECENT_ACTIVITY_LIMIT, signal),
  });

  const performanceQuery = useQuery({
    queryKey: ["dashboard", "performance", period],
    queryFn: ({ signal }) => getDashboardPerformance(period, signal),
  });

  const reportQuery = useQuery({
    queryKey: ["dashboard", "report", period, REPORT_LIMIT],
    queryFn: ({ signal }) => getDashboardReport(period, REPORT_LIMIT, signal),
  });

  const summary = summaryQuery.data;

  const recentProperties = useMemo<DashboardRecentProperty[]>(() => {
    if ((recentPropertiesQuery.data?.length ?? 0) > 0) {
      return recentPropertiesQuery.data ?? [];
    }

    return summary?.recentProperties ?? [];
  }, [recentPropertiesQuery.data, summary?.recentProperties]);

  const recentActivity = useMemo<DashboardActivityItem[]>(() => {
    if ((recentActivityQuery.data?.length ?? 0) > 0) {
      return recentActivityQuery.data ?? [];
    }

    return summary?.recentActivity ?? [];
  }, [recentActivityQuery.data, summary?.recentActivity]);

  const performance = useMemo<DashboardPerformanceSummary>(() => {
    if (performanceQuery.data) {
      return performanceQuery.data;
    }

    return (
      summary?.performance ?? {
        metrics: [],
        totalRevenueYtd: null,
        totalRevenueYtdFormatted: "N/A",
        totalRevenueYtdEstimated: false,
      }
    );
  }, [performanceQuery.data, summary?.performance]);

  const quickActions = summary?.quickActions ?? [];
  const quickLinks = summary?.quickLinks ?? [];
  const currentUser = summary?.currentUser ?? null;
  const userName = getUserDisplayName(currentUser, authUser);
  const userRoles = getUserRoles(currentUser, authUser);
  const userEmail = currentUser?.email || readString(authUser?.email);

  const statCards = [
    {
      id: "total-properties",
      title: "Total Properties",
      value: formatCompactNumber(summary?.stats.totalProperties),
      helper: "Portfolio inventory",
      icon: FiHome,
      accentClassName: "text-opsh-primary",
      iconShellClassName: "bg-opsh-primary/10 text-opsh-primary",
    },
    {
      id: "active-listings",
      title: "Active Listings",
      value: formatCompactNumber(summary?.stats.activeListings),
      helper: "Currently market-ready",
      icon: FiLayers,
      accentClassName: "text-opsh-success",
      iconShellClassName: "bg-opsh-success/10 text-opsh-success",
    },
    {
      id: "pending-deals",
      title: "Pending Deals",
      value: formatCompactNumber(summary?.stats.pendingDeals),
      helper: "Derived from open inquiries",
      icon: FiClock,
      accentClassName: "text-opsh-secondary",
      iconShellClassName: "bg-opsh-secondary/10 text-opsh-secondary",
    },
    {
      id: "views",
      title: "Views",
      value: formatCompactNumber(summary?.stats.monthlyViews),
      helper: `${PERIOD_LABELS[period]} reach`,
      icon: FiEye,
      accentClassName: "text-opsh-info",
      iconShellClassName: "bg-opsh-info/10 text-opsh-info",
    },
  ];

  const isRefreshing =
    summaryQuery.isFetching ||
    recentPropertiesQuery.isFetching ||
    recentActivityQuery.isFetching ||
    performanceQuery.isFetching ||
    reportQuery.isFetching;

  const isInitialDashboardLoading =
    summaryQuery.isPending ||
    recentPropertiesQuery.isPending ||
    recentActivityQuery.isPending ||
    performanceQuery.isPending ||
    reportQuery.isPending;

  const handleRefetchAll = async () => {
    await Promise.all([
      summaryQuery.refetch(),
      recentPropertiesQuery.refetch(),
      recentActivityQuery.refetch(),
      performanceQuery.refetch(),
      reportQuery.refetch(),
    ]);
  };

  const handleDashboardLink = (item: DashboardLinkItem) => {
    if (!item.url) {
      return;
    }

    if (item.external) {
      window.open(item.url, "_blank", "noopener,noreferrer");
      return;
    }

    router.push(item.url);
  };



  if (summaryQuery.isError && !summary) {
    return (
      <div className="min-h-screen bg-opsh-background px-4 py-5 md:px-6">
        <div className={`${panelClassName} mx-auto max-w-3xl p-8 text-center`}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-opsh-danger/10 text-opsh-danger">
            <FiActivity size={24} />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-opsh-black">Dashboard could not be loaded</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-opsh-muted">
            {summaryQuery.error instanceof Error
              ? summaryQuery.error.message
              : "The summary endpoint failed. Retry after checking the dashboard API responses."}
          </p>
          <button
            type="button"
            onClick={() => void handleRefetchAll()}
            className="mt-6 inline-flex items-center gap-2 rounded-opsh-md bg-opsh-primary px-4 py-2 text-sm font-medium text-white hover:bg-opsh-primary-hover"
          >
            <FiRefreshCw size={16} />
            Retry Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-opsh-background px-4 py-5 md:px-6">
      <div className="mx-auto space-y-6">
        <section className="overflow-hidden rounded-opsh-xl bg-gradient-to-r from-opsh-primary via-[#065f59] to-opsh-fourth p-6 text-white shadow-opsh-lg">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/80">
                <FiZap size={14} />
                Admin dashboard
              </div>
              <h1 className="mt-4 text-3xl font-bold tracking-tight">Overview for {userName}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80">
                The page is now reading live summary, recent properties, recent activity, performance, and report
                data from the new dashboard endpoints.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {userRoles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90"
                  >
                    {role}
                  </span>
                ))}
                {userEmail ? (
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
                    {userEmail}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-opsh-lg border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2">
                {PERIOD_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPeriod(option)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      period === option
                        ? "bg-white text-opsh-primary shadow-opsh-md"
                        : "bg-white/10 text-white/85 hover:bg-white/20"
                    }`}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void handleRefetchAll()}
                className="inline-flex items-center justify-center gap-2 rounded-opsh-md border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                <FiRefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                {isRefreshing ? "Refreshing" : "Refresh data"}
              </button>

              <p className="text-xs uppercase tracking-[0.18em] text-white/65">
                {isRefreshing ? "Updating dashboard" : `${PERIOD_LABELS[period]} snapshot`}
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <StatCard key={card.id} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <DashboardPanel
            title="Quick Actions"
            description="Drive common admin workflows from backend-defined shortcuts."
            className="xl:col-span-8"
          >
            {quickActions.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => handleDashboardLink(action)}
                    className={`group flex items-start justify-between gap-3 rounded-opsh-lg border px-4 py-4 text-left transition-all ${getLinkVariantClasses(action.variant)}`}
                  >
                    <div>
                      <p className="text-sm font-semibold">{action.label}</p>
                      {action.description ? <p className="mt-1 text-sm opacity-80">{action.description}</p> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {action.count !== null && action.count !== undefined ? (
                        <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-opsh-black">
                          {formatCompactNumber(action.count)}
                        </span>
                      ) : null}
                      <FiArrowRight className="mt-0.5 transition-transform group-hover:translate-x-1" size={18} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyPanelState message="No quick actions were returned by the summary endpoint." />
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Quick Links"
            description="Secondary navigation and context links from the dashboard summary."
            className="xl:col-span-4"
          >
            {quickLinks.length > 0 ? (
              <div className="space-y-3">
                {quickLinks.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleDashboardLink(item)}
                    className="flex w-full items-center justify-between rounded-opsh-md border border-opsh-grey px-4 py-3 text-left transition-colors hover:border-opsh-primary/30 hover:bg-opsh-primary/5"
                  >
                    <div>
                      <p className="text-sm font-medium text-opsh-black">{item.label}</p>
                      {item.description ? <p className="mt-1 text-xs text-opsh-muted">{item.description}</p> : null}
                    </div>
                    {item.external ? (
                      <FiExternalLink size={16} className="text-opsh-text-dark" />
                    ) : (
                      <FiArrowRight size={16} className="text-opsh-text-dark" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <EmptyPanelState message="No quick links are available for this user." />
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Recent Properties"
            description={`${PERIOD_LABELS[period]} additions and listing movement.`}
            className="xl:col-span-7"
            action={
              <Link href="/admin/property" className="text-sm font-medium text-opsh-primary hover:text-opsh-primary-hover">
                Open list
              </Link>
            }
          >
            {recentProperties.length > 0 ? (
              <div className="space-y-3">
                {recentProperties.map((property) => {
                  const propertyContent = (
                    <div className="rounded-opsh-lg border border-opsh-grey px-4 py-4 transition-colors hover:border-opsh-primary/25 hover:bg-opsh-primary/5">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-semibold text-opsh-black">{property.title}</h3>
                            {property.status ? (
                              <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(property.status)}`}>
                                {property.status}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-opsh-muted">
                            {property.propertyCode ? <span>#{property.propertyCode}</span> : null}
                            {property.propertyType ? <span>{property.propertyType}</span> : null}
                            {property.listingType ? <span>{property.listingType}</span> : null}
                            {property.address ? <span>{property.address}</span> : null}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-opsh-text-dark">
                            <span>{formatDateTime(property.createdAt)}</span>
                            {property.views !== null && property.views !== undefined ? (
                              <span className="inline-flex items-center gap-1">
                                <FiEye size={13} />
                                {formatCompactNumber(property.views)} views
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="shrink-0 text-left md:text-right">
                          <p className="text-base font-semibold text-opsh-primary">
                            {property.formattedPrice || formatCurrency(property.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );

                  return property.url ? (
                    <Link key={property.id} href={property.url} className="block">
                      {propertyContent}
                    </Link>
                  ) : (
                    <div key={property.id}>{propertyContent}</div>
                  );
                })}
              </div>
            ) : recentPropertiesQuery.isPending ? (
              <ContentLoader variant="list" count={4} showImage={false} />
            ) : (
              <EmptyPanelState message="No recent properties were returned for the selected period." />
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Recent Activity"
            description="Latest system activity across property, inquiry, and follow-up workflows."
            className="xl:col-span-5"
          >
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-opsh-info/10 text-opsh-info">
                        <FiActivity size={18} />
                      </div>
                      {index < recentActivity.length - 1 ? <div className="mt-2 h-full w-px bg-opsh-grey" /> : null}
                    </div>
                    <div className="min-w-0 flex-1 pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-opsh-black">{activity.title}</p>
                        {activity.type ? (
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(activity.type)}`}>
                            {activity.type}
                          </span>
                        ) : null}
                      </div>
                      {activity.description ? <p className="mt-1 text-sm text-opsh-muted">{activity.description}</p> : null}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-opsh-text-dark">
                        {activity.userName ? <span>{activity.userName}</span> : null}
                        <span>{formatRelativeTime(activity.createdAt)}</span>
                        <span>{formatDateTime(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivityQuery.isPending ? (
              <ContentLoader variant="list" count={5} showActions={false} />
            ) : (
              <EmptyPanelState message="No recent activity was returned by the dashboard API." />
            )}
          </DashboardPanel>

          <DashboardPanel
            title="Performance"
            description="Operational metrics and estimated revenue indicators from the performance endpoint."
            className="xl:col-span-5"
          >
            <div className="space-y-5">
              {performance.metrics.length > 0 ? (
                performance.metrics.map((metric) => (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-opsh-black">{metric.label}</p>
                        {metric.description ? <p className="text-xs text-opsh-muted">{metric.description}</p> : null}
                      </div>
                      <span className="text-sm font-semibold text-opsh-primary">{metric.formattedValue}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-opsh-grey">
                      <div
                        className={`h-full rounded-full transition-all ${getMetricBarClasses(metric.tone)}`}
                        style={{ width: `${metric.progress ?? 0}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : performanceQuery.isPending ? (
                <ContentLoader variant="list" count={3} showImage={false} showActions={false} />
              ) : (
                <EmptyPanelState message="No performance metrics were returned for the selected period." />
              )}

              <div className="rounded-opsh-lg border border-opsh-grey bg-opsh-background px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-opsh-muted">Total Revenue YTD</p>
                    <p className="mt-2 text-2xl font-bold text-opsh-black">
                      {performance.totalRevenueYtdFormatted || formatCurrency(performance.totalRevenueYtd)}
                    </p>
                  </div>
                  {performance.totalRevenueYtdEstimated ? (
                    <span className="rounded-full bg-opsh-warning/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-opsh-darkgrey">
                      Estimated
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-xs text-opsh-text-dark">
                  Revenue is estimated from sold or leased property prices because there is no dedicated revenue table.
                </p>
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="Report"
            description={`${PERIOD_LABELS[period]} report cards from the reporting endpoint.`}
            className="xl:col-span-7"
            action={
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-opsh-text-dark">
                <FiBarChart2 size={14} />
                Report API
              </div>
            }
          >
            {reportQuery.data && reportQuery.data.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {reportQuery.data.map((entry: DashboardReportEntry) => (
                  <div key={entry.id} className="rounded-opsh-lg border border-opsh-grey px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-opsh-muted">{entry.title}</p>
                        <p className="mt-2 text-2xl font-bold text-opsh-black">{entry.value}</p>
                      </div>
                      {entry.status ? (
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(entry.status)}`}>
                          {entry.status}
                        </span>
                      ) : null}
                    </div>
                    {entry.subtitle ? <p className="mt-3 text-sm text-opsh-muted">{entry.subtitle}</p> : null}
                    {entry.change ? (
                      <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-opsh-primary/5 px-3 py-1 text-xs font-medium text-opsh-primary">
                        <FiTrendingUp size={12} />
                        {entry.change}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : reportQuery.isPending ? (
              <ContentLoader variant="grid" count={4} columns={2} showImage={false} showActions={false} />
            ) : (
              <EmptyPanelState message="No report rows were returned for the selected period." />
            )}
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
}
