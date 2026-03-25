import { z } from "zod";

const detailsValueSchema = z.union([z.string(), z.number()]);

export const characterStatsSchema = z.object({
  forca: z.number().min(0, "Forca deve ser maior ou igual a 0."),
  velocidade: z.number().min(0, "Velocidade deve ser maior ou igual a 0."),
  defesa: z.number().min(0, "Defesa deve ser maior ou igual a 0."),
  energia: z.number().min(0, "Energia deve ser maior ou igual a 0."),
  habilidade: z.number().min(0, "Habilidade deve ser maior ou igual a 0."),
});

export const characterInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres."),
  category: z
    .string()
    .trim()
    .min(2, "Informe uma categoria com pelo menos 2 caracteres."),
  image: z
    .string()
    .trim()
    .min(1, "Informe a imagem do personagem."),
  description: z
    .string()
    .trim()
    .min(10, "A descricao precisa ter pelo menos 10 caracteres."),
  model3d: z
    .string()
    .trim()
    .min(1, "Informe um caminho valido para o modelo 3D.")
    .optional(),
  details: z.record(z.string(), detailsValueSchema),
  stats: characterStatsSchema,
});

export type CharacterInputSchema = z.infer<typeof characterInputSchema>;
