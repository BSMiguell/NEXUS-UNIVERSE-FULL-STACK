import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { AppLink } from "@/components/navigation/app-link";
import { useDebounce } from "@/hooks/use-debounce";
import { useCharactersQuery } from "@/hooks/use-characters-query";
import { useFuzzySearch } from "@/hooks/use-fuzzy-search";
import { getWebpImagePath } from "@/lib/image-sources";
import type { Character } from "@/types/character";

type FuzzySearchProps = {
  autoFocus?: boolean;
  onNavigate?: () => void;
};

export function FuzzySearch({
  autoFocus = false,
  onNavigate,
}: FuzzySearchProps) {
  const { data = [] } = useCharactersQuery();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const results = useFuzzySearch(data, debouncedQuery);

  const visibleResults = useMemo(
    () => results as Character[],
    [results],
  );

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cyan-200/70" />
        <input
          autoFocus={autoFocus}
          className="h-16 w-full rounded-[1.6rem] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))] pl-14 pr-12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all placeholder:text-slate-500 focus:border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar personagem no multiverso..."
          type="text"
          value={query}
        />
        {query ? (
          <button
            className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/20 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => setQuery("")}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {debouncedQuery ? (
        <div className="absolute top-full z-10 mt-3 max-h-[26rem] w-full overflow-y-auto rounded-[1.8rem] border border-cyan-300/15 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] shadow-[0_24px_80px_rgba(2,6,23,0.6)] backdrop-blur-xl">
          {visibleResults.length > 0 ? (
            <ul className="divide-y divide-white/5">
              {visibleResults.map((character: Character) => (
                <li key={character.id}>
                  <AppLink
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-cyan-300/6"
                    onClick={onNavigate}
                    to={`/personagem/${character.id}`}
                  >
                    <picture>
                      <source
                        srcSet={getWebpImagePath(character.image)}
                        type="image/webp"
                      />
                      <img
                        alt={character.name}
                        className="h-14 w-14 rounded-lg object-cover"
                        decoding="async"
                        height="56"
                        loading="lazy"
                        src={character.image}
                        width="56"
                      />
                    </picture>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200/65">
                        Registro quantico
                      </div>
                      <h3 className="mt-1 truncate font-display text-lg uppercase tracking-[0.08em] text-white">
                        {character.name}
                      </h3>
                      <p className="text-sm text-slate-400">{character.category}</p>
                    </div>
                  </AppLink>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/60">
                Sem leitura detectada
              </div>
              <p className="mt-3">
                Nenhum resultado encontrado para "{debouncedQuery}"
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <AmbientHint label="Dica" value="Pesquise por nome ou universo" />
          <AmbientHint label="Fluxo" value="Resultados com tolerancia a erro" />
          <AmbientHint label="Destino" value="Abrir perfil premium direto" />
        </div>
      )}
    </div>
  );
}

function AmbientHint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 px-4 py-3">
      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/55">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-300/82">{value}</div>
    </div>
  );
}
