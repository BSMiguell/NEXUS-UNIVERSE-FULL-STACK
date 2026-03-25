import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, FilePlus2, Wrench } from "lucide-react";
import { useRouter } from "next/router";
import { type ReactNode } from "react";
import { CharacterForm } from "@/components/character/character-form";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/navigation/app-link";
import {
  useCharactersQuery,
  useCreateCharacterMutation,
  useUpdateCharacterMutation,
} from "@/hooks/use-characters-query";
import { useUIStore } from "@/store/use-ui-store";
import type { CharacterInput } from "@/types/character";

type CharacterFormPageProps = {
  characterIdParam?: number;
  isEditingParam?: boolean;
};

export function CharacterFormPage({
  characterIdParam,
  isEditingParam,
}: CharacterFormPageProps = {}) {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const { data = [] } = useCharactersQuery();
  const createMutation = useCreateCharacterMutation();
  const updateMutation = useUpdateCharacterMutation();
  const pushToast = useUIStore((state) => state.pushToast);

  const routeInfo = resolveCharacterFormRouteInfo({
    characterIdParam,
    isEditingParam,
    routeCharacterIdParam: router.query.id,
  });
  const isEditing = routeInfo.isEditing;
  const characterId = routeInfo.characterId;
  const character = data.find((item) => item.id === characterId);

  if (isEditing && data.length > 0 && !character) {
    void router.replace("/");
    return null;
  }

  const handleSubmit = async (values: CharacterInput) => {
    try {
      if (isEditing && character) {
        await updateMutation.mutateAsync({ id: character.id, payload: values });
        pushToast({
          title: "Registro atualizado",
          description: `${character.name} recebeu as novas configuracoes.`,
          tone: "success",
        });
      } else {
        await createMutation.mutateAsync(values);
        pushToast({
          title: "Novo personagem criado",
          description: "A base quantica foi atualizada com sucesso.",
          tone: "success",
        });
      }

      await router.push("/");
    } catch {
      pushToast({
        title: "Falha ao salvar",
        description: "Nao foi possivel salvar este personagem agora.",
        tone: "error",
      });
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      className="space-y-6"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 42, filter: "blur(8px)" }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
    >
      <Button asChild className="rounded-[1.1rem] px-5" variant="outline">
        <AppLink to="/">
          <ChevronLeft className="h-4 w-4" />
          Voltar para galeria
        </AppLink>
      </Button>

      <section className="quantum-panel relative overflow-hidden rounded-[2rem] p-6 sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(56,189,248,0.16),transparent_22%),radial-gradient(circle_at_82%_16%,rgba(250,204,21,0.12),transparent_18%)]" />
        <div className="relative z-10 grid gap-3 sm:grid-cols-2">
          <InfoCard
            icon={isEditing ? <Wrench className="h-4 w-4" /> : <FilePlus2 className="h-4 w-4" />}
            label="Modo"
            value={isEditing ? "Edicao de personagem" : "Criacao de personagem"}
          />
          <InfoCard
            icon={<Wrench className="h-4 w-4" />}
            label="Rota"
            value={isEditing ? `/characters/${characterId}/edit` : "/characters/new"}
          />
        </div>
      </section>

      <CharacterForm
        initialValues={
          character
            ? {
                name: character.name,
                category: character.category,
                image: character.image,
                description: character.description,
                model3d: character.model3d,
                details: character.details,
                stats: character.stats,
              }
            : undefined
        }
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        mode={isEditing ? "edit" : "create"}
        onSubmit={handleSubmit}
      />
    </motion.div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="cosmos-signal-card">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
        {icon}
      </div>
      <div className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">{label}</div>
      <div className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-white">{value}</div>
    </div>
  );
}

function resolveCharacterFormRouteInfo({
  characterIdParam,
  isEditingParam,
  routeCharacterIdParam,
}: {
  characterIdParam?: number;
  isEditingParam?: boolean;
  routeCharacterIdParam?: string | string[];
}) {
  if (typeof isEditingParam === "boolean") {
    return {
      isEditing: isEditingParam,
      characterId:
        typeof characterIdParam === "number" && Number.isFinite(characterIdParam)
          ? characterIdParam
          : 0,
    };
  }

  const routeCharacterId = Array.isArray(routeCharacterIdParam)
    ? routeCharacterIdParam[0]
    : routeCharacterIdParam;
  if (routeCharacterId) {
    return { isEditing: true, characterId: Number(routeCharacterId) };
  }

  return { isEditing: false, characterId: 0 };
}
