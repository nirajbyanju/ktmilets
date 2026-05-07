'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FiArrowRight,
  FiBellOff,
  FiCheck,
  FiExternalLink,
  FiRefreshCw,
} from "react-icons/fi";

import { IoNotificationsOutline } from "@/assets/icons/Icons";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/apis/notification/notification.api";
import type { AppNotification } from "@/types/notification";

const EMPTY_NOTIFICATIONS: AppNotification[] = [];

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

  return formatter.format(Math.round(diffInHours / 24), "day");
};

const formatAbsoluteTime = (value?: string): string => {
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
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export default function AdminNotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: ({ signal }) => getUnreadNotificationCount(signal),
    refetchInterval: 30_000,
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications", "inbox"],
    queryFn: ({ signal }) => getNotifications(signal),
    enabled: hasOpenedOnce,
    refetchInterval: isOpen ? 30_000 : false,
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      const currentNotifications = queryClient.getQueryData<AppNotification[]>(["notifications", "inbox"]) ?? [];
      const unreadBeforeUpdate = currentNotifications.filter((notification) => !notification.isRead).length;
      let unreadChanged = false;

      queryClient.setQueryData<AppNotification[]>(["notifications", "inbox"], (current = []) =>
        current.map((notification) => {
          if (notification.id !== notificationId || notification.isRead) {
            return notification;
          }

          unreadChanged = true;
          return {
            ...notification,
            isRead: true,
            readAt: notification.readAt ?? new Date().toISOString(),
          };
        })
      );

      if (unreadChanged) {
        queryClient.setQueryData<number>(["notifications", "unread-count"], (current) => {
          const baseline = current ?? unreadBeforeUpdate;
          return Math.max(baseline - 1, 0);
        });
      }
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.setQueryData<AppNotification[]>(["notifications", "inbox"], (current = []) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt ?? new Date().toISOString(),
        }))
      );
      queryClient.setQueryData<number>(["notifications", "unread-count"], 0);
    },
  });

  const notifications = notificationsQuery.data ?? EMPTY_NOTIFICATIONS;
  const unreadCount = unreadCountQuery.data ?? notifications.filter((notification) => !notification.isRead).length;
  const hasUnread = unreadCount > 0;
  const pendingNotificationId = markReadMutation.isPending ? markReadMutation.variables : null;

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort((left, right) => {
        const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0;
        const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0;
        return rightTime - leftTime;
      }),
    [notifications]
  );

  const openDropdown = () => {
    setIsOpen((current) => !current);
    if (!hasOpenedOnce) {
      setHasOpenedOnce(true);
    }
  };

  const handleNavigate = (url?: string) => {
    if (!url) {
      return;
    }

    setIsOpen(false);

    if (/^https?:\/\//i.test(url)) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    router.push(url);
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      try {
        await markReadMutation.mutateAsync(notification.id);
      } catch {
        // API errors are already normalized globally; navigation should still continue.
      }
    }

    handleNavigate(notification.url);
  };

  const handleRefresh = async () => {
    await Promise.all([unreadCountQuery.refetch(), notificationsQuery.refetch()]);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-md relative"
        onClick={openDropdown}
        aria-label="Notifications"
      >
        <IoNotificationsOutline className="text-xl" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-opsh-lg border border-opsh-grey bg-white shadow-opsh-lg">
          <div className="flex items-start justify-between gap-3 border-b border-opsh-grey px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-opsh-black">Notifications</h3>
              <p className="mt-1 text-xs text-opsh-muted">
                {hasUnread ? `${unreadCount} unread notifications` : "All notifications are read"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void handleRefresh()}
                className="rounded-md p-2 text-opsh-muted transition-colors hover:bg-opsh-background hover:text-opsh-primary"
                aria-label="Refresh notifications"
              >
                <FiRefreshCw
                  size={15}
                  className={unreadCountQuery.isFetching || notificationsQuery.isFetching ? "animate-spin" : ""}
                />
              </button>
              <button
                type="button"
                onClick={() => markAllMutation.mutate()}
                disabled={!hasUnread || markAllMutation.isPending}
                className="rounded-md border border-opsh-grey px-3 py-1.5 text-xs font-medium text-opsh-primary transition-colors hover:border-opsh-primary/30 hover:bg-opsh-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {markAllMutation.isPending ? "Updating..." : "Mark all read"}
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notificationsQuery.isPending ? (
              <div className="space-y-3 p-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`notification-skeleton-${index}`} className="animate-pulse rounded-opsh-md border border-opsh-grey p-4">
                    <div className="h-3 w-32 rounded bg-gray-200" />
                    <div className="mt-3 h-3 w-full rounded bg-gray-100" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : sortedNotifications.length > 0 ? (
              <div className="divide-y divide-opsh-grey">
                {sortedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 transition-colors ${notification.isRead ? "bg-white" : "bg-opsh-primary/5"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pt-1">
                        <span
                          className={`block h-2.5 w-2.5 rounded-full ${
                            notification.isRead ? "bg-opsh-grey" : "bg-opsh-secondary"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => void handleNotificationClick(notification)}
                          className="w-full text-left"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-opsh-black">{notification.title}</p>
                              <p className="mt-1 text-sm leading-5 text-opsh-muted">{notification.message}</p>
                            </div>
                            {notification.url ? (
                              /^https?:\/\//i.test(notification.url) ? (
                                <FiExternalLink size={15} className="mt-1 shrink-0 text-opsh-text" />
                              ) : (
                                <FiArrowRight size={15} className="mt-1 shrink-0 text-opsh-text" />
                              )
                            ) : null}
                          </div>
                        </button>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs text-opsh-text">
                            {notification.actor ? <span>{notification.actor}</span> : null}
                            {notification.category ? <span>{notification.category}</span> : null}
                            <span>{formatRelativeTime(notification.createdAt)}</span>
                            <span>{formatAbsoluteTime(notification.createdAt)}</span>
                          </div>

                          {!notification.isRead ? (
                            <button
                              type="button"
                              onClick={() => markReadMutation.mutate(notification.id)}
                              disabled={pendingNotificationId === notification.id}
                              className="inline-flex items-center gap-1 rounded-full border border-opsh-grey px-2.5 py-1 text-[11px] font-medium text-opsh-primary transition-colors hover:border-opsh-primary/30 hover:bg-opsh-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FiCheck size={12} />
                              {pendingNotificationId === notification.id ? "Reading..." : "Mark read"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-opsh-background text-opsh-muted">
                  <FiBellOff size={20} />
                </div>
                <p className="mt-4 text-sm font-medium text-opsh-black">No notifications yet</p>
                <p className="mt-1 text-xs text-opsh-muted">
                  New registration, property, and follow-up events will appear here.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-opsh-grey bg-opsh-background px-4 py-2 text-[11px] text-opsh-text">
            Polling the inbox until a realtime broadcast driver is enabled.
          </div>
        </div>
      ) : null}
    </div>
  );
}
