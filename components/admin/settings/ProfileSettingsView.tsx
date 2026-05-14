"use client";

import { useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  FaCamera,
  FaRedoAlt,
  FaSave,
  FaSpinner,
  FaTrash,
  FaUserCog,
  FaUsers,
} from "react-icons/fa";

import {
  deleteCurrentUserProfilePicture,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  uploadCurrentUserProfilePicture,
} from "@/apis/user/user.api";
import {
  buttonOutlineClass,
  buttonPrimaryClass,
  Field,
  inputClass,
  sectionCardClass,
  textareaClass,
} from "@/components/admin/settings/settingsShared";
import ContentLoader from "@/components/loader/ContentLoader";
import ProfileAvatar from "@/components/profileAvatar/profileAvatar";
import { canManageUsers } from "@/data/adminMenu";
import { toAuthUserRecord } from "@/helper/user/normalize";
import useAuthStore from "@/stores/auth/AuthStore";
import type { UserProfile, UserProfileUpdatePayload } from "@/types/userProfile";

type ProfileFormValues = {
  firstName: string;
  middleName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bio: string;
  gender: string;
  country: string;
  state: string;
  district: string;
  localBodies: string;
  streetName: string;
};

const emptyProfileValues: ProfileFormValues = {
  firstName: "",
  middleName: "",
  lastName: "",
  username: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  bio: "",
  gender: "",
  country: "",
  state: "",
  district: "",
  localBodies: "",
  streetName: "",
};

const toProfileFormValues = (profile: UserProfile): ProfileFormValues => ({
  firstName: profile.firstName,
  middleName: profile.middleName,
  lastName: profile.lastName,
  username: profile.username,
  email: profile.email,
  phone: profile.phone,
  dateOfBirth: profile.dateOfBirth,
  bio: profile.bio,
  gender: profile.gender,
  country: profile.country,
  state: profile.state,
  district: profile.district,
  localBodies: profile.localBodies,
  streetName: profile.streetName,
});

const mapProfilePayload = (values: ProfileFormValues): UserProfileUpdatePayload => ({
  firstName: values.firstName.trim(),
  middleName: values.middleName.trim(),
  lastName: values.lastName.trim(),
  username: values.username.trim(),
  email: values.email.trim(),
  phone: values.phone.trim(),
  dateOfBirth: values.dateOfBirth,
  bio: values.bio.trim(),
  gender: values.gender.trim(),
  country: values.country.trim(),
  state: values.state.trim(),
  district: values.district.trim(),
  localBodies: values.localBodies.trim(),
  streetName: values.streetName.trim(),
});

export default function ProfileSettingsView() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setUserData = useAuthStore((state) => state.setUserData);
  const authUser = useAuthStore((state) => state.user as Record<string, unknown> | null);

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: emptyProfileValues,
  });

  const profileQuery = useQuery({
    queryKey: ["settings-profile", "self"],
    queryFn: ({ signal }) => getCurrentUserProfile(signal),
  });

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    profileForm.reset(toProfileFormValues(profileQuery.data));
    setUserData(toAuthUserRecord(profileQuery.data));
  }, [profileForm, profileQuery.data, setUserData]);

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UserProfileUpdatePayload) => updateCurrentUserProfile(payload),
    onSuccess: (profile) => {
      queryClient.setQueryData(["settings-profile", "self"], profile);
      setUserData(toAuthUserRecord(profile));
      toast.success("Profile updated successfully.");
    },
    onError: (error: unknown) => {
      const appError = error as { error?: { message?: string }; message?: string };
      toast.error(appError?.error?.message || appError?.message || "Failed to update profile.");
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file: File) => uploadCurrentUserProfilePicture(file),
    onSuccess: async () => {
      await profileQuery.refetch();
      toast.success("Profile picture updated.");
    },
    onError: (error: unknown) => {
      const appError = error as { error?: { message?: string }; message?: string };
      toast.error(appError?.error?.message || appError?.message || "Failed to upload profile picture.");
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: () => deleteCurrentUserProfilePicture(),
    onSuccess: async () => {
      await profileQuery.refetch();
      toast.success("Profile picture removed.");
    },
    onError: (error: unknown) => {
      const appError = error as { error?: { message?: string }; message?: string };
      toast.error(appError?.error?.message || appError?.message || "Failed to remove profile picture.");
    },
  });

  const profile = profileQuery.data;
  const displayName =
    profile?.fullName || String(authUser?.name ?? authUser?.full_name ?? authUser?.username ?? "Admin");
  const userRoleLabels = profile?.roles.length
    ? profile.roles
    : Array.isArray(authUser?.roles)
      ? authUser.roles.map(String)
      : [];
  const canManageUserAccounts = canManageUsers({ roles: userRoleLabels });

  const handleProfileSubmit = profileForm.handleSubmit((values) => {
    if (!values.firstName.trim() || !values.lastName.trim() || !values.username.trim() || !values.email.trim()) {
      toast.error("First name, last name, username, and email are required.");
      return;
    }

    updateProfileMutation.mutate(mapProfilePayload(values));
  });

  const handlePickPhoto = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    uploadPhotoMutation.mutate(file);
    event.target.value = "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-opsh-background via-opsh-background-dark to-opsh-background px-4 py-5 md:px-6">
      <section className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-opsh-primary via-[#055853] to-opsh-fourth text-white shadow-opsh-lg">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[auto,1fr,auto] lg:items-center">
          <div className="flex items-center gap-4">
            <ProfileAvatar
              firstName={profile?.firstName || ""}
              lastName={profile?.lastName || ""}
              imageUrl={profile?.profilePictureUrl ?? null}
              size="lg"
              className="ring-4 ring-white/20"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/70">Profile Settings</p>
              <h1 className="mt-1 text-2xl font-bold">{displayName}</h1>
              <p className="mt-1 text-sm text-white/75">
                Update your account details, profile picture, and contact information.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {userRoleLabels.map((role) => (
              <span
                key={role}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90"
              >
                {role}
              </span>
            ))}
            {profile?.status ? (
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/90">
                {profile.status}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {canManageUserAccounts ? (
              <Link
                href="/admin/user-management"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20"
              >
                <FaUsers />
                Manage Users
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => void profileQuery.refetch()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/20"
            >
              {profileQuery.isFetching ? <FaSpinner className="animate-spin" /> : <FaRedoAlt />}
              Refresh
            </button>
          </div>
        </div> 
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px,minmax(0,1fr)]">
        <aside className={sectionCardClass + " p-5"}>
          <div className="flex items-center gap-2">
            <FaUserCog className="text-opsh-primary" />
            <h2 className="text-lg font-semibold text-opsh-black">Profile Picture</h2>
          </div>
          {/* <p className="mt-1 text-sm text-opsh-text-dark">Uses `POST` and `DELETE /api/v1/user/profile-picture`.</p> */}

          <div className="mt-6 flex flex-col items-center rounded-xl border border-opsh-grey bg-opsh-background-muted/30 px-4 py-6 text-center">
            <ProfileAvatar
              firstName={profile?.firstName || ""}
              lastName={profile?.lastName || ""}
              imageUrl={profile?.profilePictureUrl ?? null}
              size="xl"
            />
            <p className="mt-4 text-base font-semibold text-opsh-black">{profile?.fullName || "Current User"}</p>
            <p className="mt-1 text-sm text-opsh-muted">
              {profile?.username ? `@${profile.username}` : "Username unavailable"}
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />

          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={handlePickPhoto}
              className={buttonPrimaryClass}
              disabled={uploadPhotoMutation.isPending}
            >
              {uploadPhotoMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaCamera />}
              {uploadPhotoMutation.isPending ? "Uploading..." : "Upload Photo"}
            </button>
            <button
              type="button"
              onClick={() => deletePhotoMutation.mutate()}
              className={buttonOutlineClass}
              disabled={deletePhotoMutation.isPending || !profile?.profilePictureUrl}
            >
              {deletePhotoMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaTrash />}
              Remove Photo
            </button>
          </div>
        </aside>

        <section className={sectionCardClass + " p-6"}>
          <div className="mb-6 border-b border-opsh-grey pb-4">
            <h2 className="text-lg font-semibold text-opsh-black">My Profile</h2>
            {/* <p className="mt-1 text-sm text-opsh-text-dark">
              Update self-profile information from `PATCH /api/v1/user`. `user_id` and status remain server-controlled.
            </p> */}
          </div>

          {profileQuery.isPending && !profile ? (
            <ContentLoader variant="profile" className="rounded-opsh-lg" />
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="First Name">
                  <input {...profileForm.register("firstName")} className={inputClass} />
                </Field>
                <Field label="Middle Name">
                  <input {...profileForm.register("middleName")} className={inputClass} />
                </Field>
                <Field label="Last Name">
                  <input {...profileForm.register("lastName")} className={inputClass} />
                </Field>
                <Field label="Username">
                  <input {...profileForm.register("username")} className={inputClass} />
                </Field>
                <Field label="Email">
                  <input type="email" {...profileForm.register("email")} className={inputClass} />
                </Field>
                <Field label="Phone">
                  <input {...profileForm.register("phone")} className={inputClass} />
                </Field>
                <Field label="Date of Birth">
                  <input type="date" {...profileForm.register("dateOfBirth")} className={inputClass} />
                </Field>
                <Field label="Gender">
                  <select {...profileForm.register("gender")} className={inputClass}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Country">
                  <input {...profileForm.register("country")} className={inputClass} />
                </Field>
                <Field label="State">
                  <input {...profileForm.register("state")} className={inputClass} />
                </Field>
                <Field label="District">
                  <input {...profileForm.register("district")} className={inputClass} />
                </Field>
                <Field label="Local Bodies">
                  <input {...profileForm.register("localBodies")} className={inputClass} />
                </Field>
                <Field label="Street Name">
                  <input {...profileForm.register("streetName")} className={inputClass} />
                </Field>
              </div>

              <Field label="Bio">
                <textarea rows={5} {...profileForm.register("bio")} className={textareaClass} />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-opsh-grey bg-opsh-background-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-opsh-muted">Roles</p>
                  <p className="mt-2 text-sm font-medium text-opsh-black">
                    {profile?.roles.join(", ") || "No roles returned"}
                  </p>
                </div>
                <div className="rounded-xl border border-opsh-grey bg-opsh-background-muted/30 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-opsh-muted">Status</p>
                  <p className="mt-2 text-sm font-medium text-opsh-black">{profile?.status || "Server controlled"}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className={buttonPrimaryClass} disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
