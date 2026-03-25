import { Eye, Heart, Layers3, type LucideIcon } from "lucide-react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/use-auth-store";
import { useFavoritesStore } from "@/store/use-favorites-store";
import { useUIStore } from "@/store/use-ui-store";
import type { Character } from "@/types/character";
import { cn } from "@/lib/utils";
import { getWebpImagePath } from "@/lib/image-sources";

type CharacterHeaderProps = {
  character: Character;
};

export function CharacterHeader({ character }: CharacterHeaderProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const pushToast = useUIStore((state) => state.pushToast);
  const isFavorite = favoriteIds.has(character.id);

  // Deriva os caminhos para WebP e o formato original
  const webpSrc = getWebpImagePath(character.image);
  const originalSrc = character.image;

  const handleFavoriteToggle = async () => {
    if (!token) {
      pushToast({
        title: "Login necessario",
        description: "Entre para salvar este personagem na sua colecao.",
        tone: "info",
      });
      await router.push("/login");
      return;
    }

    const nextAction = isFavorite ? "removido dos favoritos" : "adicionado aos favoritos";

    try {
      await toggleFavorite(character.id);
      pushToast({
        title: "Colecao sincronizada",
        description: `${character.name} foi ${nextAction}.`,
        tone: "success",
      });
    } catch {
      pushToast({
        title: "Falha ao sincronizar",
        description: "Nao foi possivel atualizar este favorito agora.",
        tone: "error",
      });
    }
  };

  return (
    <header className="relative flex min-h-[420px] w-full flex-col justify-between overflow-hidden rounded-[2.2rem] border border-white/10 p-8 md:min-h-[520px] md:p-12">
      <div className="absolute inset-0 z-0">
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            src={originalSrc}
            alt={`Imagem de ${character.name}`}
            className="h-full w-full object-cover object-top"
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,0.16),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(244,63,94,0.14),transparent_20%)]" />
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-wrap items-center gap-3">
        <div className="rounded-full border border-cyan-300/20 bg-black/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200/85 backdrop-blur-md">
          Dossie premium
        </div>
        <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70 backdrop-blur-md">
          Registro #{character.id.toString().padStart(4, "0")}
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
            {character.category}
          </p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase tracking-wider text-white md:text-7xl">
            {character.name}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-200 md:text-base">
            {character.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <SignalPill icon={Eye} label="Status de leitura" value="Sincronizado" />
            <SignalPill icon={Layers3} label="Camada visual" value="Legacy+" />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-14 w-14 flex-shrink-0 rounded-full border border-white/10 bg-black/20 backdrop-blur-sm transition-all hover:bg-white/10"
          onClick={() => {
            void handleFavoriteToggle();
          }}
          type="button"
        >
          <Heart
            className={cn(
              "h-7 w-7 text-white transition-colors",
              isFavorite && "fill-red-500 text-red-500",
            )}
          />
        </Button>
      </div>
    </header>
  );
}

function SignalPill({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100/60">
        <Icon className="h-4 w-4 text-cyan-300" />
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-white">
        {value}
      </div>
    </div>
  );
}
