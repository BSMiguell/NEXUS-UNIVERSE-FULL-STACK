import type { AdminAuditLog } from "@/types/auth";

export function formatAuditAction(action: string) {
  if (action === "permissions.updated") return "Permissoes";
  if (action === "user.updated") return "Conta";
  if (action === "character.created") return "Personagem criado";
  if (action === "character.updated") return "Personagem editado";
  if (action === "character.deleted") return "Personagem excluido";
  return action;
}

export function formatAuditVerb(action: string) {
  if (action === "character.created") return "criou";
  if (action === "character.deleted") return "excluiu";
  return "alterou";
}

export function formatAuditDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAuditDetails(log: AdminAuditLog) {
  if (log.action === "permissions.updated") {
    const permissions = Array.isArray(log.details.permissions) ? log.details.permissions : [];
    if (permissions.length === 0) return "Todos os acessos operacionais foram removidos.";
    return `Permissoes atuais: ${permissions.join(", ")}.`;
  }

  if (log.action === "user.updated") {
    const passwordChanged = Boolean(log.details.passwordChanged);
    const isActive = log.details.isActive === true ? "ativa" : "desativada";
    return `Conta ${isActive}${passwordChanged ? " com senha redefinida" : ""}.`;
  }

  if (log.action === "character.created") {
    const category = typeof log.details.category === "string" ? log.details.category : "sem categoria";
    return `Categoria ${category}${log.details.hasModel3d ? " com modelo 3D vinculado" : " sem modelo 3D"}.`;
  }

  if (log.action === "character.updated") {
    const category = typeof log.details.category === "string" ? log.details.category : "sem categoria";
    const previousName = typeof log.details.previousName === "string" ? log.details.previousName : null;
    const renameText = previousName && previousName !== log.targetUserName ? `Renomeado de ${previousName}. ` : "";
    return `${renameText}Categoria ${category}${log.details.hasModel3d ? " com modelo 3D ativo" : " sem modelo 3D"}.`;
  }

  if (log.action === "character.deleted") {
    const category = typeof log.details.category === "string" ? log.details.category : "sem categoria";
    return `Registro removido da categoria ${category}${log.details.hadModel3d ? " com asset 3D associado" : ""}.`;
  }

  return "Alteracao administrativa registrada.";
}

export function createAuditCsv(logs: AdminAuditLog[]) {
  const rows = logs.map((log) => [
    log.id,
    formatAuditAction(log.action),
    log.action,
    log.actorName,
    log.targetUserName,
    formatAuditDate(log.createdAt),
    formatAuditDetails(log),
    JSON.stringify(log.details),
  ]);

  return [
    ["id", "acao_label", "acao_codigo", "ator", "alvo", "criado_em", "resumo", "details_json"].join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\n");
}

export function triggerTextDownload(filename: string, content: string, type: string) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const blob = new Blob([content], { type });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export function matchesAuditDateRange(
  value: string,
  preset: "all" | "today" | "7d" | "30d" | "custom",
  startDate: string,
  endDate: string,
) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return preset === "all";

  const now = new Date();
  if (preset === "all") return true;
  if (preset === "today") return isSameCalendarDate(date, now);

  if (preset === "7d" || preset === "30d") {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((preset === "7d" ? 7 : 30) - 1));
    return date >= start && date <= now;
  }

  const rangeStart = parseDateInput(startDate, "start");
  const rangeEnd = parseDateInput(endDate, "end");
  if (rangeStart && date < rangeStart) return false;
  if (rangeEnd && date > rangeEnd) return false;
  return true;
}

function escapeCsvValue(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

function parseDateInput(value: string, mode: "start" | "end") {
  if (!value) return null;
  const normalized = new Date(`${value}T00:00:00`);
  if (Number.isNaN(normalized.getTime())) return null;
  if (mode === "end") normalized.setHours(23, 59, 59, 999);
  return normalized;
}

function isSameCalendarDate(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();
}
