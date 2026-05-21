import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { login as loginApi, logout as logoutApi, refreshToken as refreshTokenApi } from "@/apis/auth/auth.api";
import { getCurrentUserMenu } from "@/apis/rbac/rbac.api";
import {
  clearStoredAuthSession,
  getStoredAccessToken,
  getStoredAccessTokenExpiresAt,
  getStoredRefreshToken,
  isAccessTokenExpired,
  persistAuthSession,
  resolveAccessTokenExpiresAt,
} from "@/helper/auth/session";
import { normalizeAccessSnapshot, normalizeMenuItems } from "@/helper/rbac/normalize";
import { AuthSessionPayload } from "@/types/auth/LoginTypes";
import { AppMenuItem } from "@/types/rbac";

type AuthRecord = Record<string, unknown>;
type AuthUser = AuthRecord | null;

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userData: AuthRecord | null;
  user: AuthUser;
  roles: string[];
  roleIds: Array<string | number>;
  permissions: string[];
  directPermissions: string[];
  menu: AppMenuItem[];
  menuLoaded: boolean;
  isMenuLoading: boolean;
  accessTokenExpiresAt: number | null;
  lastActivity: number | null;
  isLoading: boolean;
  setToken: (token: string, userData?: AuthRecord | null) => void;
  setUserData: (userData: AuthRecord | null) => void;
  setMenu: (menu: AppMenuItem[]) => void;
  clearSession: () => void;
  hydrateAccess: (source: unknown) => void;
  loadUserMenu: () => Promise<AppMenuItem[]>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  resetActivityTimer: () => void;
  initializeAuth: (options?: { preloadMenu?: boolean }) => Promise<void>;
  hasPermission: (required: string | string[], requireAll?: boolean) => boolean;
  hasRole: (required: string | string[]) => boolean;
  markPasswordSet: () => void;
}

const isClient = typeof window !== "undefined";

const isRecord = (value: unknown): value is AuthRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mergeUser = (currentUser: AuthUser, nextUser: unknown): AuthUser => {
  if (isRecord(currentUser) && isRecord(nextUser)) {
    return { ...currentUser, ...nextUser };
  }

  return isRecord(nextUser) ? nextUser : currentUser ?? null;
};

const attachAccessToUser = (user: AuthUser, access: ReturnType<typeof normalizeAccessSnapshot>): AuthUser => {
  if (!isRecord(user)) {
    return user;
  }

  return {
    ...user,
    roles: access.roles.length > 0 ? access.roles : user.roles ?? [],
    roleIds: access.roleIds.length > 0 ? access.roleIds : user.roleIds ?? [],
    permissions: access.permissions.length > 0 ? access.permissions : user.permissions ?? [],
    directPermissions:
      access.directPermissions.length > 0 ? access.directPermissions : user.directPermissions ?? [],
  };
};

const hasAccessFields = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  const candidate = isRecord(value.user) ? value.user : null;
  const keys = ["roles", "permissions", "direct_permissions", "directPermissions", "role_ids", "roleIds"];

  return keys.some((key) => key in value || (candidate ? key in candidate : false));
};

const hasPermissionFields = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  const candidate = isRecord(value.user) ? value.user : null;
  const keys = ["permissions", "direct_permissions", "directPermissions"];

  return keys.some((key) => key in value || (candidate ? key in candidate : false));
};

const hasEmbeddedMenu = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return ["menu", "menus", "navigation", "sidebar"].some((key) => key in value);
};

const extractEmbeddedMenu = (value: unknown): AppMenuItem[] => {
  if (!isRecord(value)) {
    return [];
  }

  return normalizeMenuItems(
    value.menu ?? value.menus ?? value.navigation ?? value.sidebar ?? []
  );
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === "string") {
        return entry.trim();
      }

      if (typeof entry === "number") {
        return String(entry);
      }

      if (isRecord(entry)) {
        return String(entry.name ?? entry.slug ?? entry.key ?? "").trim();
      }

      return "";
    })
    .filter(Boolean);
};

const getLoggedOutState = () => ({
  isAuthenticated: false,
  token: null,
  userData: {},
  user: null,
  roles: [] as string[],
  roleIds: [] as Array<string | number>,
  permissions: [] as string[],
  directPermissions: [] as string[],
  menu: [] as AppMenuItem[],
  menuLoaded: false,
  isMenuLoading: false,
  accessTokenExpiresAt: null,
  lastActivity: null,
  isLoading: false,
});

const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        token: null,
        userData: {},
        user: null,
        roles: [],
        roleIds: [],
        permissions: [],
        directPermissions: [],
        menu: [],
        menuLoaded: false,
        isMenuLoading: false,
        accessTokenExpiresAt: null,
        lastActivity: null,
        isLoading: true,

        setToken: (token: string, userData?: AuthRecord | null) => {
          const resolvedToken =
            token || (typeof userData?.access_token === "string" ? userData.access_token : token);
          const mergedUser = mergeUser(get().user, userData?.user || userData);
          const embeddedMenu = userData ? extractEmbeddedMenu(userData) : [];
          const accessTokenExpiresAt =
            resolveAccessTokenExpiresAt(userData) ?? get().accessTokenExpiresAt;

          set({
            token: resolvedToken,
            isAuthenticated: true,
            userData: userData ?? get().userData ?? {},
            user: mergedUser,
            menu: embeddedMenu.length > 0 ? embeddedMenu : get().menu,
            menuLoaded: embeddedMenu.length > 0 ? true : get().menuLoaded,
            accessTokenExpiresAt,
            lastActivity: Date.now(),
            isLoading: false,
          });

          if (isClient) {
            persistAuthSession({
              ...(userData ?? {}),
              token: resolvedToken,
              accessTokenExpiresAt,
            });
          }

          if (userData) {
            get().hydrateAccess(userData);
          }
        },

        setUserData: (userData: AuthRecord | null) => {
          const mergedUser = mergeUser(get().user, userData?.user || userData);
          const embeddedMenu = userData ? extractEmbeddedMenu(userData) : [];

          set({
            userData,
            user: mergedUser,
            menu: embeddedMenu.length > 0 ? embeddedMenu : get().menu,
            menuLoaded: embeddedMenu.length > 0 ? true : get().menuLoaded,
            lastActivity: Date.now(),
          });

          if (userData) {
            get().hydrateAccess(userData);
          }
        },

        setMenu: (menu: AppMenuItem[]) => {
          set({
            menu,
            menuLoaded: true,
          });
        },

        clearSession: () => {
          set(getLoggedOutState());

          if (isClient) {
            clearStoredAuthSession();
          }
        },

        hydrateAccess: (source: unknown) => {
          const access = normalizeAccessSnapshot(source);
          const shouldUpdateAccess = hasAccessFields(source);
          const shouldUpdatePermissions = hasPermissionFields(source);
          const shouldUpdateMenu = hasEmbeddedMenu(source) && access.menu.length > 0;
          const sourceUser = isRecord(source) && isRecord(source.user) ? source.user : source;

          set((state) => {
            const nextUser = attachAccessToUser(
              mergeUser(state.user, access.user ?? sourceUser),
              access
            );

            const nextUserData = isRecord(state.userData) ? { ...state.userData } : state.userData;

            if (isRecord(nextUserData) && nextUser) {
              nextUserData.user = attachAccessToUser(
                mergeUser(isRecord(nextUserData.user) ? nextUserData.user : null, nextUser),
                access
              );
            }

            return {
              user: nextUser,
              userData: nextUserData,
              roles: shouldUpdateAccess ? access.roles : state.roles,
              roleIds: shouldUpdateAccess ? access.roleIds : state.roleIds,
              permissions: shouldUpdatePermissions ? access.permissions : state.permissions,
              directPermissions: shouldUpdatePermissions ? access.directPermissions : state.directPermissions,
              menu: shouldUpdateMenu ? access.menu : state.menu,
              menuLoaded: shouldUpdateMenu ? true : state.menuLoaded,
            };
          });
        },

        loadUserMenu: async () => {
          if (!isClient) {
            return [];
          }

          const state = get();
          if (!state.token && !state.isAuthenticated) {
            return state.menu;
          }

          set({ isMenuLoading: true });

          try {
            const response = await getCurrentUserMenu();
            const menu = normalizeMenuItems(response.data);

            set({
              menu,
              menuLoaded: true,
            });

            return menu;
          } catch (error) {
            console.error("Failed to load user menu:", error);
            return get().menu;
          } finally {
            set({ isMenuLoading: false });
          }
        },

        initializeAuth: async (options) => {
          if (!isClient) {
            set({ isLoading: false });
            return;
          }

          try {
            const shouldPreloadMenu = options?.preloadMenu ?? true;
            const token = getStoredAccessToken();
            const refreshToken = getStoredRefreshToken();
            const accessTokenExpiresAt =
              getStoredAccessTokenExpiresAt() ?? get().accessTokenExpiresAt;

            if (!token && !refreshToken) {
              get().clearSession();
              return;
            }

            if (token && !isAccessTokenExpired(accessTokenExpiresAt)) {
              set({
                token,
                isAuthenticated: true,
                accessTokenExpiresAt,
                isLoading: false,
              });

              if (get().userData) {
                get().hydrateAccess(get().userData);
              }

              if (shouldPreloadMenu && (!get().menuLoaded || get().menu.length === 0)) {
                await get().loadUserMenu();
              }
              return;
            }

            if (refreshToken) {
              const refreshed = await get().refreshAccessToken();
              if (refreshed) {
                return;
              }
            }

            get().clearSession();
          } catch (error) {
            console.error("Auth initialization error:", error);
            get().clearSession();
          } finally {
            set({ isLoading: false });
          }
        },

        login: async (email: string, password: string) => {
          try {
            const response = await loginApi({ email, password });

            if (!response.success) {
              throw new Error(response.error?.message || "Login failed");
            }

            const userData = response.data as AuthSessionPayload;
            const token = userData.token || userData.access_token;
            const embeddedMenu = extractEmbeddedMenu(userData);
            const accessTokenExpiresAt = resolveAccessTokenExpiresAt(userData);

            if (!token) {
              throw new Error("No token received");
            }

            set({
              token,
              userData,
              user: mergeUser(get().user, userData?.user || userData),
              menu: embeddedMenu.length > 0 ? embeddedMenu : get().menu,
              menuLoaded: embeddedMenu.length > 0 ? true : get().menuLoaded,
              accessTokenExpiresAt,
              isAuthenticated: true,
              lastActivity: Date.now(),
              isLoading: false,
            });

            get().hydrateAccess(userData);

            if (isClient) {
              persistAuthSession(userData);
            }

            if (!get().menuLoaded || get().menu.length === 0) {
              await get().loadUserMenu();
            }
          } catch (error) {
            console.error("Login error:", error);
            throw error;
          }
        },

        refreshAccessToken: async () => {
          try {
            if (!isClient) {
              return false;
            }

            const currentRefreshToken = getStoredRefreshToken();
            if (!currentRefreshToken) {
              get().clearSession();
              return false;
            }

            const response = await refreshTokenApi({ refresh_token: currentRefreshToken });
            const sessionData = response.data as AuthSessionPayload;

            if (response.success && (sessionData.token || sessionData.access_token)) {
              const newToken = sessionData.token || sessionData.access_token || "";
              const accessTokenExpiresAt = resolveAccessTokenExpiresAt(sessionData);
              const embeddedMenu = extractEmbeddedMenu(sessionData);

              set({
                token: newToken,
                userData: sessionData,
                user: mergeUser(get().user, sessionData?.user || sessionData),
                menu: embeddedMenu.length > 0 ? embeddedMenu : get().menu,
                menuLoaded: embeddedMenu.length > 0 ? true : get().menuLoaded,
                accessTokenExpiresAt,
                isAuthenticated: true,
                lastActivity: Date.now(),
                isLoading: false,
              });

              get().hydrateAccess(sessionData);

              persistAuthSession(sessionData);

              if (!get().menuLoaded || get().menu.length === 0) {
                await get().loadUserMenu();
              }
              return true;
            }

            get().clearSession();
            return false;
          } catch (error) {
            console.error("Refresh token error:", error);
            get().clearSession();
            return false;
          }
        },

        logout: async () => {
          try {
            const token = get().token;
            if (token && isClient) {
              try {
                await logoutApi();
              } catch (error: unknown) {
                const logoutError = error as { response?: { status?: number } };
                if (logoutError.response?.status !== 401) {
                  console.error("Logout API error:", error);
                }
              }
            }
          } catch (error) {
            console.error("Logout error:", error);
          } finally {
            get().clearSession();
          }
        },

        resetActivityTimer: () => {
          set({ lastActivity: Date.now() });
        },

        hasPermission: (required: string | string[], requireAll = true) => {
          const state = get();
          const requestedPermissions = Array.isArray(required) ? required : [required];
          const currentPermissions = new Set([
            ...state.permissions,
            ...state.directPermissions,
            ...toStringArray(state.user?.permissions),
          ]);

          if (requestedPermissions.length === 0) {
            return true;
          }

          return requireAll
            ? requestedPermissions.every((permission) => currentPermissions.has(permission))
            : requestedPermissions.some((permission) => currentPermissions.has(permission));
        },

        hasRole: (required: string | string[]) => {
          const state = get();
          const requestedRoles = Array.isArray(required) ? required : [required];
          const currentRoles = new Set([
            ...state.roles,
            ...toStringArray(state.user?.roles),
            ...(typeof state.user?.role === "string" ? [state.user.role] : []),
          ]);

          if (requestedRoles.length === 0) {
            return true;
          }

          return requestedRoles.some((role) => currentRoles.has(role));
        },

        markPasswordSet: () => {
          const user = get().user;
          if (user) {
            set({ user: { ...user, has_password: true } as typeof user });
          }
        },
      }),
      {
        name: "opsh-session",
        skipHydration: !isClient,
        partialize: (state) => ({
          token: state.token,
          userData: state.userData,
          user: state.user,
          roles: state.roles,
          roleIds: state.roleIds,
          permissions: state.permissions,
          directPermissions: state.directPermissions,
          menu: state.menu,
          menuLoaded: state.menuLoaded,
          accessTokenExpiresAt: state.accessTokenExpiresAt,
          isAuthenticated: state.isAuthenticated,
          lastActivity: state.lastActivity,
        }),
      }
    )
  )
);

export default useAuthStore;
