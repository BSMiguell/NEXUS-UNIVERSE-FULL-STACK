import { Background3D } from "@/components/3d/background-3d";
import { Interactive3D } from "@/components/3d/interactive-3d";
import { ModelCard } from "@/components/models/model-card";
import { ModelEmptyState } from "@/components/models/model-empty-state";
import { ModelFilters } from "@/components/models/model-filters";
import { useCharactersQuery, useInfiniteCharactersQuery } from "@/hooks/use-characters-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { getModelExtension, getModelReadinessLabel } from "@/lib/model-metadata";
import type { Character } from "@/types/character";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, useReducedMotion } from "framer-motion";
import {
  Box,
  Layers3,
  Orbit,
  Radar,
  Satellite,
  Sparkles,
  Telescope,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";

type ModelsPageViewProps = {
  focusedCharacterId?: number;
};

export function ModelsPageView({ focusedCharacterId = 0 }: ModelsPageViewProps) {
  const prefersReducedMotion = useReducedMotion();
  const { data: categoriesData = [] } = useCharactersQuery();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const parentRef = useRef<HTMLElement>(null);
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
  const containerWidth = useResizeObserver(parentRef);
  const debouncedSearch = useDebounce(search, 300);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    root: scrollElement,
    rootMargin: "400px 0px",
  });
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteCharactersQuery({
      search: debouncedSearch,
      category: category === "all" ? undefined : category,
      modelsOnly: true,
    });

  const columnCount = useMemo(() => {
    if (containerWidth >= 1280) return 4;
    if (containerWidth >= 1024) return 3;
    if (containerWidth >= 640) return 2;
    return 1;
  }, [containerWidth]);

  const loadedModels = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          categoriesData
            .filter((character: Character) => Boolean(character.model3d))
            .map((character: Character) => character.category)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [categoriesData]
  );

  const filteredModels = useMemo(() => {
    if (focusedCharacterId > 0) {
      return [...loadedModels].sort((left: Character, right: Character) => {
        if (left.id === focusedCharacterId) return -1;
        if (right.id === focusedCharacterId) return 1;
        return left.name.localeCompare(right.name);
      });
    }

    return loadedModels;
  }, [focusedCharacterId, loadedModels]);

  const focusedCharacter =
    filteredModels.find((character: Character) => character.id === focusedCharacterId) ??
    categoriesData.find((character: Character) => character.id === focusedCharacterId);
  const totalResults = data?.pages[0]?.totalItems ?? 0;
  const readinessCount = filteredModels.filter(
    (character: Character) => getModelReadinessLabel(character.model3d) === "glb online"
  ).length;
  const extensions = Array.from(
    new Set(filteredModels.map((character: Character) => getModelExtension(character.model3d)))
  ).join(" / ");
  const rowCount = Math.ceil(filteredModels.length / columnCount);
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 520,
    overscan: 5,
  });

  const handleReset = () => {
    setSearch("");
    setCategory("all");
  };

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  return (
    <div className="space-y-8 pb-12">
      <section className="cosmos-model-hero quantum-panel relative overflow-hidden rounded-[2.4rem] p-5 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <Background3D />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(56,189,248,0.2),transparent_22%),radial-gradient(circle_at_78%_24%,rgba(251,191,36,0.12),transparent_18%),radial-gradient(circle_at_60%_88%,rgba(45,212,191,0.14),transparent_20%)]" />

        <div className="relative z-10 grid gap-8 xl:grid-cols-[1.1fr_0.9fr] xl:items-end">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-100/80 backdrop-blur-xl sm:text-[11px]">
              <Orbit className="h-4 w-4" />
              Capitulo II . Arsenal tridimensional
            </div>

            <div className="space-y-4">
              <h1 className="font-display text-[2.9rem] font-black uppercase leading-[0.92] tracking-[0.03em] text-white sm:text-6xl lg:text-7xl">
                Modelos <span className="cosmos-title">3D em orbita</span>
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-300/84 sm:text-lg sm:leading-8">
                Esta pagina agora funciona como hangar curado do Nexus Universe: leitura tática,
                profundidade visual, telemetria do pipeline e uma grade de assets que ainda
                permanece rápida para navegar.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SignalPanel
                icon={<Satellite className="h-5 w-5" />}
                label="Biblioteca ativa"
                value={`${totalResults} modelos mapeados`}
              />
              <SignalPanel
                icon={<Sparkles className="h-5 w-5" />}
                label="Viewer readiness"
                value={`${readinessCount} glb online`}
              />
              <SignalPanel
                icon={<Telescope className="h-5 w-5" />}
                label="Leitura"
                value={focusedCharacter ? `Foco em ${focusedCharacter.name}` : "Matriz total"}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Modelos ativos"
              value={String(totalResults)}
              icon={Box}
              color="text-primary"
              hotspot={{
                label: "Ir para arsenal",
                onClick: () =>
                  document.getElementById("models-arsenal")?.scrollIntoView({
                    behavior: prefersReducedMotion ? "auto" : "smooth",
                    block: "start",
                  }),
              }}
            />
            <Metric
              label="Setores 3D"
              value={String(categories.length)}
              icon={Layers3}
              color="text-cyan-300"
            />
            <Metric
              label="Formatos"
              value={extensions || "N/A"}
              icon={Radar}
              color="text-amber-300"
            />
            <Metric
              label="Status"
              value={isLoading ? "Sync" : "Online"}
              icon={Orbit}
              color={isLoading ? "text-yellow-400" : "text-emerald-400"}
            />
          </div>
        </div>
      </section>

      <SectionReveal delay={0.05}>
        <ModelFilters
          categories={categories}
          category={category}
          onCategoryChange={setCategory}
          onReset={handleReset}
          onSearchChange={setSearch}
          resultsCount={totalResults}
          search={search}
        />
      </SectionReveal>

      {focusedCharacter ? (
        <SectionReveal delay={0.08}>
          <section className="cosmos-command-panel rounded-[2rem] p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
                  Foco dimensional
                </div>
                <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
                  Modelo filtrado para {focusedCharacter.name}
                </h2>
                <p className="mt-2 text-sm uppercase tracking-[0.18em] text-muted-foreground">
                  A URL atual trouxe voce direto para a assinatura 3D desse personagem.
                </p>
              </div>
            </div>
          </section>
        </SectionReveal>
      ) : null}

      <SectionReveal delay={0.12}>
        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="cosmos-story-panel">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Telemetria 3D
            </div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
              Protocolo de modelos
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <InlineInfo label="GLB online" value={String(readinessCount)} />
              <InlineInfo label="Formatos" value={extensions || "N/A"} />
              <InlineInfo
                label="Destaque"
                value={focusedCharacter ? focusedCharacter.name : "Matriz total"}
              />
            </div>
          </article>
          <article className="cosmos-story-panel">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Cockpit 3D
            </div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
              Leitura operacional
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300/84">
              Os cards exibem formato, readiness do viewer e assinatura do asset para facilitar
              triagem, navegacao e depuracao visual sem perder a atmosfera cosmica do redesign.
            </p>
          </article>
        </section>
      </SectionReveal>

      <SectionReveal delay={0.16}>
        <section
          id="models-arsenal"
          ref={node => {
            parentRef.current = node;
            setScrollElement(node);
          }}
          className="space-y-6 overflow-y-auto"
          style={{ height: "100vh" }}
        >
          <div className="cosmos-command-panel rounded-[2rem] p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-100/55">
                  Arsenal
                </div>
                <h2 className="font-display text-4xl font-black uppercase tracking-[0.1em] text-foreground">
                  Biblioteca <span className="text-primary">Tridimensional</span>
                </h2>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-200/70">
                {totalResults} assinaturas 3D detectadas na matriz atual
              </p>
            </div>
          </div>

          {filteredModels.length > 0 ? (
            <div className="space-y-6">
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                  const firstItemIndex = virtualRow.index * columnCount;
                  const lastItemIndex = Math.min(
                    firstItemIndex + columnCount,
                    filteredModels.length
                  );
                  const itemsInRow = filteredModels.slice(firstItemIndex, lastItemIndex);

                  return (
                    <div
                      key={virtualRow.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualRow.start}px)`,
                        display: "grid",
                        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                        gap: "1.5rem",
                      }}
                    >
                      {itemsInRow.map((character: Character, itemIndex: number) => (
                        <ModelCard
                          animationIndex={firstItemIndex + itemIndex}
                          character={character}
                          isHighlighted={character.id === focusedCharacterId}
                          key={character.id}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>

              <div ref={loadMoreRef} className="flex min-h-16 items-center justify-center">
                {isFetchingNextPage ? (
                  <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                    Carregando mais modelos...
                  </div>
                ) : hasNextPage ? (
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
                    Role para carregar mais
                  </div>
                ) : (
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">
                    Todos os modelos carregados
                  </div>
                )}
              </div>
            </div>
          ) : isLoading ? (
            <div className="flex min-h-[24rem] items-center justify-center rounded-[2rem] border border-white/10 bg-black/20 p-12 text-center">
              <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Carregando modelos...
              </div>
            </div>
          ) : (
            <ModelEmptyState onReset={handleReset} />
          )}
        </section>
      </SectionReveal>
    </div>
  );
}

function InlineInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-white">
        {value}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  color,
  hotspot,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  hotspot?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <Interactive3D
      hotspots={
        hotspot
          ? [
              {
                id: `${label}-hotspot`,
                label: hotspot.label,
                ariaLabel: `${hotspot.label} - ${label}`,
                top: "0.5rem",
                right: "0.5rem",
                onClick: hotspot.onClick,
              },
            ]
          : []
      }
    >
      <div className="cosmos-model-metric rounded-[1.5rem] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
              {label}
            </div>
            <div className="font-display text-3xl font-black text-white">{value}</div>
          </div>
          <Icon className={`h-7 w-7 ${color}`} />
        </div>
      </div>
    </Interactive3D>
  );
}

function SectionReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SignalPanel({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="cosmos-signal-card">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
        {icon}
      </div>
      <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.32em] text-cyan-100/55">
        {label}
      </div>
      <div className="mt-2 text-sm leading-7 text-slate-300/74">{value}</div>
    </div>
  );
}
