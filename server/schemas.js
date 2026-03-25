const { z } = require("zod");

const loginSchema = z.object({
  email: z.email("Informe um email valido.").trim(),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres."),
  email: z.email("Informe um email valido.").trim(),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

const characterStatsSchema = z.object({
  forca: z.coerce.number().min(0, "Forca deve ser maior ou igual a 0."),
  velocidade: z.coerce.number().min(0, "Velocidade deve ser maior ou igual a 0."),
  defesa: z.coerce.number().min(0, "Defesa deve ser maior ou igual a 0."),
  energia: z.coerce.number().min(0, "Energia deve ser maior ou igual a 0."),
  habilidade: z.coerce.number().min(0, "Habilidade deve ser maior ou igual a 0."),
});

const characterInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres."),
  category: z
    .string()
    .trim()
    .min(2, "Informe uma categoria com pelo menos 2 caracteres."),
  image: z.string().trim().min(1, "Informe a imagem do personagem."),
  description: z
    .string()
    .trim()
    .min(10, "A descricao precisa ter pelo menos 10 caracteres."),
  model3d: z.string().trim().min(1).optional(),
  details: z.record(z.string(), z.union([z.string(), z.number()])),
  stats: characterStatsSchema,
});

const charactersQuerySchema = z.object({
  search: z.string().trim().optional(),
  favorites: z.string().trim().optional(),
  category: z.string().trim().optional(),
  modelsOnly: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

const userPermissionsSchema = z.object({
  permissions: z.array(z.enum(["canManageCharacters", "canManageUsers"])).default([]),
});

const adminUserUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres."),
  password: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => value === undefined || value.length === 0 || value.length >= 6,
      "A senha precisa ter pelo menos 6 caracteres.",
    ),
  isActive: z.boolean(),
});

function getZodMessage(error, fallback) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || fallback;
  }

  return fallback;
}

module.exports = {
  characterInputSchema,
  charactersQuerySchema,
  adminUserUpdateSchema,
  getZodMessage,
  loginSchema,
  registerSchema,
  userPermissionsSchema,
};
