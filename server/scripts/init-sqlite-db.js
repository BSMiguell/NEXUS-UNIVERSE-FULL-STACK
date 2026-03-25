const { prisma } = require("../lib/prisma");
const { bootstrapDatabase } = require("../data/bootstrap");

async function main() {
  await bootstrapDatabase();

  console.log("SQLite inicializado com sucesso.");
}

main()
  .catch((error) => {
    console.error("Falha ao inicializar o SQLite.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
