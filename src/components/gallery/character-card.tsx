import { motion } from "framer-motion";
import { Heart, Orbit, Pencil, Swords, Trash2 } from "lucide-react";
import { useRouter } from "next/router";
import { AppLink } from "@/components/navigation/app-link";
import { Button } from "@/components/ui/button";
import { useDeleteCharacterMutation } from "@/hooks/use-characters-query";
import { useAuthStore } from "@/store/use-auth-store";
import { useFavoritesStore } from "@/store/use-favorites-store";
import { useUIStore } from "@/store/use-ui-store";
import type { Character } from "@/types/character";
import { cn } from "@/lib/utils";
import { getOptimizedImageSources } from "@/lib/image-sources";

type CharacterCardProps = {
  character: Character;
  animationIndex?: number;
};

export function CharacterCard({
  character,
  animationIndex = 0,
}: CharacterCardProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const deleteCharacterMutation = useDeleteCharacterMutation();
  const pushToast = useUIStore((state) => state.pushToast);
  const isFavorite = favoriteIds.has(character.id);

  const { webpSrc, fallbackSrc, fallbackType } = getOptimizedImageSources(
    character.image,
  );

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Deseja excluir o personagem ${character.name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteCharacterMutation.mutateAsync(character.id);
      pushToast({
        title: "Registro removido",
        description: `${character.name} foi excluido da base atual.`,
        tone: "success",
      });
    } catch {
      pushToast({
        title: "Falha ao excluir",
        description: "Nao foi possivel remover este personagem agora.",
        tone: "error",
      });
    }
  };

  const handleFavoriteToggle = async () => {
    if (!token) {
      pushToast({
        title: "Login necessario",
        description: "Entre na sua conta para salvar favoritos no servidor.",
        tone: "info",
      });
      await router.push("/login");
      return;
    }

    const nextAction = isFavorite
      ? "removido dos favoritos"
      : "adicionado aos favoritos";

    try {
      await toggleFavorite(character.id);
      pushToast({
        title: "Favoritos atualizados",
        description: `${character.name} foi ${nextAction}.`,
        tone: "success",
      });
    } catch {
      pushToast({
        title: "Falha ao atualizar favorito",
        description: "Nao foi possivel sincronizar este favorito agora.",
        tone: "error",
      });
    }
  };

  return (
    <motion.div
      layout
      custom={animationIndex}
      initial={{ opacity: 0, y: 28, scale: 0.94, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{
        duration: 0.45,
        delay: Math.min(animationIndex * 0.03, 0.18),
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -12,
        scale: 1.03,
        rotateX: -2,
        rotateY: 2,
        boxShadow:
          "0 18px 42px rgba(0, 0, 0, 0.52), 0 0 28px rgba(34, 211, 238, 0.22)",
      }}
      whileTap={{ scale: 0.985 }}
      className="quantum-card-react group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(4,8,18,0.94),rgba(6,10,22,0.98))] p-4"
    >
      <div className="card-quantum-effect-react" />
      <div className="card-quantum-frame-react" />

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.5rem] bg-slate-950/60">
        <AppLink to={`/personagem/${character.id}`} className="absolute inset-0">
          <picture>
            <source srcSet={webpSrc} type="image/webp" />
            <source srcSet={fallbackSrc} type={fallbackType} />
            <img
              src={fallbackSrc}
              alt={`Imagem de ${character.name}`}
              className="quantum-image-react h-full w-full object-cover object-top"
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="card-quantum-overlay-react absolute inset-0" />
        </AppLink>

        <div className="quantum-badge-react absolute right-4 top-4">
          {character.category}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="quantum-favorite-react absolute left-4 top-4 h-12 w-12 rounded-full border-0 bg-black/40 backdrop-blur-sm transition-all hover:bg-red-500/20"
          onClick={() => {
            void handleFavoriteToggle();
          }}
          type="button"
        >
          <Heart
            className={cn(
              "h-5 w-5 text-white transition-colors",
              isFavorite && "fill-red-500 text-red-500",
            )}
          />
        </Button>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-5">
          <div className="card-quantum-footer-react rounded-[1.3rem] p-5">
            <h3 className="card-quantum-title-react font-display text-4xl uppercase">
              {character.name}
            </h3>
            <p className="card-quantum-description-react mt-3 line-clamp-3 text-sm leading-relaxed">
              {character.description}
            </p>
          </div>
        </div>
      </div>

      <div className="quantum-actions-react mt-4 flex flex-1 flex-wrap gap-3">
        <Button asChild className="flex-1 rounded-[1rem]">
          <AppLink to={`/personagem/${character.id}`}>
            <Swords className="h-4 w-4" />
            Ver perfil
          </AppLink>
        </Button>

        {character.model3d ? (
          <Button asChild className="rounded-[1rem] px-4" variant="outline">
            <AppLink to={`/modelo/${character.id}`}>
              <Orbit className="h-4 w-4" />
              Modelo 3D
            </AppLink>
          </Button>
        ) : null}

        {user?.permissions?.canManageCharacters ? (
          <Button asChild className="flex-1 rounded-[1rem]" variant="outline">
            <AppLink to={`/characters/${character.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Editar
            </AppLink>
          </Button>
        ) : null}
        {user?.permissions?.canManageCharacters ? (
          <Button
            className="rounded-[1rem] border border-red-400/20 bg-red-500/10 px-4 text-red-200 hover:bg-red-500/20"
            onClick={() => {
              void handleDelete();
            }}
            type="button"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        ) : null}
      </div>
    </motion.div>
  );
}
