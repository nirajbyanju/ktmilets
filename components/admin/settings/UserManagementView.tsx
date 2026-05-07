"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaPhone,
  FaPlus,
  FaRedoAlt,
  FaSearch,
  FaSpinner,
  FaUserCog,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";

import {
  createManagedUser,
  getAdminUserDirectory,
  updateManagedUserStatus,
} from "@/apis/user/user.api";
import {
  buttonOutlineClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  Field,
  inputClass,
  sectionCardClass,
  statusChipClass,
} from "@/components/admin/settings/settingsShared";
import ContentLoader from "@/components/loader/ContentLoader";
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import type {
  AdminUserDirectoryEntry,
  ManagedUserRegistrationPayload,
  ManagedUserRole,
} from "@/types/userProfile";

type UserStatusFilter = "all" | "1" | "0";

type AddUserFormValues = {
  role: ManagedUserRole;
  firstName: string;
  middleName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
};

const emptyAddUserValues: AddUserFormValues = {
  role: "employee",
  firstName: "",
  middleName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  passwordConfirmation: "",
};

const mapManagedUserPayload = (values: AddUserFormValues): ManagedUserRegistrationPayload => ({
  role: values.role,
  firstName: values.firstName.trim(),
  middleName: values.middleName.trim(),
  lastName: values.lastName.trim(),
  username: values.username.trim(),
  email: values.email.trim(),
  phone: values.phone.trim(),
  password: values.password,
  passwordConfirmation: values.passwordConfirmation,
});

const getStatusValue = (user: AdminUserDirectoryEntry): "0" | "1" | undefined => {
  if (user.statusValue === "0" || user.statusValue === "1") {
    return user.statusValue;
  }

  const normalized = user.status?.trim().toLowerCase();
  if (normalized === "active" || normalized === "1") {
    return "1";
  }

  if (normalized === "inactive" || normalized === "0") {
    return "0";
  }

  return undefined;
};

export default function UserManagementView() {
  const addUserCardRef = useRef<HTMLDivElement>(null);
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>("all");
  const [userSearch, setUserSearch] = useState("");
  const [statusUpdatingUserId, setStatusUpdatingUserId] = useState<string | number | null>(null);

  const addUserForm = useForm<AddUserFormValues>({
    defaultValues: emptyAddUserValues,
  });

  const usersQuery = useQuery({
    queryKey: ["user-management", "users", statusFilter],
    queryFn: ({ signal }) => getAdminUserDirectory(statusFilter === "all" ? undefined : statusFilter, signal),
    staleTime: 30_000,
  });

  const addUserMutation = useMutation({
    mutationFn: (payload: ManagedUserRegistrationPayload) => createManagedUser(payload),
    onSuccess: async () => {
      toast.success("User created successfully.");
      addUserForm.reset(emptyAddUserValues);
      await usersQuery.refetch();
      addUserCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    onError: (error: unknown) => {
      const appError = error as { error?: { message?: string }; message?: string };
      toast.error(appError?.error?.message || appError?.message || "Failed to create user.");
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string | number; status: "0" | "1" }) =>
      updateManagedUserStatus(userId, status),
    onSuccess: async (_, variables) => {
      toast.success(variables.status === "1" ? "User activated successfully." : "User deactivated successfully.");
      await usersQuery.refetch();
    },
    onError: (error: unknown) => {
      const appError = error as { error?: { message?: string }; message?: string };
      toast.error(appError?.error?.message || appError?.message || "Failed to update user status.");
    },
    onSettled: () => {
      setStatusUpdatingUserId(null);
    },
  });

  const visibleUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    const source = usersQuery.data ?? [];

    if (!query) {
      return source;
    }

    return source.filter((user) =>
      [user.name, user.username, user.email, user.phone, user.status, user.roles.join(" ")]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [userSearch, usersQuery.data]);

  const filterSummaryLabel =
    statusFilter === "all" ? "All users" : statusFilter === "1" ? "Active users" : "Inactive users";

  const handleAddUserSubmit = addUserForm.handleSubmit((values) => {
    if (!values.firstName.trim() || !values.lastName.trim() || !values.username.trim() || !values.email.trim()) {
      toast.error("First name, last name, username, and email are required.");
      return;
    }

    if (values.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (values.password !== values.passwordConfirmation) {
      toast.error("Password confirmation does not match.");
      return;
    }

    addUserMutation.mutate(mapManagedUserPayload(values));
  });

  const handleToggleUserStatus = (user: AdminUserDirectoryEntry) => {
    const currentStatus = getStatusValue(user);
    const nextStatus = currentStatus === "1" ? "0" : "1";

    setStatusUpdatingUserId(user.id);
    updateUserStatusMutation.mutate({
      userId: user.id,
      status: nextStatus,
    });
  };

  const scrollToAddUserForm = () => {
    addUserCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-opsh-background via-opsh-background-dark to-opsh-background px-4 py-5 md:px-6">
      <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-opsh-primary via-[#055853] to-opsh-fourth text-white shadow-opsh-lg">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1fr,auto] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">User Management</p>
            <h1 className="mt-2 text-2xl font-bold">Manage team access in one place</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/75">
              Review your user directory, filter active or inactive members, and create new staff accounts without mixing those tasks into profile settings.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/90">
                {filterSummaryLabel}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/90">
                {visibleUsers.length} visible result{visibleUsers.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link
              href="/admin/settings/profile"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20"
            >
              <FaUserCog />
              Profile Settings
            </Link>
            <button
              type="button"
              onClick={scrollToAddUserForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20"
            >
              <FaUserPlus />
              Add User
            </button>
            <button
              type="button"
              onClick={() => void usersQuery.refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20"
            >
              {usersQuery.isFetching ? <FaSpinner className="animate-spin" /> : <FaRedoAlt />}
              Refresh
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr),380px]">
        <section className={sectionCardClass + " p-5"}>
          <div className="mb-5 flex flex-col gap-4 border-b border-opsh-grey pb-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-opsh-black">User Directory</h2>
                <p className="mt-1 text-sm text-opsh-text-dark">
                  Filter by status and quickly review user contact details, usernames, and roles.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "All Users", value: "all" as const },
                  { label: "Active", value: "1" as const },
                  { label: "Inactive", value: "0" as const },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStatusFilter(item.value)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      statusFilter === item.value
                        ? "border-opsh-primary bg-opsh-primary/5 text-opsh-primary"
                        : "border-opsh-grey bg-white text-opsh-text-dark hover:bg-opsh-background-muted"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-opsh-muted text-sm" />
              <input
                type="text"
                value={userSearch}
                onChange={(event) => setUserSearch(event.target.value)}
                placeholder="Search by name, email, username, phone, or role..."
                className="w-full rounded-xl border border-opsh-grey py-3 pl-10 pr-4 text-sm focus:border-opsh-primary focus:outline-none focus:ring-2 focus:ring-opsh-primary/20"
              />
            </div>
          </div>

          {usersQuery.isPending ? (
            <ContentLoader variant="list" count={5} showActions={false} className="rounded-opsh-lg" />
          ) : visibleUsers.length > 0 ? (
            <div className="space-y-3">
              {visibleUsers.map((user: AdminUserDirectoryEntry) => (
                <div
                  key={String(user.id)}
                  className="rounded-xl border border-opsh-grey p-4 transition-colors hover:border-opsh-primary/30 hover:bg-opsh-primary/5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4">
                      <ProfileAvatar
                        firstName={user.name.split(" ")[0] || ""}
                        lastName={user.name.split(" ").slice(1).join(" ") || ""}
                        imageUrl={user.profilePictureUrl ?? null}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-opsh-black">{user.name}</h3>
                          {user.status ? (
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${statusChipClass(user.status)}`}
                            >
                              {user.status}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-3 text-sm text-opsh-text-dark">
                          {user.email ? (
                            <span className="inline-flex items-center gap-1">
                              <FaEnvelope size={12} />
                              {user.email}
                            </span>
                          ) : null}
                          {user.phone ? (
                            <span className="inline-flex items-center gap-1">
                              <FaPhone size={12} />
                              {user.phone}
                            </span>
                          ) : null}
                          {user.username ? (
                            <span className="inline-flex items-center gap-1">
                              <FaUserCog size={12} />
                              @{user.username}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span
                                key={role}
                                className="rounded-full bg-opsh-background px-3 py-1 text-xs font-medium text-opsh-text-dark"
                              >
                                {role}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-opsh-muted">No roles returned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <button
                        type="button"
                        onClick={() => handleToggleUserStatus(user)}
                        disabled={updateUserStatusMutation.isPending && statusUpdatingUserId === user.id}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors-smooth disabled:cursor-not-allowed disabled:opacity-50 ${
                          getStatusValue(user) === "1"
                            ? "bg-opsh-danger/10 text-opsh-danger hover:bg-opsh-danger/15"
                            : "bg-opsh-success/10 text-opsh-success hover:bg-opsh-success/15"
                        }`}
                      >
                        {updateUserStatusMutation.isPending && statusUpdatingUserId === user.id ? (
                          <FaSpinner className="animate-spin" />
                        ) : null}
                        {getStatusValue(user) === "1" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-opsh-grey bg-opsh-background-muted/40 px-6 py-14 text-center">
              <FaUsers className="mx-auto text-3xl text-opsh-muted" />
              <p className="mt-4 text-base font-medium text-opsh-black">No users found</p>
              <p className="mt-2 text-sm text-opsh-text-dark">
                Try a different status filter or clear the search text.
              </p>
            </div>
          )}
        </section>

        <aside ref={addUserCardRef} className={sectionCardClass + " h-fit p-5 xl:sticky xl:top-6"}>
          <div className="mb-5 border-b border-opsh-grey pb-4">
            <div className="flex items-center gap-2">
              <FaUserPlus className="text-opsh-secondary" />
              <h2 className="text-lg font-semibold text-opsh-black">Add User</h2>
            </div>
            {/* <p className="mt-1 text-sm text-opsh-text-dark">
              Create Employee or Admin accounts using `POST /api/v1/rbac/users`.
            </p> */}
          </div>

          <form onSubmit={handleAddUserSubmit} className="space-y-4">
            <Field label="Role">
              <select {...addUserForm.register("role")} className={inputClass}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <Field label="First Name">
              <input {...addUserForm.register("firstName")} className={inputClass} />
            </Field>
            <Field label="Middle Name">
              <input {...addUserForm.register("middleName")} className={inputClass} />
            </Field>
            <Field label="Last Name">
              <input {...addUserForm.register("lastName")} className={inputClass} />
            </Field>
            <Field label="Username">
              <input {...addUserForm.register("username")} className={inputClass} />
            </Field>
            <Field label="Email">
              <input type="email" {...addUserForm.register("email")} className={inputClass} />
            </Field>
            <Field label="Phone">
              <input {...addUserForm.register("phone")} className={inputClass} />
            </Field>
            <Field label="Password">
              <input type="password" {...addUserForm.register("password")} className={inputClass} />
            </Field>
            <Field label="Confirm Password">
              <input type="password" {...addUserForm.register("passwordConfirmation")} className={inputClass} />
            </Field>

            <div className="rounded-xl border border-opsh-grey bg-opsh-background-muted/30 px-4 py-3 text-sm text-opsh-text-dark">
              Profile pictures are handled by the self-profile API. New users can upload their photo later from Profile Settings after account creation.
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button type="submit" className={buttonSecondaryClass} disabled={addUserMutation.isPending}>
                {addUserMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaPlus />}
                {addUserMutation.isPending ? "Creating..." : "Create User"}
              </button>
              <Link href="/admin/settings/profile" className={buttonOutlineClass}>
                <FaUserCog />
                Open Profile Settings
              </Link>
              <button
                type="button"
                onClick={() => addUserForm.reset(emptyAddUserValues)}
                className={buttonPrimaryClass}
              >
                Reset Form
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
}
