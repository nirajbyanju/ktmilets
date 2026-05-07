import type {
  AdminUserDirectoryEntry,
  UserProfile,
  UserProfilePictureResult,
} from "@/types/userProfile";

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

const readStatusValue = (value: unknown): "0" | "1" | undefined => {
  if (value === 1 || value === "1" || value === true) {
    return "1";
  }

  if (value === 0 || value === "0" || value === false) {
    return "0";
  }

  const normalized = readString(value).toLowerCase();
  if (normalized === "active") {
    return "1";
  }

  if (normalized === "inactive") {
    return "0";
  }

  return undefined;
};

const readStatusLabel = (value: unknown, fallback?: "0" | "1"): string | undefined => {
  const normalized = readString(value);
  if (normalized) {
    if (normalized === "1") {
      return "Active";
    }

    if (normalized === "0") {
      return "Inactive";
    }

    return normalized;
  }

  if (fallback === "1") {
    return "Active";
  }

  if (fallback === "0") {
    return "Inactive";
  }

  return undefined;
};

const extractPayload = (payload: unknown): unknown => {
  if (!isRecord(payload)) {
    return payload;
  }

  const firstLevel = payload.data ?? payload.result ?? payload.payload;
  return firstLevel !== undefined ? firstLevel : payload;
};

const extractCollection = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  const record = readRecord(value);
  if (!record) {
    return [];
  }

  const keys = ["users", "items", "rows", "data", "result"];
  for (const key of keys) {
    if (Array.isArray(record[key])) {
      return record[key] as unknown[];
    }
  }

  return [];
};

const readRoles = (value: unknown): string[] =>
  readArray(value)
    .map((entry) => {
      if (typeof entry === "string") {
        return entry.trim();
      }

      const record = readRecord(entry);
      return readString(record?.name ?? record?.label ?? record?.title);
    })
    .filter(Boolean);

const buildFullName = (source: UnknownRecord) => {
  const firstName = readString(source.first_name ?? source.firstName);
  const middleName = readString(source.middle_name ?? source.middleName);
  const lastName = readString(source.last_name ?? source.lastName);

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ").trim();
  return fullName || readString(source.name ?? source.full_name ?? source.fullName ?? source.username ?? source.email, "User");
};

const readUserDetail = (source: UnknownRecord | null): UnknownRecord | null => {
  if (!source) {
    return null;
  }

  return (
    readRecord(source.userdetail) ??
    readRecord(source.userDetail) ??
    readRecord(source.user_detail) ??
    readRecord(source.detail) ??
    readRecord(source.details)
  );
};

const readProfilePictureUrl = (source: UnknownRecord, detail: UnknownRecord | null): string | undefined => {
  const profilePictureUrl = readString(
    source.profile_picture_url ??
      source.profilePictureUrl ??
      source.avatar_url ??
      source.avatarUrl ??
      detail?.profile_picture_url ??
      detail?.profilePictureUrl ??
      detail?.profilePicture ??
      detail?.profile_picture
  );

  return profilePictureUrl || undefined;
};

const readProfilePicturePath = (source: UnknownRecord, detail: UnknownRecord | null): string | undefined => {
  const profilePicturePath = readString(
    source.profile_picture_path ??
      source.profilePicturePath ??
      source.profile_picture ??
      detail?.profile_picture_path ??
      detail?.profilePicturePath ??
      detail?.profile_picture
  );

  return profilePicturePath || undefined;
};

const toId = (value: unknown, fallback: string): string | number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const normalized = readString(value);
  return normalized || fallback;
};

export const normalizeUserProfile = (payload: unknown): UserProfile => {
  const source = readRecord(extractPayload(payload)) ?? {};
  const userRecord = readRecord(source.user) ?? source;
  const detail = readUserDetail(source) ?? readUserDetail(userRecord);

  const firstName = readString(userRecord.first_name ?? userRecord.firstName);
  const middleName = readString(userRecord.middle_name ?? userRecord.middleName);
  const lastName = readString(userRecord.last_name ?? userRecord.lastName);
  const statusValue = readStatusValue(
    userRecord.status ?? userRecord.is_status ?? userRecord.isStatus ?? source.status
  );

  return {
    id: userRecord.id as string | number | undefined,
    firstName,
    middleName,
    lastName,
    fullName: [firstName, middleName, lastName].filter(Boolean).join(" ").trim() || buildFullName(userRecord),
    username: readString(userRecord.username ?? userRecord.userName),
    email: readString(userRecord.email),
    phone: readString(userRecord.phone),
    dateOfBirth: readString(detail?.date_of_birth ?? detail?.dateOfBirth),
    bio: readString(detail?.bio),
    gender: readString(detail?.gender),
    country: readString(detail?.country),
    state: readString(detail?.state),
    district: readString(detail?.district),
    localBodies: readString(detail?.local_bodies ?? detail?.localBodies),
    streetName: readString(detail?.street_name ?? detail?.streetName),
    status: readStatusLabel(
      userRecord.status ?? userRecord.is_status ?? userRecord.isStatus ?? source.status,
      statusValue
    ),
    statusValue,
    roles: readRoles(userRecord.roles ?? source.roles),
    profilePicturePath: readProfilePicturePath(userRecord, detail),
    profilePictureUrl: readProfilePictureUrl(userRecord, detail),
    raw: source,
  };
};

export const normalizeUserProfilePictureResult = (payload: unknown): UserProfilePictureResult => {
  const source = readRecord(extractPayload(payload)) ?? {};

  return {
    profilePicturePath: readProfilePicturePath(source, null),
    profilePictureUrl: readProfilePictureUrl(source, null),
    raw: source,
  };
};

export const normalizeAdminUserDirectory = (payload: unknown): AdminUserDirectoryEntry[] => {
  const items = extractCollection(extractPayload(payload));

  return items.map((item, index) => {
    const source = readRecord(item) ?? {};
    const userRecord = readRecord(source.user) ?? source;
    const detail = readUserDetail(source) ?? readUserDetail(userRecord);
    const statusValue = readStatusValue(
      userRecord.status ?? userRecord.is_status ?? userRecord.isStatus ?? source.status
    );

    return {
      id: toId(userRecord.id ?? source.id, `user-${index + 1}`),
      name: buildFullName(userRecord),
      username: readString(userRecord.username ?? userRecord.userName) || undefined,
      email: readString(userRecord.email) || undefined,
      phone: readString(userRecord.phone) || undefined,
      status: readStatusLabel(
        userRecord.status ?? userRecord.is_status ?? userRecord.isStatus ?? source.status,
        statusValue
      ),
      statusValue,
      roles: readRoles(source.roles ?? userRecord.roles),
      profilePictureUrl: readProfilePictureUrl(userRecord, detail),
      raw: item,
    };
  });
};

export const toAuthUserRecord = (profile: UserProfile): Record<string, unknown> => ({
  id: profile.id,
  first_name: profile.firstName,
  firstName: profile.firstName,
  middle_name: profile.middleName,
  middleName: profile.middleName,
  last_name: profile.lastName,
  lastName: profile.lastName,
  name: profile.fullName,
  full_name: profile.fullName,
  username: profile.username,
  userName: profile.username,
  email: profile.email,
  phone: profile.phone,
  status: profile.status ?? "",
  is_status: profile.statusValue ?? "",
  isStatus: profile.statusValue ?? "",
  roles: profile.roles,
  userdetail: {
    profilePicture: profile.profilePictureUrl ?? profile.profilePicturePath ?? "",
    profile_picture_url: profile.profilePictureUrl ?? "",
    profilePictureUrl: profile.profilePictureUrl ?? "",
    profile_picture_path: profile.profilePicturePath ?? "",
    profilePicturePath: profile.profilePicturePath ?? "",
    date_of_birth: profile.dateOfBirth,
    dateOfBirth: profile.dateOfBirth,
    bio: profile.bio,
    gender: profile.gender,
    country: profile.country,
    state: profile.state,
    district: profile.district,
    local_bodies: profile.localBodies,
    localBodies: profile.localBodies,
    street_name: profile.streetName,
    streetName: profile.streetName,
  },
  user_detail: {
    profile_picture_url: profile.profilePictureUrl ?? "",
    profile_picture_path: profile.profilePicturePath ?? "",
  },
});
