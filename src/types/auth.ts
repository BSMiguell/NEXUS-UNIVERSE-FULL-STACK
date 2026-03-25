export type AuthRole = "admin" | "viewer";
export type AuthPermission = "canManageCharacters" | "canManageUsers";

export type AuthPermissions = Record<AuthPermission, boolean>;

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: AuthRole;
  isActive: boolean;
  permissions: AuthPermissions;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type AdminUser = AuthUser;

export type AdminAuditLog = {
  id: number;
  actorUserId: number;
  actorName: string;
  targetUserId: number;
  targetUserName: string;
  action:
    | "permissions.updated"
    | "user.updated"
    | "character.created"
    | "character.updated"
    | "character.deleted"
    | string;
  details: Record<string, unknown>;
  createdAt: string;
};
