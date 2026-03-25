import { create } from "zustand";
import { persist } from "zustand/middleware";
import { loginUser, registerUser } from "@/services/auth";
import type { AuthUser } from "@/types/auth";

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  isAuthReady: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  markReady: () => void;
};

function parseTokenUser(token: string | null, user: AuthUser | null) {
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return user;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload =
      normalizedPayload + "=".repeat((4 - (normalizedPayload.length % 4)) % 4);
    const decodedPayload =
      typeof window !== "undefined"
        ? window.atob(paddedPayload)
        : Buffer.from(paddedPayload, "base64").toString("utf8");
    const parsedPayload = JSON.parse(decodedPayload) as Partial<AuthUser> & {
      permissions?: Partial<AuthUser["permissions"]>;
      sub?: number | string;
    };

    return {
      id: Number(parsedPayload.sub ?? user?.id ?? 0),
      name: String(parsedPayload.name ?? user?.name ?? ""),
      email: String(parsedPayload.email ?? user?.email ?? ""),
      role:
        parsedPayload.role === "admin" || parsedPayload.role === "viewer"
          ? parsedPayload.role
          : (user?.role ?? "viewer"),
      isActive:
        typeof parsedPayload.isActive === "boolean"
          ? parsedPayload.isActive
          : (user?.isActive ?? true),
      permissions: {
        canManageCharacters:
          parsedPayload.permissions?.canManageCharacters ??
          user?.permissions?.canManageCharacters ??
          parsedPayload.role === "admin",
        canManageUsers:
          parsedPayload.permissions?.canManageUsers ??
          user?.permissions?.canManageUsers ??
          parsedPayload.role === "admin",
      },
    } satisfies AuthUser;
  } catch {
    return user;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthReady: false,
      login: async (payload) => {
        const data = await loginUser(payload);
        set({ token: data.token, user: data.user, isAuthReady: true });
      },
      register: async (payload) => {
        const data = await registerUser(payload);
        set({ token: data.token, user: data.user, isAuthReady: true });
      },
      logout: () => {
        set({ token: null, user: null, isAuthReady: true });
      },
      markReady: () => {
        set({ isAuthReady: true });
      },
    }),
    {
      name: "nexus-auth-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const nextUser = parseTokenUser(state.token, state.user);
          state.user = nextUser;
        }

        state?.markReady();
      },
    },
  ),
);
