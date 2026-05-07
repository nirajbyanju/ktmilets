"use client";

import Link from "next/link";
import { type FormEvent, type ReactNode, useMemo } from "react";
import { FaExternalLinkAlt, FaHeart, FaRegHeart, FaSearch } from "react-icons/fa";

import { getPropertyLikeAuditPage, getUserLikedPropertiesPage } from "@/apis/property/propertyLike.api";
import PaginationControls from "@/components/PaginationControls";
import EmptyState from "@/components/loader/EmptyState";
import SearchingData from "@/components/loader/SearchingData";
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import { useAdminListPage } from "@/hooks/useAdminListPage";
import useAuthStore from "@/stores/auth/AuthStore";
import type { PropertyLikeAdminListFilters } from "@/types/admin/listFilters";
import type { AccessIdentifier } from "@/types/rbac";
import type { PropertyLikeListEntry } from "@/types/propertyLike";

const defaultPropertyLikeFilters: PropertyLikeAdminListFilters = {
  search: "",
  is_active: "",
  user_id: "",
  property_id: "",
  limit: "15",
};

const toStringValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
};

const normalizeRoleNames = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((entry) => toStringValue(entry)).filter(Boolean);
};

const readCurrentUserId = (value: Record<string, unknown> | null): AccessIdentifier | null => {
  if (!value) {
    return null;
  }

  const candidate = value.id;
  if (typeof candidate === "number") {
    return candidate;
  }

  if (typeof candidate === "string" && candidate.trim()) {
    return candidate.trim();
  }

  return null;
};

const buildCurrentUserName = (value: Record<string, unknown> | null) => {
  const firstName = toStringValue(value?.first_name) || toStringValue(value?.firstName);
  const lastName = toStringValue(value?.last_name) || toStringValue(value?.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return fullName || toStringValue(value?.name) || toStringValue(value?.full_name) || toStringValue(value?.username);
};

const matchesQuery = (entry: PropertyLikeListEntry, query: string) => {
  if (!query) {
    return true;
  }

  const haystack = [
    entry.propertyTitle,
    entry.propertyCode,
    entry.propertyLocation,
    entry.userName,
    entry.userEmail,
    entry.propertyId,
    entry.userId,
  ]
    .map((value) => toStringValue(value))
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
};

const matchesActiveFilter = (entry: PropertyLikeListEntry, filterValue: string) => {
  if (!filterValue) {
    return true;
  }

  return filterValue === "true" ? entry.isActive : !entry.isActive;
};

const matchesPropertyFilter = (entry: PropertyLikeListEntry, propertyId: string) => {
  if (!propertyId) {
    return true;
  }

  return toStringValue(entry.propertyId) === propertyId;
};

const matchesUserFilter = (entry: PropertyLikeListEntry, userId: string) => {
  if (!userId) {
    return true;
  }

  return toStringValue(entry.userId) === userId;
};

const formatDateTime = (value: string) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPrice = (entry: PropertyLikeListEntry) => {
  if (entry.propertyPrice === null) {
    return "Price on request";
  }

  return `${entry.propertyCurrency || "NPR"} ${new Intl.NumberFormat("en-NP").format(entry.propertyPrice)}`;
};

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
      isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
    }`}
  >
    {isActive ? "Active" : "Inactive"}
  </span>
);

const StatsCard = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) => (
  <div className="rounded-opsh-xl border border-opsh-grey bg-white p-4 shadow-opsh-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-opsh-muted">{label}</p>
        <p className="mt-2 text-2xl font-bold text-opsh-primary">{value}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-opsh-primary/10 text-opsh-primary">
        {icon}
      </div>
    </div>
  </div>
);

export default function PropertyLikesAdminPage() {
  const authUser = useAuthStore((state) => state.user as Record<string, unknown> | null);
  const storeRoles = useAuthStore((state) => state.roles);

  const currentUserId = readCurrentUserId(authUser);
  const currentUserName = buildCurrentUserName(authUser);
  const currentUserEmail = toStringValue(authUser?.email);

  const normalizedRoles = useMemo(() => {
    const embeddedRoles = normalizeRoleNames(authUser?.roles);
    return Array.from(
      new Set([...storeRoles.map((role) => role.trim()), ...embeddedRoles])
    );
  }, [authUser?.roles, storeRoles]);

  const isGlobalLikesViewer = useMemo(
    () =>
      normalizedRoles.some((role) => {
        const normalized = role.toLowerCase();
        return normalized === "admin" || normalized === "super admin" || normalized === "superadmin";
      }),
    [normalizedRoles]
  );

  const {
    items,
    filters,
    pagination,
    page,
    setPage,
    updateFilter,
    submitSearch,
    isLoading,
    isFetching,
  } = useAdminListPage<PropertyLikeListEntry, PropertyLikeAdminListFilters>({
    defaultFilters: defaultPropertyLikeFilters,
    queryKeyBase: ["admin-property-likes", currentUserId ?? "guest", isGlobalLikesViewer ? "all" : "own"],
    searchKeys: isGlobalLikesViewer ? ["search"] : [],
    enabled: currentUserId !== null,
    fetchPage: ({ page: currentPage, filters: currentFilters, signal }) => {
      if (!currentUserId) {
        return Promise.resolve({
          items: [],
          pagination: {
            total: 0,
            per_page: Number(currentFilters.limit || 15),
            current_page: currentPage,
            last_page: 0,
          },
        });
      }

      if (isGlobalLikesViewer) {
        return getPropertyLikeAuditPage(currentPage, currentFilters, signal);
      }

      return getUserLikedPropertiesPage(
        currentUserId,
        currentPage,
        { limit: currentFilters.limit },
        {
          id: currentUserId,
          name: currentUserName,
          email: currentUserEmail,
        },
        signal
      );
    },
  });

  const visibleItems = useMemo(() => {
    const normalizedQuery = filters.search.trim().toLowerCase();

    return items.filter((entry) => {
      if (!matchesQuery(entry, normalizedQuery)) {
        return false;
      }

      if (!matchesActiveFilter(entry, filters.is_active)) {
        return false;
      }

      if (isGlobalLikesViewer && !matchesUserFilter(entry, filters.user_id)) {
        return false;
      }

      return matchesPropertyFilter(entry, filters.property_id);
    });
  }, [filters.is_active, filters.property_id, filters.search, filters.user_id, isGlobalLikesViewer, items]);

  const activeCount = visibleItems.filter((entry) => entry.isActive).length;
  const inactiveCount = visibleItems.length - activeCount;
  const isTableLoading = isLoading || isFetching;

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitSearch();
  };

  const pageTitle = isGlobalLikesViewer ? "Property Likes Monitor" : "My Liked Properties";
  const pageDescription = isGlobalLikesViewer
    ? "Track which users are liking properties across the platform."
    : "Review the properties you have liked and revisit them quickly.";

  return (
    <div className="px-3 py-1">
      <div className="mb-1 flex flex-col items-center gap-1 sm:flex-row md:gap-4">
        <h5 className="hidden text-sm text-opsh-muted md:block">Admin Workspace</h5>
        <hr className="mt-2 w-full flex-grow border-t border-gray-300 sm:ml-4 sm:mt-0 sm:w-auto" />
        <h5 className="hidden text-sm md:block">{pageTitle}</h5>
      </div>

      <div className="space-y-5">
        <div className="rounded-opsh-xl border border-opsh-grey bg-white p-5 shadow-opsh-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-opsh-secondary">Property Likes</p>
              <h1 className="mt-2 text-2xl font-bold text-opsh-primary">{pageTitle}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-opsh-text-dark">{pageDescription}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <StatsCard label="Visible Likes" value={visibleItems.length} icon={<FaHeart className="text-lg" />} />
              <StatsCard label="Active" value={activeCount} icon={<FaHeart className="text-lg" />} />
              <StatsCard label="Inactive" value={inactiveCount} icon={<FaRegHeart className="text-lg" />} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 rounded-opsh-xl border border-opsh-grey bg-white p-4 shadow-opsh-sm xl:grid-cols-[1.5fr,1fr]">
          <form className="flex items-center gap-2" onSubmit={handleSearchSubmit}>
            <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-opsh-muted">
                <FaSearch className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder={isGlobalLikesViewer ? "Search user, property, code..." : "Search within current page..."}
                className="w-full rounded-lg border border-opsh-grey px-10 py-2.5 text-sm text-opsh-black outline-none transition focus:border-opsh-primary"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-opsh-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-opsh-primary-hover"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <select
              value={filters.is_active}
              onChange={(event) => updateFilter("is_active", event.target.value)}
              className="rounded-lg border border-opsh-grey px-3 py-2.5 text-sm text-opsh-black outline-none transition focus:border-opsh-primary"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {isGlobalLikesViewer ? (
              <input
                type="text"
                value={filters.user_id}
                onChange={(event) => updateFilter("user_id", event.target.value)}
                placeholder="User ID"
                className="min-w-[110px] rounded-lg border border-opsh-grey px-3 py-2.5 text-sm text-opsh-black outline-none transition focus:border-opsh-primary"
              />
            ) : null}

            <input
              type="text"
              value={filters.property_id}
              onChange={(event) => updateFilter("property_id", event.target.value)}
              placeholder="Property ID"
              className="min-w-[120px] rounded-lg border border-opsh-grey px-3 py-2.5 text-sm text-opsh-black outline-none transition focus:border-opsh-primary"
            />

            <select
              value={filters.limit}
              onChange={(event) => updateFilter("limit", event.target.value)}
              className="rounded-lg border border-opsh-grey px-3 py-2.5 text-sm text-opsh-black outline-none transition focus:border-opsh-primary"
            >
              <option value="15">15 per page</option>
              <option value="30">30 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {!currentUserId ? (
          <div className="rounded-opsh-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
            Unable to determine the authenticated user for property-like tracking.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-opsh-xl border border-opsh-grey bg-white shadow-opsh-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-opsh-primary text-white">
                <tr>
                  {isGlobalLikesViewer ? (
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em]">User</th>
                  ) : null}
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em]">Property</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em]">Liked On</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em]">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em]">Engagement</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em]">Open</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 bg-white">
                {isTableLoading ? (
                  <SearchingData rows={8} columns={isGlobalLikesViewer ? 6 : 5} />
                ) : visibleItems.length > 0 ? (
                  visibleItems.map((entry) => (
                    <tr key={`${entry.id}-${entry.propertyId ?? "property"}`} className="hover:bg-opsh-background-light">
                      {isGlobalLikesViewer ? (
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-3">
                            <ProfileAvatar
                              firstName={entry.userName.split(" ")[0] || entry.userName}
                              lastName={entry.userName.split(" ").slice(1).join(" ")}
                              size="sm"
                              className="h-9 w-9"
                            />
                            <div>
                              <p className="text-sm font-semibold text-opsh-black">{entry.userName}</p>
                              <p className="text-xs text-opsh-muted">{entry.userEmail || "No email returned"}</p>
                              {entry.userId ? (
                                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-opsh-secondary">
                                  User ID: {entry.userId}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                      ) : null}

                      <td className="px-4 py-3 align-top">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-opsh-black">{entry.propertyTitle}</p>
                          <p className="text-xs text-opsh-muted">{entry.propertyLocation || "Location unavailable"}</p>
                          <div className="flex flex-wrap gap-2 text-[11px] font-medium">
                            {entry.propertyCode ? (
                              <span className="rounded-full bg-opsh-background px-2 py-1 text-opsh-primary">
                                Code: {entry.propertyCode}
                              </span>
                            ) : null}
                            {entry.propertyId ? (
                              <span className="rounded-full bg-opsh-background px-2 py-1 text-opsh-primary">
                                ID: {entry.propertyId}
                              </span>
                            ) : null}
                            <span className="rounded-full bg-opsh-background px-2 py-1 text-opsh-primary">
                              {formatPrice(entry)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 align-top text-sm text-opsh-text-dark">
                        <div>{formatDateTime(entry.likedAt)}</div>
                        {entry.updatedAt && entry.updatedAt !== entry.likedAt ? (
                          <div className="mt-1 text-xs text-opsh-muted">Updated: {formatDateTime(entry.updatedAt)}</div>
                        ) : null}
                      </td>

                      <td className="px-4 py-3 align-top">
                        <StatusBadge isActive={entry.isActive} />
                      </td>

                      <td className="px-4 py-3 align-top">
                        <div className="inline-flex items-center gap-2 rounded-full bg-opsh-background px-3 py-1.5 text-sm font-semibold text-opsh-primary">
                          <FaHeart className="text-sm" />
                          <span>{entry.propertyLikesCount}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center align-top">
                        {entry.propertySlug ? (
                          <Link
                            href={`/properties/${entry.propertySlug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-full border border-opsh-grey bg-white p-2 text-opsh-primary transition hover:border-opsh-primary hover:bg-opsh-background"
                            title="Open property"
                          >
                            <FaExternalLinkAlt className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <span className="text-xs text-opsh-muted">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isGlobalLikesViewer ? 6 : 5} className="px-6 py-12">
                      <EmptyState />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isTableLoading && pagination.last_page > 1 ? (
          <PaginationControls
            currentPage={pagination.current_page}
            lastPage={pagination.last_page}
            onPageChange={setPage}
            onNext={() => page < pagination.last_page && setPage(page + 1)}
            onPrev={() => page > 1 && setPage(page - 1)}
          />
        ) : null}
      </div>
    </div>
  );
}
