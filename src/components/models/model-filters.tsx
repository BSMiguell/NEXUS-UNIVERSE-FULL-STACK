import { Filter, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type ModelFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  onReset: () => void;
  resultsCount: number;
};

export function ModelFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  onReset,
  resultsCount,
}: ModelFiltersProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
      <article className="cosmos-story-panel rounded-[2rem] p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Matriz 3D
            </div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-white">
              Busca dimensional
            </h2>
          </div>
          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200">
            {resultsCount} sinais
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <label className="cosmos-model-input flex items-center gap-3 rounded-[1.4rem] px-4 py-3">
            <Search className="h-4 w-4 text-cyan-200/80" />
            <input
              className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar modelo, personagem ou universo"
              value={search}
            />
          </label>

          <select
            className="cosmos-model-input rounded-[1.4rem] px-4 py-3 uppercase tracking-[0.14em] outline-none"
            onChange={(event) => onCategoryChange(event.target.value)}
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
      </article>

      <article className="cosmos-story-panel rounded-[2rem] p-5">
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
            Terminal 3D
          </div>
          <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-white">
            Controle de leitura
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="cosmos-model-input flex items-center gap-3 rounded-[1.4rem] px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Filter className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                Leitura ativa
              </div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                Matriz sincronizada
              </div>
            </div>
          </div>

          <Button
            className="h-full min-h-12 rounded-[1.4rem]"
            onClick={onReset}
            variant="outline"
          >
            <RefreshCcw className="h-4 w-4" />
            Resetar
          </Button>
        </div>
      </article>
    </section>
  );
}
