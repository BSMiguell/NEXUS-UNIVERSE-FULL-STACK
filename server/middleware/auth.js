const { findUserById } = require("../data/db");
const { getAuthToken, getUserPermissions, verifyToken } = require("../lib/auth");

async function requireAuth(request, response, next) {
  const token = getAuthToken(request);

  if (!token) {
    return response.status(401).json({ message: "Nao autenticado." });
  }

  try {
    const payload = verifyToken(token);
    const user = await findUserById(Number(payload.sub));

    if (!user) {
      return response.status(401).json({ message: "Sessao invalida." });
    }

    if (user.isActive === false) {
      return response.status(401).json({ message: "Conta desativada." });
    }

    request.user = {
      ...user,
      permissions: getUserPermissions(user),
    };
    next();
  } catch {
    return response.status(401).json({ message: "Token invalido." });
  }
}

function requirePermission(permission) {
  return (request, response, next) => {
    if (!request.user) {
      return response.status(401).json({ message: "Nao autenticado." });
    }

    if (!request.user.permissions?.[permission]) {
      return response.status(403).json({ message: "Acesso negado." });
    }

    next();
  };
}

module.exports = {
  requireAuth,
  requirePermission,
};
