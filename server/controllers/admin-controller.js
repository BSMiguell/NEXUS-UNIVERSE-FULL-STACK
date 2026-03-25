const bcrypt = require("bcryptjs");
const {
  createAdminAuditLog,
  findUserById,
  listAdminAuditLogs,
  listUsers,
  replaceUserPermissions,
  updateUser,
} = require("../data/db");
const { sanitizeUser } = require("../lib/auth");
const {
  adminUserUpdateSchema,
  getZodMessage,
  userPermissionsSchema,
} = require("../schemas");

async function listAdminUsers(request, response) {
  const users = await listUsers();

  response.json(users.map(sanitizeUser));
}

async function listAuditLogs(request, response) {
  const logs = await listAdminAuditLogs(60);
  response.json(logs);
}

async function updateUserPermissions(request, response) {
  const userId = Number(request.params.id);
  const user = await findUserById(userId);

  if (!user) {
    return response.status(404).json({ message: "Usuario nao encontrado." });
  }

  const parsedBody = userPermissionsSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: getZodMessage(parsedBody.error, "Permissoes invalidas."),
    });
  }

  const isUpdatingSelf = request.user?.id === userId;
  const nextPermissions = parsedBody.data.permissions;

  if (isUpdatingSelf && !nextPermissions.includes("canManageUsers")) {
    return response.status(400).json({
      message: "Voce nao pode remover seu proprio acesso de gerenciamento de usuarios.",
    });
  }

  const nextUser = await replaceUserPermissions(userId, nextPermissions);

  await createAdminAuditLog({
    actorUserId: request.user.id,
    actorName: request.user.name,
    targetUserId: nextUser.id,
    targetUserName: nextUser.name,
    action: "permissions.updated",
    details: {
      permissions: nextPermissions,
    },
  });

  response.json(sanitizeUser(nextUser));
}

async function updateAdminUser(request, response) {
  const userId = Number(request.params.id);
  const user = await findUserById(userId);

  if (!user) {
    return response.status(404).json({ message: "Usuario nao encontrado." });
  }

  const parsedBody = adminUserUpdateSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: getZodMessage(parsedBody.error, "Dados do usuario invalidos."),
    });
  }

  const nextPassword = parsedBody.data.password?.trim();

  if (request.user?.id === userId && !parsedBody.data.isActive) {
    return response.status(400).json({
      message: "Voce nao pode desativar a propria conta.",
    });
  }

  const nextUser = await updateUser(userId, {
    name: parsedBody.data.name.trim(),
    passwordHash: nextPassword
      ? await bcrypt.hash(nextPassword, 10)
      : undefined,
    isActive: parsedBody.data.isActive,
  });

  await createAdminAuditLog({
    actorUserId: request.user.id,
    actorName: request.user.name,
    targetUserId: nextUser.id,
    targetUserName: nextUser.name,
    action: "user.updated",
    details: {
      name: nextUser.name,
      isActive: nextUser.isActive,
      passwordChanged: Boolean(nextPassword),
    },
  });

  response.json(sanitizeUser(nextUser));
}

module.exports = {
  listAuditLogs,
  listAdminUsers,
  updateAdminUser,
  updateUserPermissions,
};
