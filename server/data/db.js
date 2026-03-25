const { prisma } = require("../lib/prisma");

function parseSqliteBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim().toLowerCase();
    return normalizedValue === "1" || normalizedValue === "true";
  }

  return true;
}

function parseUserPermissionCodes(user) {
  if (!Array.isArray(user.userPermissions)) {
    return [];
  }

  return user.userPermissions
    .map((userPermission) => userPermission.permission?.code ?? userPermission.permissionCode)
    .filter((permission) => typeof permission === "string");
}

function parseUser(user) {
  return {
    ...user,
    isActive: typeof user.isActive === "boolean" ? user.isActive : true,
    permissions: parseUserPermissionCodes(user),
  };
}

function parseCharacter(character) {
  return {
    id: character.id,
    name: character.name,
    category: character.category,
    image: character.image,
    description: character.description,
    model3d: character.model3d ?? undefined,
    details: JSON.parse(character.detailsJson),
    stats: JSON.parse(character.statsJson),
  };
}

function parseAdminAuditLog(log) {
  return {
    id: Number(log.id),
    actorUserId: Number(log.actorUserId),
    actorName: log.actorName,
    targetUserId: Number(log.targetUserId),
    targetUserName: log.targetUserName,
    action: log.action,
    details: JSON.parse(log.detailsJson),
    createdAt: log.createdAt,
  };
}

async function findCharacters() {
  const characters = await prisma.character.findMany({
    orderBy: { id: "asc" },
  });

  return characters.map(parseCharacter);
}

async function findCharacterById(id) {
  const character = await prisma.character.findUnique({
    where: { id },
  });

  return character ? parseCharacter(character) : null;
}

async function createCharacter(data) {
  const character = await prisma.character.create({
    data: {
      id: data.id,
      name: data.name,
      category: data.category,
      image: data.image,
      description: data.description,
      model3d: data.model3d ?? null,
      detailsJson: JSON.stringify(data.details ?? {}),
      statsJson: JSON.stringify(data.stats ?? {}),
    },
  });

  return parseCharacter(character);
}

async function updateCharacter(id, data) {
  const character = await prisma.character.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      image: data.image,
      description: data.description,
      model3d: data.model3d ?? null,
      detailsJson: JSON.stringify(data.details ?? {}),
      statsJson: JSON.stringify(data.stats ?? {}),
    },
  });

  return parseCharacter(character);
}

async function deleteCharacter(id) {
  await prisma.character.delete({
    where: { id },
  });
}

async function findNextCharacterId() {
  const character = await prisma.character.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  return (character?.id ?? 0) + 1;
}

async function findUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      favorites: true,
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const activeRows = await prisma.$queryRawUnsafe(
    `
      SELECT "isActive"
      FROM "User"
      WHERE "id" = ?
      LIMIT 1
    `,
    id,
  );
  const activeRow = Array.isArray(activeRows) ? activeRows[0] : null;

  return parseUser({
    ...user,
    isActive: parseSqliteBoolean(activeRow?.isActive),
  });
}

async function findUserByEmail(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      favorites: true,
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const activeRows = await prisma.$queryRawUnsafe(
    `
      SELECT "isActive"
      FROM "User"
      WHERE "email" = ?
      LIMIT 1
    `,
    email,
  );
  const activeRow = Array.isArray(activeRows) ? activeRows[0] : null;

  return parseUser({
    ...user,
    isActive: parseSqliteBoolean(activeRow?.isActive),
  });
}

async function findNextUserId() {
  const user = await prisma.user.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  return (user?.id ?? 0) + 1;
}

async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: [
      { id: "asc" },
    ],
    include: {
      favorites: true,
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  const activeRows = await prisma.$queryRawUnsafe(`
    SELECT "id", "isActive"
    FROM "User"
  `);
  const activeStateByUserId = new Map(
    Array.isArray(activeRows)
      ? activeRows.map((row) => [Number(row.id), parseSqliteBoolean(row.isActive)])
      : [],
  );

  return users.map((user) => parseUser({
    ...user,
    isActive: activeStateByUserId.get(user.id) ?? true,
  }));
}

async function createUser(data) {
  const user = await prisma.user.create({
    data: {
      role: data.role ?? "viewer",
      isActive: data.isActive ?? true,
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      userPermissions: data.permissions?.length
        ? {
            create: data.permissions.map((permissionCode) => ({
              permission: {
                connect: {
                  code: permissionCode,
                },
              },
            })),
          }
        : undefined,
    },
    include: {
      favorites: true,
      userPermissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  return parseUser(user);
}

async function replaceUserPermissions(userId, permissionCodes) {
  await prisma.userPermission.deleteMany({
    where: { userId },
  });

  if (permissionCodes.length > 0) {
    await prisma.userPermission.createMany({
      data: permissionCodes.map((permissionCode) => ({
        userId,
        permissionCode,
      })),
    });
  }

  return findUserById(userId);
}

async function updateUser(userId, data) {
  const assignments = [`"name" = ?`, `"isActive" = ?`];
  const values = [data.name, data.isActive ? 1 : 0];

  if (typeof data.passwordHash === "string" && data.passwordHash.length > 0) {
    assignments.push(`"passwordHash" = ?`);
    values.push(data.passwordHash);
  }

  await prisma.$executeRawUnsafe(
    `
      UPDATE "User"
      SET ${assignments.join(", ")}
      WHERE "id" = ?
    `,
    ...values,
    userId,
  );

  return findUserById(userId);
}

async function createAdminAuditLog(data) {
  await prisma.$executeRawUnsafe(
    `
      INSERT INTO "AdminAuditLog"
      ("actorUserId", "actorName", "targetUserId", "targetUserName", "action", "detailsJson")
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    data.actorUserId,
    data.actorName,
    data.targetUserId,
    data.targetUserName,
    data.action,
    JSON.stringify(data.details ?? {}),
  );
}

async function listAdminAuditLogs(limit = 12) {
  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT "id", "actorUserId", "actorName", "targetUserId", "targetUserName", "action", "detailsJson", "createdAt"
      FROM "AdminAuditLog"
      ORDER BY datetime("createdAt") DESC, "id" DESC
      LIMIT ?
    `,
    limit,
  );

  return Array.isArray(rows) ? rows.map(parseAdminAuditLog) : [];
}

async function listFavoriteIds(userId) {
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { characterId: "asc" },
    select: { characterId: true },
  });

  return favorites.map((favorite) => favorite.characterId);
}

async function addFavorite(userId, characterId) {
  await prisma.favorite.upsert({
    where: {
      userId_characterId: {
        userId,
        characterId,
      },
    },
    update: {},
    create: {
      userId,
      characterId,
    },
  });
}

async function removeFavorite(userId, characterId) {
  await prisma.favorite.deleteMany({
    where: {
      userId,
      characterId,
    },
  });
}

module.exports = {
  addFavorite,
  createCharacter,
  createUser,
  deleteCharacter,
  findCharacterById,
  findCharacters,
  findNextCharacterId,
  findNextUserId,
  findUserByEmail,
  findUserById,
  listAdminAuditLogs,
  listUsers,
  listFavoriteIds,
  createAdminAuditLog,
  replaceUserPermissions,
  removeFavorite,
  updateUser,
  updateCharacter,
};
