const { prisma } = require("../lib/prisma");

async function bootstrapDatabase() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Character" (
      "id" INTEGER NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "image" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "model3d" TEXT,
      "detailsJson" TEXT NOT NULL,
      "statsJson" TEXT NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" INTEGER NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'viewer',
      "isActive" BOOLEAN NOT NULL DEFAULT true
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Permission" (
      "code" TEXT NOT NULL PRIMARY KEY,
      "label" TEXT NOT NULL
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserPermission" (
      "userId" INTEGER NOT NULL,
      "permissionCode" TEXT NOT NULL,
      PRIMARY KEY ("userId", "permissionCode"),
      CONSTRAINT "UserPermission_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "UserPermission_permissionCode_fkey"
        FOREIGN KEY ("permissionCode") REFERENCES "Permission" ("code")
        ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AdminAuditLog" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "actorUserId" INTEGER NOT NULL,
      "actorName" TEXT NOT NULL,
      "targetUserId" INTEGER NOT NULL,
      "targetUserName" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "detailsJson" TEXT NOT NULL,
      "createdAt" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const userColumns = await prisma.$queryRawUnsafe(`PRAGMA table_info("User");`);
  const hasRoleColumn = Array.isArray(userColumns)
    && userColumns.some((column) => column.name === "role");
  const hasIsActiveColumn = Array.isArray(userColumns)
    && userColumns.some((column) => column.name === "isActive");

  if (!hasRoleColumn) {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'viewer';
    `);
  }

  if (!hasIsActiveColumn) {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
    `);
  }

  await prisma.$executeRawUnsafe(`
    UPDATE "User" SET "role" = 'viewer' WHERE "role" IS NULL OR "role" = '';
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "User" SET "isActive" = true WHERE "isActive" IS NULL;
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "User"
    SET "role" = 'admin'
    WHERE "id" = (SELECT MIN("id") FROM "User");
  `);

  await prisma.$executeRawUnsafe(`
    INSERT OR IGNORE INTO "Permission" ("code", "label")
    VALUES ('canManageCharacters', 'Gerenciar personagens');
  `);

  await prisma.$executeRawUnsafe(`
    INSERT OR IGNORE INTO "Permission" ("code", "label")
    VALUES ('canManageUsers', 'Gerenciar usuarios');
  `);

  await prisma.$executeRawUnsafe(`
    INSERT OR IGNORE INTO "UserPermission" ("userId", "permissionCode")
    SELECT "id", 'canManageCharacters'
    FROM "User"
    WHERE "role" = 'admin';
  `);

  await prisma.$executeRawUnsafe(`
    INSERT OR IGNORE INTO "UserPermission" ("userId", "permissionCode")
    SELECT "id", 'canManageUsers'
    FROM "User"
    WHERE "role" = 'admin';
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Favorite" (
      "userId" INTEGER NOT NULL,
      "characterId" INTEGER NOT NULL,
      PRIMARY KEY ("userId", "characterId"),
      CONSTRAINT "Favorite_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "Favorite_characterId_fkey"
        FOREIGN KEY ("characterId") REFERENCES "Character" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
}

module.exports = {
  bootstrapDatabase,
};
