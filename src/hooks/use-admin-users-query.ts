import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAdminAuditLogs,
  getAdminUsers,
  updateAdminUser,
  updateAdminUserPermissions,
} from "@/services/admin";
import type { AdminAuditLog, AdminUser, AuthPermission } from "@/types/auth";

const ADMIN_USERS_QUERY_KEY = ["admin", "users"] as const;
const ADMIN_AUDIT_LOGS_QUERY_KEY = ["admin", "audit-logs"] as const;

export function useAdminUsersQuery() {
  return useQuery<AdminUser[], Error>({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: getAdminUsers,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useAdminAuditLogsQuery() {
  return useQuery<AdminAuditLog[], Error>({
    queryKey: ADMIN_AUDIT_LOGS_QUERY_KEY,
    queryFn: getAdminAuditLogs,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useUpdateAdminUserPermissionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      permissions,
    }: {
      id: number;
      permissions: AuthPermission[];
    }) => updateAdminUserPermissions(id, permissions),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_USERS_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: ADMIN_AUDIT_LOGS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      name,
      password,
      isActive,
    }: {
      id: number;
      name: string;
      password?: string;
      isActive: boolean;
    }) => updateAdminUser(id, { name, password, isActive }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ADMIN_USERS_QUERY_KEY,
      });
      await queryClient.invalidateQueries({
        queryKey: ADMIN_AUDIT_LOGS_QUERY_KEY,
      });
    },
  });
}
