import { CharacterDetails } from "@/components/character/character-details";
import { CharacterHeader } from "@/components/character/character-header";
import { CharacterStats } from "@/components/character/character-stats";
import { AppLink } from "@/components/navigation/app-link";
import { Button } from "@/components/ui/button";
import { useCharacterQuery } from "@/hooks/use-characters-query";
import { getOptimizedImageSources } from "@/lib/image-sources";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  Crosshair,
  type LucideIcon,
  Orbit,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Telescope,
} from "lucide-react";
import { type ReactNode } from "react";

type CharacterDetailPageViewProps = {
  characterId: number;
};

export function CharacterDetailPageView({ characterId }: CharacterDetailPageViewProps) {
  const isValidId = Number.isFinite(characterId) && characterId > 0;
  const prefersReducedMotion = useReducedMotion();
  const { data: character, error, isLoading } = useCharacterQuery(characterId, isValidId);

  const { webpSrc, fallbackSrc, fallbackType } = character
    ? getOptimizedImageSources(character.image)
    : { webpSrc: "", fallbackSrc: "", fallbackType: "" };

  const rank =
    character?.details.nivel ??
    character?.details["nivel"] ??
    character?.details["nÃƒÂ­vel"] ??
    character?.details["nÃƒÆ’Ã‚Â­vel"] ??
    "Classificado";

  if (!isValidId) {
    return <StatePanel title="Rota invalida" copy="O identificador do personagem nao e valido." />;
  }

  if (isLoading) {
    return (
      <StatePanel title="Sincronizando realidade" copy="Aguardando sinal quantico..." loading />
    );
  }

  if (error) {
    return (
      <StatePanel
        title="Falha ao carregar perfil"
        copy={error.message}
        action={
          <Button asChild className="rounded-[1.2rem] px-5" variant="outline">
            <AppLink to="/">
              <ChevronLeft className="h-4 w-4" />
              Voltar para galeria
            </AppLink>
          </Button>
        }
      />
    );
  }

  if (!character) {
    return (
      <StatePanel
        title="Personagem nao encontrado"
        copy="Nenhum registro foi encontrado para este perfil."
      />
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <section className="cosmos-model-hero quantum-panel relative overflow-hidden rounded-[2.4rem] p-5 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(56,189,248,0.18),transparent_22%),radial-gradient(circle_at_78%_24%,rgba(251,191,36,0.12),transparent_18%),radial-gradient(circle_at_60%_88%,rgba(45,212,191,0.12),transparent_20%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-100/80 backdrop-blur-xl">
              <Telescope className="h-4 w-4" />
              Capitulo IV . Perfil estrategico
            </div>
            <h1 className="font-display text-[2.8rem] font-black uppercase leading-[0.92] tracking-[0.03em] text-white sm:text-6xl lg:text-7xl">
              Dossie de <span className="cosmos-title">{character.name}</span>
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300/84 sm:text-lg sm:leading-8">
              Um retrato completo com contexto de origem, atributos de combate e leitura operacional
              da presenca visual deste personagem no universo Nexus.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button asChild className="rounded-[1.2rem] px-5" variant="outline">
                <AppLink to="/">
                  <ChevronLeft className="h-4 w-4" />
                  Voltar
                </AppLink>
              </Button>
              {character.model3d ? (
                <Button asChild className="rounded-[1.2rem] px-5">
                  <AppLink to={`/modelo/${character.id}`}>
                    <Orbit className="h-4 w-4" />
                    Ver modelo 3D
                  </AppLink>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <MetricCard icon={ShieldCheck} label="Categoria" value={character.category} />
            <MetricCard
              icon={ScanSearch}
              label="Registro"
              value={`ID ${character.id.toString().padStart(4, "0")}`}
            />
            <MetricCard icon={Sparkles} label="Classificacao" value={String(rank)} />
          </div>
        </div>
      </section>

      <SectionReveal delay={0.05}>
        <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <article className="cosmos-story-panel rounded-[2rem] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Narrativa de origem
            </div>
            <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.12em] text-white">
              Perfil estrategico
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
              {character.description}
            </p>
          </article>
          <article className="cosmos-story-panel rounded-[2rem] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Leitura instantanea
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <QuickInfo
                label="Universo"
                value={String(character.details.universo ?? character.category)}
              />
              <QuickInfo label="Poder" value={String(character.details.poder ?? "Nao informado")} />
              <QuickInfo label="Status" value={String(character.details.status ?? "Monitorado")} />
            </div>
          </article>
        </section>
      </SectionReveal>

      <SectionReveal delay={0.1}>
        <div className="grid gap-8 xl:grid-cols-[minmax(320px,420px)_1fr]">
          <article className="cosmos-command-panel rounded-[2.5rem] p-4">
            <div className="group relative overflow-hidden rounded-[2rem]">
              <picture>
                <source srcSet={webpSrc} type="image/webp" />
                <source srcSet={fallbackSrc} type={fallbackType} />
                <img
                  alt={character.name}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  decoding="async"
                  height="960"
                  loading="lazy"
                  src={fallbackSrc}
                  width="720"
                />
              </picture>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
              <div className="absolute inset-0 bg-primary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-4 rounded-[1.6rem] border border-white/10 opacity-50" />
              <div className="absolute bottom-4 left-4 right-4 rounded-[1.4rem] border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
                <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100/60">
                  Presenca visual
                </div>
                <div className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-white">
                  Asset principal sincronizado
                </div>
              </div>
            </div>
          </article>

          <div className="space-y-8">
            <CharacterHeader character={character} />
            <CharacterStats stats={character.stats} />
          </div>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.14}>
        <CharacterDetails details={character.details} />
      </SectionReveal>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="cosmos-model-metric rounded-[1.4rem] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-display text-2xl font-black text-white">{value}</div>
        </div>
        <Icon className="h-6 w-6 text-cyan-200/90" />
      </div>
    </div>
  );
}

function QuickInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/60">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
        {value}
      </div>
    </div>
  );
}

function SectionReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function StatePanel({
  title,
  copy,
  action,
  loading = false,
}: {
  title: string;
  copy: string;
  action?: ReactNode;
  loading?: boolean;
}) {
  return (
    <section className="cosmos-story-panel flex min-h-[50vh] flex-col items-center justify-center gap-6 rounded-[2.5rem] p-10 text-center">
      {loading ? (
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/20" />
          <div className="absolute inset-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="text-amber-300">
          <Crosshair className="h-12 w-12" />
        </div>
      )}
      <div>
        <h2 className="font-display text-2xl font-black uppercase tracking-[0.18em] text-foreground">
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm uppercase tracking-[0.16em] text-muted-foreground">
          {copy}
        </p>
      </div>
      {action ?? (
        <Button asChild className="rounded-[1.2rem] px-5" variant="outline">
          <AppLink to="/">
            <ChevronLeft className="h-4 w-4" />
            Voltar para galeria
          </AppLink>
        </Button>
      )}
    </section>
  );
}
