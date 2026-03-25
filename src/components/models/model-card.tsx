import { motion, useReducedMotion } from "framer-motion";
import { Box, FileCode2, Sparkles, User } from "lucide-react";
import { AppLink } from "@/components/navigation/app-link";
import { Button } from "@/components/ui/button";
import { getWebpImagePath } from "@/lib/image-sources";
import {
  getModelExtension,
  getModelFileName,
  getModelReadinessLabel,
} from "@/lib/model-metadata";
import type { Character } from "@/types/character";

type ModelCardProps = {
  character: Character;
  isHighlighted?: boolean;
  animationIndex?: number;
};

export function ModelCard({
  character,
  isHighlighted = false,
  animationIndex = 0,
}: ModelCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const webpSrc = getWebpImagePath(character.image);
  const modelFileName = getModelFileName(character.model3d);
  const modelExtension = getModelExtension(character.model3d);
  const readinessLabel = getModelReadinessLabel(character.model3d);

  return (
    <motion.article
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.98 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.36,
          delay: prefersReducedMotion ? 0 : Math.min(animationIndex * 0.03, 0.18),
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              y: -6,
              scale: 1.02,
              boxShadow: "0 22px 56px rgba(45, 212, 191, 0.16)",
            }
      }
      whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
      className={`cosmos-model-card quantum-panel group rounded-[1.9rem] ${isHighlighted ? "ring-2 ring-primary/50 shadow-[0_0_40px_rgba(45,212,191,0.18)]" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[1.9rem]">
        <picture>
          <source srcSet={webpSrc} type="image/webp" />
          <img
            alt={character.name}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
            decoding="async"
            fetchPriority="low"
            height="300"
            loading="lazy"
            src={character.image}
            width="400"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-[#04070f] via-black/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-300/10 to-transparent" />

        <div className="absolute left-4 top-4 rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-primary">
          {isHighlighted ? "Modelo focal" : "3D online"}
        </div>
        <div className="absolute bottom-4 left-4 rounded-full border border-cyan-300/20 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
          {character.category}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-2xl uppercase tracking-[0.09em] text-white">
              {character.name}
            </h3>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-primary">
              <Box className="h-5 w-5" />
            </div>
          </div>
          <p className="line-clamp-3 text-base leading-relaxed text-slate-300/88">
            {character.description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="cosmos-model-chip rounded-[1rem] p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              Arquivo
            </div>
            <div className="mt-2 line-clamp-3 text-sm font-medium text-cyan-100/80">
              {modelFileName}
            </div>
          </div>
          <div className="cosmos-model-chip rounded-[1rem] p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              Status
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              <Sparkles className="h-4 w-4" />
              {readinessLabel}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="cosmos-model-chip rounded-[1rem] p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              Formato
            </div>
            <div className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              {modelExtension}
            </div>
          </div>
          <div className="cosmos-model-chip rounded-[1rem] p-3">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              Pipeline
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
              <FileCode2 className="h-4 w-4" />
              Viewer ready
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild className="flex-1 rounded-[1.2rem]" variant="outline">
            <AppLink to={`/personagem/${character.id}`}>
              <User className="h-4 w-4" />
              Abrir perfil
            </AppLink>
          </Button>
          <Button asChild className="flex-1 rounded-[1.2rem]" variant="default">
            <AppLink to={`/modelo/${character.id}`}>
              <Box className="h-4 w-4" />
              Abrir Modelo 3D
            </AppLink>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
