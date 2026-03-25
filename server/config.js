const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

function readString(name, fallback = "") {
  const value = process.env[name];

  if (typeof value !== "string") {
    return fallback;
  }

  return value.trim();
}

function readStringList(name) {
  const value = readString(name);

  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readPort() {
  const rawPort = readString("PORT", "3001");
  const parsedPort = Number.parseInt(rawPort, 10);

  if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
    throw new Error(`PORT invalida: ${rawPort}`);
  }

  return parsedPort;
}

function readPositiveInt(name, fallback) {
  const rawValue = readString(name, String(fallback));
  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${name} invalida: ${rawValue}`);
  }

  return parsedValue;
}

const nodeEnv = readString("NODE_ENV", "development") || "development";
const frontendOrigins = readStringList("FRONTEND_ORIGIN");
const databaseUrl = readString("DATABASE_URL", "file:./dev.db");
const jwtSecret = readString(
  "JWT_SECRET",
  nodeEnv === "production" ? "" : "your_super_secret_key_change_this",
);
const authRateLimitWindowMs = readPositiveInt(
  "AUTH_RATE_LIMIT_WINDOW_MS",
  15 * 60 * 1000,
);
const authRateLimitMax = readPositiveInt("AUTH_RATE_LIMIT_MAX", 10);

if (!jwtSecret) {
  throw new Error("JWT_SECRET e obrigatorio em producao.");
}

module.exports = {
  authRateLimitMax,
  authRateLimitWindowMs,
  databaseUrl,
  frontendOrigins,
  isProduction: nodeEnv === "production",
  jwtSecret,
  nodeEnv,
  port: readPort(),
};
