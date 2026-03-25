const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config");

const MANAGE_CHARACTERS_PERMISSION = "canManageCharacters";
const MANAGE_USERS_PERMISSION = "canManageUsers";

function getStoredPermissionCodes(user) {
  if (!user) {
    return [];
  }

  if (Array.isArray(user.permissions)) {
    return user.permissions.filter((permission) => typeof permission === "string");
  }

  if (!Array.isArray(user.userPermissions)) {
    return [];
  }

  return user.userPermissions
    .map((userPermission) => userPermission.permission?.code ?? userPermission.permissionCode)
    .filter((permission) => typeof permission === "string");
}

function getUserPermissions(user) {
  const storedPermissionCodes = new Set(getStoredPermissionCodes(user));
  const hasStoredPermissions = storedPermissionCodes.size > 0;

  return {
    canManageCharacters:
      storedPermissionCodes.has(MANAGE_CHARACTERS_PERMISSION)
      || (!hasStoredPermissions && user?.role === "admin"),
    canManageUsers:
      storedPermissionCodes.has(MANAGE_USERS_PERMISSION)
      || (!hasStoredPermissions && user?.role === "admin"),
  };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: typeof user.isActive === "boolean" ? user.isActive : true,
    permissions: getUserPermissions(user),
  };
}

function createToken(user) {
  const permissions = getUserPermissions(user);

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: typeof user.isActive === "boolean" ? user.isActive : true,
      permissions,
    },
    jwtSecret,
    { expiresIn: "7d" },
  );
}

function getAuthToken(request) {
  const authorization = request.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice("Bearer ".length).trim();
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

module.exports = {
  MANAGE_CHARACTERS_PERMISSION,
  MANAGE_USERS_PERMISSION,
  createToken,
  getUserPermissions,
  getAuthToken,
  sanitizeUser,
  verifyToken,
};
