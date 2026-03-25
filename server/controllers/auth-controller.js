const bcrypt = require("bcryptjs");
const { createUser, findNextUserId, findUserByEmail } = require("../data/db");
const {
  MANAGE_CHARACTERS_PERMISSION,
  MANAGE_USERS_PERMISSION,
  createToken,
  sanitizeUser,
} = require("../lib/auth");
const { getZodMessage, loginSchema, registerSchema } = require("../schemas");

async function register(request, response) {
  const parsedBody = registerSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: getZodMessage(parsedBody.error, "Preencha nome, email e senha."),
    });
  }

  const { name, email, password } = parsedBody.data;
  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    return response.status(409).json({ message: "Email ja cadastrado." });
  }

  const nextUserId = await findNextUserId();
  const newUser = await createUser({
    id: nextUserId,
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(String(password), 10),
    role: nextUserId === 1 ? "admin" : "viewer",
    permissions:
      nextUserId === 1
        ? [MANAGE_CHARACTERS_PERMISSION, MANAGE_USERS_PERMISSION]
        : [],
  });

  response.status(201).json({
    token: createToken(newUser),
    user: sanitizeUser(newUser),
  });
}

async function login(request, response) {
  const parsedBody = loginSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return response.status(400).json({
      message: getZodMessage(parsedBody.error, "Informe email e senha."),
    });
  }

  const { email, password } = parsedBody.data;
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return response.status(401).json({ message: "Credenciais invalidas." });
  }

  if (user.isActive === false) {
    return response.status(403).json({ message: "Esta conta foi desativada." });
  }

  const passwordMatches = await bcrypt.compare(
    String(password),
    user.passwordHash,
  );

  if (!passwordMatches) {
    return response.status(401).json({ message: "Credenciais invalidas." });
  }

  response.json({
    token: createToken(user),
    user: sanitizeUser(user),
  });
}

module.exports = {
  login,
  register,
};
