import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuditLogCard, FilterButton, StatusPill } from "@/components/admin/admin-page-shared";
import type { AdminAuditLog } from "@/types/auth";

type AuditDatePreset = "all" | "today" | "7d" | "30d" | "custom";
type AuditFilter = "all" | "users" | "characters";

export function AdminAuditTab({
  auditDatePreset,
  auditEndDate,
  auditFilter,
  auditPage,
  auditPageSize,
  auditSearch,
  auditStartDate,
  auditSummary,
  auditTotalPages,
  filteredAuditLogs,
  onAuditDatePresetChange,
  onAuditEndDateChange,
  onAuditFilterChange,
  onAuditPageChange,
  onAuditSearchChange,
  onAuditStartDateChange,
  onExport,
  paginatedAuditLogs,
}: {
  auditDatePreset: AuditDatePreset;
  auditEndDate: string;
  auditFilter: AuditFilter;
  auditPage: number;
  auditPageSize: number;
  auditSearch: string;
  auditStartDate: string;
  auditSummary: { today: number; characterChanges: number; accessChanges: number; deactivations: number };
  auditTotalPages: number;
  filteredAuditLogs: AdminAuditLog[];
  onAuditDatePresetChange: (value: AuditDatePreset) => void;
  onAuditEndDateChange: (value: string) => void;
  onAuditFilterChange: (value: AuditFilter) => void;
  onAuditPageChange: (value: number | ((current: number) => number)) => void;
  onAuditSearchChange: (value: string) => void;
  onAuditStartDateChange: (value: string) => void;
  onExport: (format: "json" | "csv") => void;
  paginatedAuditLogs: AdminAuditLog[];
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200/75">Auditoria</div>
          <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.08em] text-white">Ultimas alteracoes</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-card/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
          {filteredAuditLogs.length} eventos
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <label className="flex min-w-[18rem] items-center gap-3 rounded-[1rem] border border-white/10 bg-card/30 px-4 py-3 text-sm text-muted-foreground">
          <Search className="h-4 w-4 text-cyan-200" />
          <input
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            onChange={(event) => onAuditSearchChange(event.target.value)}
            placeholder="Buscar por ator, alvo ou acao"
            type="search"
            value={auditSearch}
          />
        </label>
        <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-card/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          Periodo
          <select className="bg-transparent text-foreground outline-none" onChange={(event) => onAuditDatePresetChange(event.target.value as AuditDatePreset)} value={auditDatePreset}>
            <option value="all">Tudo</option>
            <option value="today">Hoje</option>
            <option value="7d">Ultimos 7 dias</option>
            <option value="30d">Ultimos 30 dias</option>
            <option value="custom">Intervalo</option>
          </select>
        </label>
        {auditDatePreset === "custom" ? (
          <>
            <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-card/30 px-4 py-3 text-sm text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">De</span>
              <input className="bg-transparent text-foreground outline-none" onChange={(event) => onAuditStartDateChange(event.target.value)} type="date" value={auditStartDate} />
            </label>
            <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-card/30 px-4 py-3 text-sm text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">Ate</span>
              <input className="bg-transparent text-foreground outline-none" onChange={(event) => onAuditEndDateChange(event.target.value)} type="date" value={auditEndDate} />
            </label>
          </>
        ) : null}
        <Button className="rounded-[1rem] px-4" onClick={() => onExport("json")} type="button" variant="outline">
          <Download className="h-4 w-4" />
          Exportar JSON
        </Button>
        <Button className="rounded-[1rem] px-4" onClick={() => onExport("csv")} type="button" variant="outline">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
        <FilterButton active={auditFilter === "all"} label="Tudo" onClick={() => onAuditFilterChange("all")} />
        <FilterButton active={auditFilter === "users"} label="Usuarios" onClick={() => onAuditFilterChange("users")} />
        <FilterButton active={auditFilter === "characters"} label="Personagens" onClick={() => onAuditFilterChange("characters")} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <StatusPill label="Acoes hoje" value={auditSummary.today} />
        <StatusPill label="Mudancas de personagem" value={auditSummary.characterChanges} />
        <StatusPill label="Mudancas de acesso" value={auditSummary.accessChanges} />
        <StatusPill label="Contas desativadas" value={auditSummary.deactivations} />
      </div>

      {filteredAuditLogs.length > 0 ? (
        <>
          <div className="grid gap-3 lg:grid-cols-2">
            {paginatedAuditLogs.map((log) => (
              <AuditLogCard key={log.id} log={log} />
            ))}
          </div>
          {filteredAuditLogs.length > auditPageSize ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80">
                Auditoria pagina {auditPage} de {auditTotalPages}
              </div>
              <div className="flex flex-wrap gap-2">
                <FilterButton active={false} disabled={auditPage === 1} label="Primeira" onClick={() => onAuditPageChange(1)} />
                <FilterButton active={false} disabled={auditPage === 1} label="Anterior" onClick={() => onAuditPageChange((page) => Math.max(1, page - 1))} />
                <FilterButton active={false} disabled={auditPage === auditTotalPages} label="Proxima" onClick={() => onAuditPageChange((page) => Math.min(auditTotalPages, page + 1))} />
                <FilterButton active={false} disabled={auditPage === auditTotalPages} label="Ultima" onClick={() => onAuditPageChange(auditTotalPages)} />
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-[1.1rem] border border-dashed border-white/10 bg-card/20 p-4 text-sm text-muted-foreground">
          Nenhuma alteracao encontrada para esse filtro.
        </div>
      )}
    </div>
  );
}
