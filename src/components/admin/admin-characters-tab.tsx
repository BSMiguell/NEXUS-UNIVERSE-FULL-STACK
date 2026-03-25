import { Search } from "lucide-react";
import { AppLink } from "@/components/navigation/app-link";
import { Button } from "@/components/ui/button";
import { AuditLogCard, CharacterAdminCard, FilterButton, StatusPill } from "@/components/admin/admin-page-shared";
import type { AdminAuditLog } from "@/types/auth";
import type { Character } from "@/types/character";

export function AdminCharactersTab({
  categories,
  category,
  characterPage,
  characterPageSize,
  characterTotalPages,
  deleteBusyId,
  filteredCharacters,
  failuresOnly,
  isBulkUpdating,
  modelsOnly,
  onBulkDelete,
  onBulkExport,
  onBulkMoveCategory,
  onCategoryChange,
  onCharacterPageChange,
  onCopyFailureIds,
  onDeleteCharacter,
  onClearFailures,
  onExportFailures,
  onExportFailuresCsv,
  onFailuresOnlyChange,
  onModelsOnlyChange,
  onRetryFailures,
  onSelectAllFiltered,
  onSelectAllPage,
  onSelectedChange,
  onSelectionClear,
  onSearchChange,
  paginatedCharacters,
  recentCharacterLogs,
  search,
  selectedIds,
  targetCategory,
  summary,
  onTargetCategoryChange,
  batchProgressLabel,
  batchResultLabel,
  hasFailures,
}: {
  categories: string[];
  category: string;
  characterPage: number;
  characterPageSize: number;
  characterTotalPages: number;
  deleteBusyId?: number;
  filteredCharacters: Character[];
  failuresOnly: boolean;
  isBulkUpdating: boolean;
  modelsOnly: boolean;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onBulkMoveCategory: () => void;
  onCategoryChange: (value: string) => void;
  onCharacterPageChange: (value: number | ((current: number) => number)) => void;
  onCopyFailureIds: () => void;
  onDeleteCharacter: (character: Character) => void;
  onClearFailures: () => void;
  onExportFailures: () => void;
  onExportFailuresCsv: () => void;
  onFailuresOnlyChange: (value: boolean) => void;
  onModelsOnlyChange: (value: boolean) => void;
  onRetryFailures: () => void;
  onSelectAllFiltered: () => void;
  onSelectAllPage: () => void;
  onSelectedChange: (characterId: number, selected: boolean) => void;
  onSelectionClear: () => void;
  onSearchChange: (value: string) => void;
  paginatedCharacters: Character[];
  recentCharacterLogs: AdminAuditLog[];
  search: string;
  selectedIds: number[];
  targetCategory: string;
  summary: { created: number; updated: number; deleted: number; withModel: number };
  onTargetCategoryChange: (value: string) => void;
  batchProgressLabel?: string;
  batchResultLabel?: string;
  hasFailures: boolean;
}) {
  return (
    <div className="grid gap-4">
      <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200/75">Operacoes de personagem</div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.08em] text-white">Controle editorial</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Acompanhe volume de criacao, edicao e exclusao, e use atalhos para operar a galeria.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-[1rem] px-4" variant="outline"><AppLink to="/characters/new">Novo personagem</AppLink></Button>
            <Button asChild className="rounded-[1rem] px-4" variant="outline"><AppLink to="/modelos">Ver modelos</AppLink></Button>
            <Button asChild className="rounded-[1rem] px-4" variant="outline"><AppLink to="/">Abrir galeria</AppLink></Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
        <StatusPill label="Criados" value={summary.created} />
        <StatusPill label="Editados" value={summary.updated} />
        <StatusPill label="Excluidos" value={summary.deleted} />
        <StatusPill label="Com 3D" value={summary.withModel} />
      </div>

      <div className="grid gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4 lg:grid-cols-[1fr_auto_auto_auto]">
        <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-card/30 px-4 py-3 text-sm text-muted-foreground">
          <Search className="h-4 w-4 text-cyan-200" />
          <input className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground" onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar personagem" type="search" value={search} />
        </label>
        <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-card/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          Categoria
          <select className="bg-transparent text-foreground outline-none" onChange={(event) => onCategoryChange(event.target.value)} value={category}>
            <option value="all">Todas</option>
            {categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-card/30 px-4 py-3 text-sm text-foreground">
          <input checked={modelsOnly} className="h-4 w-4 accent-cyan-400" onChange={(event) => onModelsOnlyChange(event.target.checked)} type="checkbox" />
          Apenas com 3D
        </label>
        <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-card/30 px-4 py-3 text-sm text-foreground">
          <input checked={failuresOnly} className="h-4 w-4 accent-cyan-400" disabled={!hasFailures} onChange={(event) => onFailuresOnlyChange(event.target.checked)} type="checkbox" />
          Apenas falhas
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
        <div className="flex flex-col gap-1">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80">
            {selectedIds.length} selecionados
          </div>
          {batchProgressLabel ? (
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              {batchProgressLabel}
            </div>
          ) : null}
          {batchResultLabel ? (
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
              {batchResultLabel}
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterButton active={false} label="Selecionar filtrados" onClick={onSelectAllFiltered} />
          <FilterButton active={false} label="Selecionar pagina" onClick={onSelectAllPage} />
          <FilterButton active={false} disabled={selectedIds.length === 0} label="Limpar" onClick={onSelectionClear} />
          <Button
            className="rounded-[1rem] px-4"
            disabled={selectedIds.length === 0}
            onClick={onBulkExport}
            type="button"
            variant="outline"
          >
            Exportar selecionados
          </Button>
          <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-card/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
            Mover para
            <select
              className="bg-transparent text-foreground outline-none"
              onChange={(event) => onTargetCategoryChange(event.target.value)}
              value={targetCategory}
            >
              <option value="all">Escolher</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <Button
            className="rounded-[1rem] px-4"
            disabled={selectedIds.length === 0 || targetCategory === "all" || isBulkUpdating}
            onClick={onBulkMoveCategory}
            type="button"
            variant="outline"
          >
            {isBulkUpdating ? "Movendo..." : "Mover categoria"}
          </Button>
          <Button
            className="rounded-[1rem] px-4"
            disabled={selectedIds.length === 0 || isBulkUpdating}
            onClick={onBulkDelete}
            type="button"
            variant="outline"
          >
            Excluir selecionados
          </Button>
          <Button
            className="rounded-[1rem] px-4"
            disabled={!hasFailures || isBulkUpdating}
            onClick={onRetryFailures}
            type="button"
            variant="outline"
          >
            Repetir falhas
          </Button>
          <Button
            className="rounded-[1rem] px-4"
            disabled={!hasFailures}
            onClick={onCopyFailureIds}
            type="button"
            variant="outline"
          >
            Copiar IDs falhos
          </Button>
          <Button
            className="rounded-[1rem] px-4"
            disabled={!hasFailures}
            onClick={onExportFailures}
            type="button"
            variant="outline"
          >
            Exportar falhas JSON
          </Button>
          <Button
            className="rounded-[1rem] px-4"
            disabled={!hasFailures}
            onClick={onExportFailuresCsv}
            type="button"
            variant="outline"
          >
            Exportar falhas CSV
          </Button>
          <Button
            className="rounded-[1rem] px-4"
            disabled={!hasFailures}
            onClick={onClearFailures}
            type="button"
            variant="outline"
          >
            Limpar falhas
          </Button>
        </div>
      </div>

      {filteredCharacters.length > 0 ? (
        <>
          <div className="grid gap-3 xl:grid-cols-2">
            {paginatedCharacters.map((character) => (
              <CharacterAdminCard
                key={character.id}
                busy={deleteBusyId === character.id}
                character={character}
                onDelete={() => onDeleteCharacter(character)}
                onSelectedChange={(selected) => {
                  onSelectedChange(character.id, selected);
                }}
                selected={selectedIds.includes(character.id)}
              />
            ))}
          </div>
          {filteredCharacters.length > characterPageSize ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80">
                Personagens pagina {characterPage} de {characterTotalPages}
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterButton active={false} disabled={characterPage === 1} label="Primeira" onClick={() => onCharacterPageChange(1)} />
                <FilterButton active={false} disabled={characterPage === 1} label="Anterior" onClick={() => onCharacterPageChange((page) => Math.max(1, page - 1))} />
                <FilterButton active={false} disabled={characterPage === characterTotalPages} label="Proxima" onClick={() => onCharacterPageChange((page) => Math.min(characterTotalPages, page + 1))} />
                <FilterButton active={false} disabled={characterPage === characterTotalPages} label="Ultima" onClick={() => onCharacterPageChange(characterTotalPages)} />
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-black/20 p-8 text-sm text-muted-foreground">
          Nenhum personagem encontrado para esse filtro.
        </div>
      )}

      {recentCharacterLogs.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {recentCharacterLogs.map((log) => <AuditLogCard key={log.id} log={log} />)}
        </div>
      ) : (
        <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-black/20 p-8 text-sm text-muted-foreground">
          Ainda nao existe historico suficiente de personagens para exibir aqui.
        </div>
      )}
    </div>
  );
}
