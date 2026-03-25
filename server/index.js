const express = require("express");
const path = require("path");
const { port } = require("./config");
const { bootstrapDatabase } = require("./data/bootstrap");
const { applySecurityMiddleware } = require("./middleware/security");
const authRoutes = require("./routes/auth-routes");
const adminRoutes = require("./routes/admin-routes");
const charactersRoutes = require("./routes/characters-routes");
const favoritesRoutes = require("./routes/favorites-routes");

const app = express();

applySecurityMiddleware(app);
app.use(express.json());
app.use(
  "/library-assets",
  express.static(path.resolve(__dirname, "../assets"), {
    fallthrough: false,
    maxAge: 0,
  }),
);

app.use("/api/characters", charactersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/me/favorites", favoritesRoutes);

async function startServer() {
  await bootstrapDatabase();

  app.listen(port, () => {
    console.log(`Servidor CRUD rodando na porta ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Falha ao iniciar o servidor.", error);
  process.exitCode = 1;
});
