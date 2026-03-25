import { type ButtonHTMLAttributes } from "react";
import { ShieldCheck, Trash2 } from "lucide-react";
import { AppLink } from "@/components/navigation/app-link";
import { Button } from "@/components/ui/button";
import {
  formatAuditAction,
  formatAuditDate,
  formatAuditDetails,
  formatAuditVerb,
} from "@/components/admin/admin-page-utils";
import type { AdminAuditLog } from "@/types/auth";
import type { Character } from "@/types/character";

export function StatusPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-full border border-cyan-200/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
      {label}: <span className="text-white">{value}</span>
    </div>
  );
}

export function FilterButton({
  active,
  label,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active: boolean;
  label: string;
}) {
  return (
    <button
      className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${
        active
          ? "border-cyan-200/35 bg-cyan-300/15 text-cyan-100 shadow-[0_0_0_1px_rgba(56,189,248,0.2)_inset]"
          : "border-white/10 bg-white/5 text-cyan-100/80 hover:border-cyan-200/25 hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-45`}
      type="button"
      {...props}
    >
      {label}
    </button>
  );
}

export function PermissionToggle({
  checked,
  label,
  description,
  disabled,
  onChange,
  statusLabel,
}: {
  checked: boolean;
  label: string;
  description: string;
  disabled?: boolean;
  onChange: () => void;
  statusLabel?: string;
}) {
  return (
    <button
      className={`group flex w-full items-start gap-3 rounded-[1.1rem] border px-4 py-4 text-left transition ${
        checked
          ? "border-primary/35 bg-primary/10"
          : "border-white/10 bg-card/20 hover:border-white/20"
      } disabled:cursor-not-allowed disabled:opacity-60`}
      disabled={disabled}
      onClick={onChange}
      type="button"
    >
      <div
        className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border ${
          checked ? "border-primary bg-primary/20 text-primary" : "border-white/15 text-transparent"
        }`}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
      </div>
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.24em] text-white">{label}</span>
          {statusLabel ? (
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-100/75">
              {statusLabel}
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

export function AuditLogCard({ log }: { log: AdminAuditLog }) {
  return (
    <article className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
          {formatAuditAction(log.action)}
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {formatAuditDate(log.createdAt)}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground">
        <span className="font-semibold text-white">{log.actorName}</span> {formatAuditVerb(log.action)}{" "}
        <span className="font-semibold text-white">{log.targetUserName}</span>.
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{formatAuditDetails(log)}</p>
    </article>
  );
}

export function CharacterAdminCard({
  busy,
  character,
  selected,
  onDelete,
  onSelectedChange,
}: {
  busy: boolean;
  character: Character;
  selected: boolean;
  onDelete: () => void;
  onSelectedChange: (selected: boolean) => void;
}) {
  return (
    <article className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <label className="mb-3 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">
            <input
              checked={selected}
              className="h-4 w-4 accent-cyan-400"
              onChange={(event) => {
                onSelectedChange(event.target.checked);
              }}
              type="checkbox"
            />
            Selecionado
          </label>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
            {character.category}
          </div>
          <h3 className="mt-3 font-display text-2xl uppercase tracking-[0.08em] text-white">
            {character.name}
          </h3>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
          {character.model3d ? "3D ativo" : "sem 3D"}
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {character.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild className="rounded-[1rem] px-4" variant="outline">
          <AppLink to={`/characters/${character.id}/edit`}>Editar</AppLink>
        </Button>
        <Button asChild className="rounded-[1rem] px-4" variant="outline">
          <AppLink to={`/personagem/${character.id}`}>Perfil</AppLink>
        </Button>
        {character.model3d ? (
          <Button asChild className="rounded-[1rem] px-4" variant="outline">
            <AppLink to={`/model/${character.id}`}>Modelo 3D</AppLink>
          </Button>
        ) : null}
        <Button className="rounded-[1rem] px-4" disabled={busy} onClick={onDelete} type="button" variant="outline">
          <Trash2 className="h-4 w-4" />
          {busy ? "Excluindo..." : "Excluir"}
        </Button>
      </div>
    </article>
  );
}
