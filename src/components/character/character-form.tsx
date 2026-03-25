import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cpu, FileJson, ImageIcon, Orbit, Sparkles, Swords } from "lucide-react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { characterInputSchema } from "@/lib/character-schemas";
import { getZodMessage } from "@/lib/zod";
import type { CharacterInput } from "@/types/character";

type CharacterFormProps = {
  initialValues?: CharacterInput;
  isSubmitting?: boolean;
  mode: "create" | "edit";
  onSubmit: (values: CharacterInput) => Promise<void> | void;
};

type CharacterFormValues = {
  name: string;
  category: string;
  image: string;
  description: string;
  model3d: string;
  forca: number;
  velocidade: number;
  defesa: number;
  energia: number;
  habilidade: number;
  detailsJson: string;
};

const characterFormSchema = z.object({
  name: z.string().trim().min(2, "Informe um nome com pelo menos 2 caracteres."),
  category: z.string().trim().min(2, "Informe uma categoria com pelo menos 2 caracteres."),
  image: z.string().trim().min(1, "Informe a imagem do personagem."),
  description: z.string().trim().min(10, "A descricao precisa ter pelo menos 10 caracteres."),
  model3d: z.string(),
  forca: z.number().min(0, "Forca deve ser maior ou igual a 0."),
  velocidade: z.number().min(0, "Velocidade deve ser maior ou igual a 0."),
  defesa: z.number().min(0, "Defesa deve ser maior ou igual a 0."),
  energia: z.number().min(0, "Energia deve ser maior ou igual a 0."),
  habilidade: z.number().min(0, "Habilidade deve ser maior ou igual a 0."),
  detailsJson: z.string().min(2, "Informe os detalhes em JSON."),
});

const emptyValues: CharacterInput = {
  name: "",
  category: "",
  image: "",
  description: "",
  model3d: "",
  details: {},
  stats: {
    forca: 0,
    velocidade: 0,
    defesa: 0,
    energia: 0,
    habilidade: 0,
  },
};

function toFormValues(values: CharacterInput): CharacterFormValues {
  return {
    name: values.name,
    category: values.category,
    image: values.image,
    description: values.description,
    model3d: values.model3d ?? "",
    forca: values.stats.forca,
    velocidade: values.stats.velocidade,
    defesa: values.stats.defesa,
    energia: values.stats.energia,
    habilidade: values.stats.habilidade,
    detailsJson: JSON.stringify(values.details, null, 2),
  };
}

export function CharacterForm({
  initialValues,
  isSubmitting = false,
  mode,
  onSubmit,
}: CharacterFormProps) {
  const resolvedInitialValues = useMemo(
    () => initialValues ?? emptyValues,
    [initialValues],
  );
  const [submitError, setSubmitError] = useState("");
  const formDefaults = useMemo(
    () => toFormValues(resolvedInitialValues),
    [resolvedInitialValues],
  );
  const formDefaultsSignature = useMemo(
    () => JSON.stringify(formDefaults),
    [formDefaults],
  );
  const form = useForm<CharacterFormValues>({
    defaultValues: formDefaults,
    mode: "onSubmit",
    resolver: zodResolver(characterFormSchema),
  });

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    watch,
  } = form;

  useEffect(() => {
    reset(formDefaults);
    setSubmitError("");
  }, [formDefaults, formDefaultsSignature, reset]);

  const submitForm = async (values: CharacterFormValues) => {
    try {
      const parsedDetails = JSON.parse(values.detailsJson);
      const payload = characterInputSchema.parse({
        name: values.name.trim(),
        category: values.category.trim(),
        image: values.image.trim(),
        description: values.description.trim(),
        model3d: values.model3d.trim() || undefined,
        details: parsedDetails,
        stats: {
          forca: Number(values.forca),
          velocidade: Number(values.velocidade),
          defesa: Number(values.defesa),
          energia: Number(values.energia),
          habilidade: Number(values.habilidade),
        },
      });

      setSubmitError("");
      await onSubmit(payload);
    } catch (error) {
      setSubmitError(
        getZodMessage(
          error,
          "O campo de detalhes precisa conter JSON valido.",
        ),
      );
    }
  };

  const title =
    mode === "create" ? "Novo Personagem" : "Editar Personagem";
  const forca = Number(watch("forca") || 0);
  const velocidade = Number(watch("velocidade") || 0);
  const defesa = Number(watch("defesa") || 0);
  const energia = Number(watch("energia") || 0);
  const habilidade = Number(watch("habilidade") || 0);
  const combatPower = forca + velocidade + defesa + energia + habilidade;

  return (
    <form
      className="cosmos-model-hero quantum-panel overflow-hidden rounded-[2.5rem] p-6 lg:p-8"
      onSubmit={handleSubmit(submitForm)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_14%,rgba(56,189,248,0.18),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(251,191,36,0.1),transparent_18%),radial-gradient(circle_at_70%_84%,rgba(45,212,191,0.14),transparent_20%)]" />

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-cyan-100/80 backdrop-blur-xl">
            <Orbit className="h-4 w-4" />
            Oficina de personagens
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
            Gerenciamento operacional
          </div>
          <h1 className="font-display text-4xl uppercase tracking-[0.1em] text-white">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-300/84">
            Preencha os dados essenciais, ajuste atributos de combate e salve um JSON limpo para manter o cadastro pronto para a galeria e para as batalhas.
          </p>
        </div>
        <div className="grid w-full max-w-sm grid-cols-2 gap-3">
          <SignalCard icon={<Swords className="h-4 w-4" />} label="Poder total" value={String(combatPower)} />
          <SignalCard icon={<Sparkles className="h-4 w-4" />} label="Modo" value={mode === "create" ? "Criacao" : "Edicao"} />
        </div>
      </div>

      <section className="cosmos-story-panel relative z-10 mt-8 rounded-[2rem] p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200/80">
          <ImageIcon className="h-4 w-4" />
          Dados base
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          <Field error={errors.name?.message} label="Nome">
            <input className="cosmos-model-input w-full rounded-[1.05rem] px-4 py-3 text-white outline-none" {...register("name")} />
          </Field>

          <Field error={errors.category?.message} label="Categoria">
            <input className="cosmos-model-input w-full rounded-[1.05rem] px-4 py-3 text-white outline-none" {...register("category")} />
          </Field>

          <Field error={errors.image?.message} label="Imagem">
            <input className="cosmos-model-input w-full rounded-[1.05rem] px-4 py-3 text-white outline-none" {...register("image")} />
          </Field>

          <Field error={errors.model3d?.message} label="Modelo 3D">
            <input className="cosmos-model-input w-full rounded-[1.05rem] px-4 py-3 text-white outline-none" {...register("model3d")} />
          </Field>
        </div>

        <div className="mt-5">
          <Field error={errors.description?.message} label="Descricao">
            <textarea
              className="cosmos-model-input min-h-32 w-full resize-y rounded-[1.05rem] px-4 py-3 text-white outline-none"
              {...register("description")}
            />
          </Field>
        </div>
      </section>

      <section className="cosmos-story-panel relative z-10 mt-6 rounded-[2rem] p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200/80">
          <Cpu className="h-4 w-4" />
          Stats de combate
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <StatField error={errors.forca?.message} label="Forca" registration={register("forca", { valueAsNumber: true })} />
          <StatField error={errors.velocidade?.message} label="Velocidade" registration={register("velocidade", { valueAsNumber: true })} />
          <StatField error={errors.defesa?.message} label="Defesa" registration={register("defesa", { valueAsNumber: true })} />
          <StatField error={errors.energia?.message} label="Energia" registration={register("energia", { valueAsNumber: true })} />
          <StatField error={errors.habilidade?.message} label="Habilidade" registration={register("habilidade", { valueAsNumber: true })} />
        </div>
      </section>

      <section className="cosmos-story-panel relative z-10 mt-6 rounded-[2rem] p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200/80">
          <FileJson className="h-4 w-4" />
          Detalhes estruturados
        </div>
        <Field label="Detalhes JSON">
          <textarea
            className="cosmos-model-input min-h-48 w-full resize-y rounded-[1.05rem] px-4 py-3 font-mono text-sm normal-case tracking-normal text-white outline-none"
            {...register("detailsJson")}
          />
        </Field>
        <p className="mt-2 text-xs text-slate-300/72">
          Use um objeto JSON valido com metadados extras. Exemplo: {"{"}"origin": "anime", "tier": "S"{"}"}.
        </p>
        {submitError ? (
          <p className="mt-2 text-sm text-red-300">{submitError}</p>
        ) : null}
      </section>

      <div className="relative z-10 mt-8 flex justify-end">
        <Button className="cosmos-primary-cta rounded-[1.1rem] px-6" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Salvando..." : mode === "create" ? "Criar personagem" : "Salvar alteracoes"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </div>
      {children}
      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
    </label>
  );
}

function StatField({
  error,
  label,
  registration,
}: {
  error?: string;
  label: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <Field error={error} label={label}>
      <input
        className="cosmos-model-input w-full rounded-[1.05rem] px-4 py-3 text-white outline-none"
        min={0}
        type="number"
        {...registration}
      />
    </Field>
  );
}

function SignalCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="cosmos-signal-card">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
        {icon}
      </div>
      <div className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/60">{label}</div>
      <div className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-white">{value}</div>
    </div>
  );
}
