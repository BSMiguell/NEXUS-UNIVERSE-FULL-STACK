import { apiClient } from "@/lib/api-client";
import type { AdminAuditLog, AdminUser, AuthPermission } from "@/types/auth";

function normalizeArrayResponse<T>(payload: unknown, possibleKeys: string[]): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (payload && typeof payload === "object") {
    for (const key of possibleKeys) {
      const value = (payload as Record<string, unknown>)[key];
      if (Array.isArray(value)) return value as T[];
    }
  }

  return [];
}

function normalizeObjectResponse<T>(payload: unknown, possibleKeys: string[]): T {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    for (const key of possibleKeys) {
      const value = (payload as Record<string, unknown>)[key];
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as T;
      }
    }
  }

  return payload as T;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data } = await apiClient.get("/api/admin/users");
  return normalizeArrayResponse<AdminUser>(data, ["users", "items", "data"]);
}

export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  const { data } = await apiClient.get("/api/admin/audit-logs");
  return normalizeArrayResponse<AdminAuditLog>(data, ["logs", "items", "data"]);
}

export async function updateAdminUserPermissions(
  id: number,
  permissions: AuthPermission[],
): Promise<AdminUser> {
  const { data } = await apiClient.patch(`/api/admin/users/${id}/permissions`, {
    permissions,
  });

  return normalizeObjectResponse<AdminUser>(data, ["user", "item", "data"]);
}

export async function updateAdminUser(
  id: number,
  payload: {
    name: string;
    password?: string;
    isActive: boolean;
  },
): Promise<AdminUser> {
  const { data } = await apiClient.patch(`/api/admin/users/${id}`, payload);
  return normalizeObjectResponse<AdminUser>(data, ["user", "item", "data"]);
}
