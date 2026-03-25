import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWebpImagePath } from "@/lib/image-sources";
import { cn } from "@/lib/utils";
import type { Character } from "@/types/character";

type CharacterSelectorDialogProps = {
  onClose: () => void;
  onSelect: (character: Character) => void;
  open: boolean;
  selectedId?: number | null;
  sideLabel: string;
  characters: Character[];
};

export function CharacterSelectorDialog({
  characters,
  onClose,
  onSelect,
  open,
  selectedId,
  sideLabel,
}: CharacterSelectorDialogProps) {
  const [query, setQuery] = useState("");

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return characters;
    }

    return characters.filter((character) => {
      return (
        character.name.toLowerCase().includes(normalizedQuery) ||
        character.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [characters, query]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 py-10 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="quantum-panel max-h-[85vh] w-full max-w-6xl overflow-hidden rounded-[2rem] p-0"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
              Seletor de personagem
            </div>
            <div className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-white">
              {sideLabel}
            </div>
          </div>
          <Button className="rounded-[1rem] px-4" onClick={onClose} type="button" variant="outline">
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>

        <div className="border-b border-white/10 px-6 py-5">
          <label className="flex h-12 items-center gap-3 rounded-[1rem] border border-white/10 bg-background/50 px-4">
            <Search className="h-4 w-4 text-cyan-200/60" />
            <input
              className="w-full bg-transparent text-sm uppercase tracking-[0.12em] text-white outline-none placeholder:text-slate-400"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar personagem ou categoria"
              type="text"
              value={query}
            />
          </label>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCharacters.map((character) => (
              <button
                className={cn(
                  "rounded-[1.4rem] border p-4 text-left transition-all",
                  selectedId === character.id
                    ? "border-primary/35 bg-primary/10 shadow-[0_0_20px_rgba(var(--surface-glow),0.18)]"
                    : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30",
                )}
                key={character.id}
                onClick={() => onSelect(character)}
                type="button"
              >
                <div className="flex items-center gap-4">
                  <picture>
                    <source srcSet={getWebpImagePath(character.image)} type="image/webp" />
                    <img
                      alt={character.name}
                      className="h-20 w-20 rounded-[1rem] object-cover"
                      height="80"
                      loading="lazy"
                      src={character.image}
                      width="80"
                    />
                  </picture>
                  <div className="min-w-0">
                    <div className="truncate font-display text-lg uppercase tracking-[0.08em] text-white">
                      {character.name}
                    </div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/60">
                      {character.category}
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-300/78">
                      {character.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredCharacters.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-white/15 bg-black/20 p-6 text-sm text-slate-300/82">
              Nenhum personagem encontrado para esse filtro.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
