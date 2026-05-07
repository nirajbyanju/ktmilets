import { api, Response } from "@/apis/https.api";
import { buildSearchParams } from "@/apis/queryParams";
import {
  normalizeDashboardPerformance,
  normalizeDashboardRecentActivity,
  normalizeDashboardRecentProperties,
  normalizeDashboardReport,
  normalizeDashboardSummary,
} from "@/helper/dashboard/normalize";
import type {
  DashboardActivityItem,
  DashboardPerformanceSummary,
  DashboardPeriod,
  DashboardRecentProperty,
  DashboardReportEntry,
  DashboardSummaryPayload,
} from "@/types/dashboard";

const buildDashboardEndpoint = (path: string, params: Record<string, string | number>) => {
  const searchParams = buildSearchParams(params);
  const queryString = searchParams.toString();
  return queryString ? `${path}?${queryString}` : path;
};

export const getDashboardSummary = async (
  period: DashboardPeriod,
  limit = 5,
  signal?: AbortSignal
): Promise<DashboardSummaryPayload> => {
  const endpoint = buildDashboardEndpoint("/dashboard/summary", { period, limit });
  const response = await api.get<Response<unknown>>(endpoint, { signal });
  return normalizeDashboardSummary(response.data);
};

export const getDashboardRecentProperties = async (
  period: DashboardPeriod,
  limit = 10,
  signal?: AbortSignal
): Promise<DashboardRecentProperty[]> => {
  const endpoint = buildDashboardEndpoint("/dashboard/recent-properties", { period, limit });
  const response = await api.get<Response<unknown>>(endpoint, { signal });
  return normalizeDashboardRecentProperties(response.data);
};

export const getDashboardRecentActivity = async (
  limit = 10,
  signal?: AbortSignal
): Promise<DashboardActivityItem[]> => {
  const endpoint = buildDashboardEndpoint("/dashboard/recent-activity", { limit });
  const response = await api.get<Response<unknown>>(endpoint, { signal });
  return normalizeDashboardRecentActivity(response.data);
};

export const getDashboardPerformance = async (
  period: DashboardPeriod,
  signal?: AbortSignal
): Promise<DashboardPerformanceSummary> => {
  const endpoint = buildDashboardEndpoint("/dashboard/performance", { period });
  const response = await api.get<Response<unknown>>(endpoint, { signal });
  return normalizeDashboardPerformance(response.data);
};

export const getDashboardReport = async (
  period: DashboardPeriod,
  limit = 10,
  signal?: AbortSignal
): Promise<DashboardReportEntry[]> => {
  const endpoint = buildDashboardEndpoint("/dashboard/report", { period, limit });
  const response = await api.get<Response<unknown>>(endpoint, { signal });
  return normalizeDashboardReport(response.data);
};
