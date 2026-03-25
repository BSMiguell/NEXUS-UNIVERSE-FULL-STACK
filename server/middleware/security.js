const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const {
  authRateLimitMax,
  authRateLimitWindowMs,
  frontendOrigins,
  isProduction,
} = require("../config");

const defaultDevOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const allowedOrigins = new Set([
  ...frontendOrigins,
  ...(!isProduction ? defaultDevOrigins : []),
]);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
};

const authRateLimiter = isProduction
  ? rateLimit({
      windowMs: authRateLimitWindowMs,
      limit: authRateLimitMax,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        message: "Muitas tentativas de autenticacao. Tente novamente em alguns minutos.",
      },
    })
  : (_request, _response, next) => next();

function applySecurityMiddleware(app) {
  if (isProduction) {
    app.set("trust proxy", 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );
  app.use(cors(corsOptions));
}

module.exports = {
  applySecurityMiddleware,
  authRateLimiter,
};
