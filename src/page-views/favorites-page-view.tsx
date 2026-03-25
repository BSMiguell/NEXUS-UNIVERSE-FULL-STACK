import { Interactive3D } from "@/components/3d/interactive-3d";
import { CharacterCard } from "@/components/gallery/character-card";
import { Button } from "@/components/ui/button";
import { useInfiniteCharactersQuery } from "@/hooks/use-characters-query";
import { useResizeObserver } from "@/hooks/use-resize-observer";
import { useFavoritesStore } from "@/store/use-favorites-store";
import type { Character } from "@/types/character";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownAZ,
  ArrowUpAZ,
  Heart,
  Orbit,
  Radar,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useInView } from "react-intersection-observer";

export function FavoritesPageView() {
  const prefersReducedMotion = useReducedMotion();
  const { favoritesOrder, sort, setSort, clearFavorites } = useFavoritesStore();
  const favoriteIdsParam = useMemo(() => favoritesOrder.join(","), [favoritesOrder]);
  const parentRef = useRef<HTMLDivElement>(null);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const containerWidth = useResizeObserver(parentRef);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    root: scrollElement,
    rootMargin: "400px 0px",
  });
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteCharactersQuery(
      {
        favorites: favoriteIdsParam,
      },
      {
        enabled: favoritesOrder.length > 0,
      }
    );

  const [isClearConfirmVisible, setClearConfirmVisible] = useState(false);
  const loadedCharacters = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data]);
  const favoriteCharacters = useMemo(() => {
    const characterMap = new Map(
      loadedCharacters.map((character: Character) => [character.id, character])
    );
    return favoritesOrder.map(id => characterMap.get(id)).filter(Boolean) as Character[];
  }, [favoritesOrder, loadedCharacters]);
  const sortedCharacters = useMemo(() => {
    const sorted = [...favoriteCharacters];

    if (sort === "name-asc") {
      return sorted.sort((left, right) => left.name.localeCompare(right.name));
    }

    if (sort === "name-desc") {
      return sorted.sort((left, right) => right.name.localeCompare(left.name));
    }

    return favoriteCharacters;
  }, [favoriteCharacters, sort]);

  const columnCount = useMemo(() => {
    if (containerWidth >= 1280) return 3;
    if (containerWidth >= 768) return 2;
    return 1;
  }, [containerWidth]);

  const rowCount = Math.ceil(sortedCharacters.length / columnCount);
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 460,
    overscan: 5,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, inView, isFetchingNextPage]);

  const handleClearFavorites = () => {
    clearFavorites();
    setClearConfirmVisible(false);
  };

  return (
    <section className="space-y-8 pb-10">
      <section className="cosmos-model-hero quantum-panel relative overflow-hidden rounded-[2.4rem] p-5 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_20%,rgba(56,189,248,0.18),transparent_22%),radial-gradient(circle_at_78%_24%,rgba(251,191,36,0.12),transparent_18%),radial-gradient(circle_at_60%_88%,rgba(45,212,191,0.12),transparent_20%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-100/80 backdrop-blur-xl">
              <Heart className="h-4 w-4" />
              Capitulo III . Colecao pessoal
            </div>
            <h1 className="font-display text-[2.8rem] font-black uppercase leading-[0.92] tracking-[0.03em] text-white sm:text-6xl lg:text-7xl">
              Favoritos em <span className="cosmos-title">orbita</span>
            </h1>
            <p className="max-w-3xl text-base leading-7 text-slate-300/84 sm:text-lg sm:leading-8">
              Sua galeria afetiva agora tem o mesmo idioma cosmico da home: leitura clara,
              telemetria viva e controle tatico para ordenar ou limpar a colecao quando quiser.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <MetricCard icon={Heart} label="Favoritos" value={String(favoritesOrder.length)} />
            <MetricCard
              icon={Orbit}
              label="Modo"
              value={sort === "name-asc" ? "A-Z" : sort === "name-desc" ? "Z-A" : "ORDEM"}
            />
            <MetricCard
              icon={Radar}
              label="Status"
              value={favoritesOrder.length > 0 ? "ATIVO" : "VAZIO"}
            />
          </div>
        </div>
      </section>

      <SectionReveal delay={0.05}>
        {favoriteCharacters.length > 0 ? (
          <div className="cosmos-command-panel flex flex-wrap items-center justify-between gap-4 rounded-[1.8rem] p-4">
            <div className="flex items-center gap-2">
              <SortButton
                icon={ArrowDownAZ}
                isActive={sort === "name-asc"}
                label="A-Z"
                onClick={() => setSort("name-asc")}
              />
              <SortButton
                icon={ArrowUpAZ}
                isActive={sort === "name-desc"}
                label="Z-A"
                onClick={() => setSort("name-desc")}
              />
              <SortButton
                icon={Star}
                isActive={sort === "added-desc"}
                label="ORDEM"
                onClick={() => setSort("added-desc")}
              />
            </div>

            <Button
              className="gap-2 rounded-xl border border-red-400/20 bg-red-500/10 font-bold text-red-200 hover:bg-red-500/20"
              onClick={() => setClearConfirmVisible(true)}
              variant="ghost"
            >
              <Trash2 className="h-4 w-4" />
              Limpar colecao
            </Button>
          </div>
        ) : null}
      </SectionReveal>

      <SectionReveal delay={0.1}>
        <div
          ref={node => {
            parentRef.current = node;
            setScrollElement(node);
          }}
          className="overflow-y-auto"
          style={{ height: "calc(100vh - 270px)" }}
        >
          {sortedCharacters.length > 0 ? (
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
                    sortedCharacters.length
                  );
                  const itemsInRow = sortedCharacters.slice(firstItemIndex, lastItemIndex);

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
                        gap: "1.25rem",
                      }}
                    >
                      {itemsInRow.map((character: Character, itemIndex: number) => (
                        <CharacterCard
                          animationIndex={firstItemIndex + itemIndex}
                          character={character}
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
                    Carregando mais favoritos...
                  </div>
                ) : hasNextPage ? (
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/60">
                    Role para carregar mais
                  </div>
                ) : (
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/45">
                    Todos os favoritos carregados
                  </div>
                )}
              </div>
            </div>
          ) : isLoading && favoritesOrder.length > 0 ? (
            <div className="flex h-full items-center justify-center rounded-[2rem] border border-white/10 bg-black/20 p-12 text-center">
              <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Carregando favoritos...
              </div>
            </div>
          ) : (
            <div className="cosmos-story-panel rounded-[2rem] p-8 text-center text-muted-foreground">
              Nenhum favorito ainda. Explore a galeria e adicione seus personagens preferidos.
            </div>
          )}
        </div>
      </SectionReveal>

      {isClearConfirmVisible ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="cosmos-story-panel w-full max-w-md rounded-[2rem] p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-4 font-display text-2xl font-bold text-white">Confirmar limpeza</h3>
            <p className="mt-2 text-muted-foreground">
              Tem certeza de que deseja remover todos os seus favoritos? Esta acao nao pode ser
              desfeita.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Button
                className="rounded-xl"
                onClick={() => setClearConfirmVisible(false)}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                className="rounded-xl border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                onClick={handleClearFavorites}
                variant="ghost"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
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
    <Interactive3D>
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SortButton({
  label,
  icon: Icon,
  onClick,
  isActive,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <Button
      className="gap-2 rounded-xl font-bold"
      onClick={onClick}
      variant={isActive ? "default" : "outline"}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
