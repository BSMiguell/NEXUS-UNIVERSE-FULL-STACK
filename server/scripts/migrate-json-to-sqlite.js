const path = require("path");
const { prisma } = require("../lib/prisma");
const { readJsonFile } = require("../data/json-store");

const charactersFilePath = path.join(
  __dirname,
  "..",
  "..",
  "public",
  "api",
  "characters.json",
);
const usersFilePath = path.join(__dirname, "..", "users.json");

async function main() {
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
      "role" TEXT NOT NULL DEFAULT 'viewer'
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

  const userColumns = await prisma.$queryRawUnsafe(`PRAGMA table_info("User");`);
  const hasRoleColumn = Array.isArray(userColumns)
    && userColumns.some((column) => column.name === "role");

  if (!hasRoleColumn) {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'viewer';
    `);
  }

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
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

  const characters = readJsonFile(
    charactersFilePath,
    "Falha ao carregar personagens do JSON.",
  );
  const users = readJsonFile(
    usersFilePath,
    "Falha ao carregar usuarios do JSON.",
  );

  await prisma.favorite.deleteMany();
  await prisma.user.deleteMany();
  await prisma.character.deleteMany();

  if (characters.length > 0) {
    await prisma.character.createMany({
      data: characters.map((character) => ({
        id: character.id,
        name: character.name,
        category: character.category,
        image: character.image,
        description: character.description,
        model3d: character.model3d || null,
        detailsJson: JSON.stringify(character.details ?? {}),
        statsJson: JSON.stringify(character.stats ?? {}),
      })),
    });
  }

  for (const user of users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role || (user.id === 1 ? "admin" : "viewer"),
        userPermissions:
          (user.role || (user.id === 1 ? "admin" : "viewer")) === "admin"
            ? {
                create: [
                  {
                    permission: {
                      connect: {
                        code: "canManageCharacters",
                      },
                    },
                  },
                  {
                    permission: {
                      connect: {
                        code: "canManageUsers",
                      },
                    },
                  },
                ],
              }
            : undefined,
        favorites: {
          create: (user.favoriteIds || []).map((characterId) => ({
            character: {
              connect: { id: characterId },
            },
          })),
        },
      },
    });
  }

  console.log(
    `Migracao concluida: ${characters.length} personagens e ${users.length} usuarios importados.`,
  );
}

main()
  .catch((error) => {
    console.error("Falha ao migrar JSON para SQLite.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
