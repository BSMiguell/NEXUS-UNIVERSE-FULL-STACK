import { useMemo } from "react";
import { Radar, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCharactersQuery } from "@/hooks/use-characters-query";
import { useGalleryStore } from "@/store/use-gallery-store";

type FiltersBarProps = {
  totalResults: number;
};

export function FiltersBar({ totalResults }: FiltersBarProps) {
  const { data: charactersData = [] } = useCharactersQuery();
  const search = useGalleryStore((state) => state.search);
  const category = useGalleryStore((state) => state.category);
  const sort = useGalleryStore((state) => state.sort);
  const setSearch = useGalleryStore((state) => state.setSearch);
  const setCategory = useGalleryStore((state) => state.setCategory);
  const setSort = useGalleryStore((state) => state.setSort);
  const resetFilters = useGalleryStore((state) => state.resetFilters);

  const categories = useMemo(
    () => Array.from(new Set(charactersData.map((c) => c.category))).sort(),
    [charactersData],
  );

  return (
    <section className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
      <article className="quantum-panel relative rounded-[2.2rem] p-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.2rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.08),transparent_22%),radial-gradient(circle_at_82%_76%,rgba(244,63,94,0.08),transparent_18%)]" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
        </div>

        <div className="relative z-10 mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Filtros quanticos
            </div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-white">
              Matriz de navegacao
            </h2>
          </div>
          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200 shadow-[0_0_24px_rgba(45,212,191,0.12)]">
            {totalResults} {totalResults === 1 ? "Resultado" : "Resultados"}
          </div>
        </div>

        <div className="relative z-10 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/65">
              <Radar className="h-4 w-4" />
              Scanner do multiverso
            </div>
            <label className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(4,8,18,0.92),rgba(8,12,24,0.72))] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors focus-within:border-cyan-300/30">
              <Search className="h-4 w-4 text-cyan-200/80" />
              <input
                className="w-full bg-transparent text-base text-white outline-none placeholder:text-muted-foreground"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar personagem no multiverso"
                value={search}
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/65">
              <SlidersHorizontal className="h-4 w-4" />
              Filtro de categoria
            </div>
            <select
              className="w-full rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(4,8,18,0.92),rgba(8,12,24,0.72))] px-4 py-3 uppercase tracking-[0.14em] text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors focus:border-cyan-300/30"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option value="all">Todas as categorias</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </article>

      <article className="quantum-panel relative rounded-[2.2rem] p-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.2rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.06),transparent_20%),radial-gradient(circle_at_85%_24%,rgba(168,85,247,0.08),transparent_20%)]" />
          <div className="absolute inset-y-6 left-6 w-px bg-gradient-to-b from-transparent via-cyan-300/20 to-transparent" />
        </div>

        <div className="relative z-10 mb-5">
          <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
            Terminal quantico
          </div>
          <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-white">
            Controle tatico
          </h2>
        </div>

        <div className="relative z-10 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/65">
              Ordenacao quantica
            </div>
            <select
              className="w-full rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(4,8,18,0.92),rgba(8,12,24,0.72))] px-4 py-3 uppercase tracking-[0.14em] text-white outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-colors focus:border-cyan-300/30"
              onChange={(event) =>
                setSort(
                  event.target.value as "original" | "name-asc" | "name-desc",
                )
              }
              value={sort}
            >
              <option value="original">Ordem original</option>
              <option value="name-asc">Nome A-Z</option>
              <option value="name-desc">Nome Z-A</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/65">
              Limpeza tatica
            </div>
            <Button
              className="h-[52px] min-h-[52px] rounded-[1.5rem] border-white/10 bg-white/5 px-6 text-white hover:bg-white/10"
              onClick={resetFilters}
              variant="outline"
            >
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
          </div>
        </div>

        <div className="relative z-10 mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-100/55">Busca</div>
            <div className="mt-1 truncate text-sm font-semibold text-white">
              {search.trim() || "Scanner ocioso"}
            </div>
          </div>
          <div className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-100/55">Categoria</div>
            <div className="mt-1 truncate text-sm font-semibold text-white">
              {category === "all" ? "Todas as categorias" : category}
            </div>
          </div>
          <div className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.28em] text-cyan-100/55">Status</div>
            <div className="mt-1 text-sm font-semibold text-primary">Sistema ativo</div>
          </div>
        </div>
      </article>
    </section>
  );
}
