import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um email valido.").trim(),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres."),
  email: z.email("Informe um email valido.").trim(),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
