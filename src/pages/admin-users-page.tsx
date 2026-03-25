import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, Boxes, MonitorCog, ScrollText, Users } from "lucide-react";
import { type ReactNode } from "react";
import { AdminAuditTab } from "@/components/admin/admin-audit-tab";
import { AdminCharactersTab } from "@/components/admin/admin-characters-tab";
import { FilterButton } from "@/components/admin/admin-page-shared";
import { AppLink } from "@/components/navigation/app-link";
import {
  createAuditCsv,
  formatAuditAction,
  matchesAuditDateRange,
  triggerTextDownload,
} from "@/components/admin/admin-page-utils";
import { AdminUsersTab } from "@/components/admin/admin-users-tab";
import { Button } from "@/components/ui/button";
import {
  useAdminAuditLogsQuery,
  useAdminUsersQuery,
  useUpdateAdminUserMutation,
  useUpdateAdminUserPermissionsMutation,
} from "@/hooks/use-admin-users-query";
import {
  useCharactersQuery,
  useDeleteCharacterMutation,
  useUpdateCharacterMutation,
} from "@/hooks/use-characters-query";
import { useAuthStore } from "@/store/use-auth-store";
import { useUIStore } from "@/store/use-ui-store";
import type { AdminUser, AuthPermission } from "@/types/auth";
import type { Character } from "@/types/character";

const MANAGE_CHARACTERS_PERMISSION: AuthPermission = "canManageCharacters";
const MANAGE_USERS_PERMISSION: AuthPermission = "canManageUsers";

export function AdminUsersPage() {
  const prefersReducedMotion = useReducedMotion();
  const currentUser = useAuthStore((state) => state.user);
  const pushToast = useUIStore((state) => state.pushToast);
  const [activeTab, setActiveTab] = useState<"users" | "audit" | "characters">("users");
  const [search, setSearch] = useState("");
  const [permissionFilter, setPermissionFilter] = useState<"all" | "characters" | "users" | "withoutAccess">("all");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "recent" | "access">("access");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftPassword, setDraftPassword] = useState("");
  const [draftIsActive, setDraftIsActive] = useState(true);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState<"all" | "users" | "characters">("all");
  const [auditDatePreset, setAuditDatePreset] = useState<"all" | "today" | "7d" | "30d" | "custom">("all");
  const [auditStartDate, setAuditStartDate] = useState("");
  const [auditEndDate, setAuditEndDate] = useState("");
  const [auditPage, setAuditPage] = useState(1);
  const [characterSearch, setCharacterSearch] = useState("");
  const [characterCategory, setCharacterCategory] = useState("all");
  const [characterModelsOnly, setCharacterModelsOnly] = useState(false);
  const [characterFailuresOnly, setCharacterFailuresOnly] = useState(false);
  const [characterPage, setCharacterPage] = useState(1);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<number[]>([]);
  const [bulkTargetCategory, setBulkTargetCategory] = useState("all");
  const [batchProgress, setBatchProgress] = useState<{
    mode: "delete" | "move" | null;
    current: number;
    total: number;
  }>({
    mode: null,
    current: 0,
    total: 0,
  });
  const [batchResult, setBatchResult] = useState<{
    mode: "delete" | "move" | null;
    success: number;
    failed: number;
    failedIds: number[];
  }>({
    mode: null,
    success: 0,
    failed: 0,
    failedIds: [],
  });

  const { data = [], error, isLoading, isFetching, refetch } = useAdminUsersQuery();
  const { data: auditLogs = [] } = useAdminAuditLogsQuery();
  const { data: characters = [] } = useCharactersQuery();
  const updatePermissionsMutation = useUpdateAdminUserPermissionsMutation();
  const updateUserMutation = useUpdateAdminUserMutation();
  const deleteCharacterMutation = useDeleteCharacterMutation();
  const updateCharacterMutation = useUpdateCharacterMutation();

  const pageSize = 6;
  const auditPageSize = 8;
  const characterPageSize = 8;

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const nextUsers = data.filter((user) => {
      const matchesSearch =
        normalizedSearch.length === 0
        || user.name.toLowerCase().includes(normalizedSearch)
        || user.email.toLowerCase().includes(normalizedSearch);

      if (!matchesSearch) return false;
      if (permissionFilter === "characters") return user.permissions.canManageCharacters;
      if (permissionFilter === "users") return user.permissions.canManageUsers;
      if (permissionFilter === "withoutAccess") {
        return !user.permissions.canManageCharacters && !user.permissions.canManageUsers;
      }
      return true;
    });

    nextUsers.sort((left, right) => {
      if (sortBy === "name-asc") return left.name.localeCompare(right.name, "pt-BR");
      if (sortBy === "name-desc") return right.name.localeCompare(left.name, "pt-BR");
      if (sortBy === "recent") return right.id - left.id;

      const leftScore = Number(left.permissions.canManageUsers) * 2 + Number(left.permissions.canManageCharacters);
      const rightScore = Number(right.permissions.canManageUsers) * 2 + Number(right.permissions.canManageCharacters);
      if (leftScore !== rightScore) return rightScore - leftScore;
      return left.name.localeCompare(right.name, "pt-BR");
    });

    return nextUsers;
  }, [data, permissionFilter, search, sortBy]);

  const filteredAuditLogs = useMemo(() => {
    const normalizedAuditSearch = auditSearch.trim().toLowerCase();

    return auditLogs.filter((log) => {
      if (auditFilter === "users" && log.action.startsWith("character.")) return false;
      if (auditFilter === "characters" && !log.action.startsWith("character.")) return false;

      const detailsText = JSON.stringify(log.details).toLowerCase();
      const matchesSearch =
        normalizedAuditSearch.length === 0
        || log.actorName.toLowerCase().includes(normalizedAuditSearch)
        || log.targetUserName.toLowerCase().includes(normalizedAuditSearch)
        || formatAuditAction(log.action).toLowerCase().includes(normalizedAuditSearch)
        || detailsText.includes(normalizedAuditSearch);

      return matchesSearch && matchesAuditDateRange(
        log.createdAt,
        auditDatePreset,
        auditStartDate,
        auditEndDate,
      );
    });
  }, [auditDatePreset, auditEndDate, auditFilter, auditLogs, auditSearch, auditStartDate]);

  const filteredCharacters = useMemo(() => {
    const normalizedSearch = characterSearch.trim().toLowerCase();

    return characters
      .filter((character) => {
        const matchesSearch =
          normalizedSearch.length === 0
          || character.name.toLowerCase().includes(normalizedSearch)
          || character.description.toLowerCase().includes(normalizedSearch);

        if (!matchesSearch) return false;
        if (characterCategory !== "all" && character.category !== characterCategory) return false;
        if (characterModelsOnly && !character.model3d) return false;
        if (characterFailuresOnly && !batchResult.failedIds.includes(character.id)) return false;
        return true;
      })
      .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
  }, [batchResult.failedIds, characterCategory, characterFailuresOnly, characterModelsOnly, characterSearch, characters]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const auditTotalPages = Math.max(1, Math.ceil(filteredAuditLogs.length / auditPageSize));
  const characterTotalPages = Math.max(1, Math.ceil(filteredCharacters.length / characterPageSize));

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredUsers]);

  const paginatedAuditLogs = useMemo(() => {
    const startIndex = (auditPage - 1) * auditPageSize;
    return filteredAuditLogs.slice(startIndex, startIndex + auditPageSize);
  }, [auditPage, filteredAuditLogs]);

  const paginatedCharacters = useMemo(() => {
    const startIndex = (characterPage - 1) * characterPageSize;
    return filteredCharacters.slice(startIndex, startIndex + characterPageSize);
  }, [characterPage, filteredCharacters]);

  const accessSummary = useMemo(() => ({
    characters: data.filter((user) => user.permissions.canManageCharacters).length,
    users: data.filter((user) => user.permissions.canManageUsers).length,
    withoutAccess: data.filter((user) => !user.permissions.canManageCharacters && !user.permissions.canManageUsers).length,
  }), [data]);

  const auditSummary = useMemo(() => ({
    today: filteredAuditLogs.filter((log) => matchesAuditDateRange(log.createdAt, "today", "", "")).length,
    characterChanges: filteredAuditLogs.filter((log) => log.action.startsWith("character.")).length,
    accessChanges: filteredAuditLogs.filter((log) => log.action === "permissions.updated").length,
    deactivations: filteredAuditLogs.filter((log) => log.action === "user.updated" && log.details.isActive === false).length,
  }), [filteredAuditLogs]);

  const characterAuditLogs = useMemo(
    () => auditLogs.filter((log) => log.action.startsWith("character.")),
    [auditLogs],
  );

  const characterCategories = useMemo(
    () => Array.from(new Set(characters.map((character) => character.category))).sort((left, right) => left.localeCompare(right, "pt-BR")),
    [characters],
  );

  const characterSummary = useMemo(() => ({
    created: characterAuditLogs.filter((log) => log.action === "character.created").length,
    updated: characterAuditLogs.filter((log) => log.action === "character.updated").length,
    deleted: characterAuditLogs.filter((log) => log.action === "character.deleted").length,
    withModel: characterAuditLogs.filter((log) => log.details.hasModel3d === true || log.details.hadModel3d === true).length,
  }), [characterAuditLogs]);

  const recentCharacterLogs = useMemo(() => characterAuditLogs.slice(0, 6), [characterAuditLogs]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (auditPage > auditTotalPages) setAuditPage(auditTotalPages);
  }, [auditPage, auditTotalPages]);

  useEffect(() => {
    if (characterPage > characterTotalPages) setCharacterPage(characterTotalPages);
  }, [characterPage, characterTotalPages]);

  useEffect(() => {
    setSelectedCharacterIds((current) =>
      current.filter((id) => filteredCharacters.some((character) => character.id === id)),
    );
  }, [filteredCharacters]);

  const handleTogglePermission = async (user: AdminUser, permission: AuthPermission) => {
    const currentPermissions = new Set<AuthPermission>();
    if (user.permissions.canManageCharacters) currentPermissions.add(MANAGE_CHARACTERS_PERMISSION);
    if (user.permissions.canManageUsers) currentPermissions.add(MANAGE_USERS_PERMISSION);

    const hasPermission = currentPermissions.has(permission);
    if (hasPermission) currentPermissions.delete(permission);
    else currentPermissions.add(permission);

    try {
      await updatePermissionsMutation.mutateAsync({
        id: user.id,
        permissions: Array.from(currentPermissions),
      });

      pushToast({
        title: "Permissoes atualizadas",
        description: `${user.name} agora esta com acesso ${hasPermission ? "revogado" : "liberado"} para ${permission === MANAGE_CHARACTERS_PERMISSION ? "gerenciar personagens" : "gerenciar usuarios"}.`,
        tone: "success",
      });
    } catch (mutationError) {
      pushToast({
        title: "Falha ao atualizar permissoes",
        description: mutationError instanceof Error ? mutationError.message : "Nao foi possivel salvar essa alteracao agora.",
        tone: "error",
      });
    }
  };

  const startEditing = (user: AdminUser) => {
    setEditingUserId(user.id);
    setDraftName(user.name);
    setDraftPassword("");
    setDraftIsActive(user.isActive);
  };

  const handleSaveUser = async (userId: number) => {
    try {
      await updateUserMutation.mutateAsync({
        id: userId,
        name: draftName.trim(),
        password: draftPassword.trim() || undefined,
        isActive: draftIsActive,
      });

      pushToast({
        title: "Usuario atualizado",
        description: "Os dados da conta foram atualizados com sucesso.",
        tone: "success",
      });
      setEditingUserId(null);
      setDraftPassword("");
      setDraftIsActive(true);
    } catch (mutationError) {
      pushToast({
        title: "Falha ao atualizar usuario",
        description: mutationError instanceof Error ? mutationError.message : "Nao foi possivel salvar os dados dessa conta agora.",
        tone: "error",
      });
    }
  };

  const handleExportAudit = (format: "json" | "csv") => {
    if (filteredAuditLogs.length === 0) {
      pushToast({
        title: "Nada para exportar",
        description: "A auditoria filtrada esta vazia no momento.",
        tone: "error",
      });
      return;
    }

    const exportedAt = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `admin-audit-${auditFilter}-${exportedAt}.${format}`;
    const content = format === "json"
      ? JSON.stringify(filteredAuditLogs, null, 2)
      : createAuditCsv(filteredAuditLogs);
    const type = format === "json" ? "application/json;charset=utf-8" : "text/csv;charset=utf-8";

    triggerTextDownload(filename, content, type);
    pushToast({
      title: `Auditoria exportada em ${format.toUpperCase()}`,
      description: `${filteredAuditLogs.length} eventos foram preparados para download.`,
      tone: "success",
    });
  };

  const handleDeleteCharacter = async (character: Character) => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(`Excluir ${character.name}? Essa acao nao pode ser desfeita.`);
      if (!confirmed) return;
    }

    try {
      await deleteCharacterMutation.mutateAsync(character.id);
      setSelectedCharacterIds((current) => current.filter((id) => id !== character.id));
      pushToast({
        title: "Personagem excluido",
        description: `${character.name} foi removido do catalogo.`,
        tone: "success",
      });
    } catch (mutationError) {
      pushToast({
        title: "Falha ao excluir personagem",
        description: mutationError instanceof Error ? mutationError.message : "Nao foi possivel concluir essa exclusao agora.",
        tone: "error",
      });
    }
  };

  const handleBulkDeleteCharacters = async () => {
    const selectedCharacters = filteredCharacters.filter((character) =>
      selectedCharacterIds.includes(character.id),
    );

    if (selectedCharacters.length === 0) {
      pushToast({
        title: "Nenhum personagem selecionado",
        description: "Selecione pelo menos um registro para executar essa acao.",
        tone: "error",
      });
      return;
    }

    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        `Excluir ${selectedCharacters.length} personagens selecionados? Essa acao nao pode ser desfeita.`,
      );
      if (!confirmed) {
        return;
      }
    }

    try {
      setBatchResult({
        mode: null,
        success: 0,
        failed: 0,
        failedIds: [],
      });
      setBatchProgress({
        mode: "delete",
        current: 0,
        total: selectedCharacters.length,
      });

      const failedIds: number[] = [];
      let successCount = 0;

      for (const [index, character] of selectedCharacters.entries()) {
        try {
          await deleteCharacterMutation.mutateAsync(character.id);
          successCount += 1;
        } catch {
          failedIds.push(character.id);
        }

        setBatchProgress({
          mode: "delete",
          current: index + 1,
          total: selectedCharacters.length,
        });
      }

      setSelectedCharacterIds([]);

      setBatchResult({
        mode: "delete",
        success: successCount,
        failed: failedIds.length,
        failedIds,
      });

      if (failedIds.length > 0) {
        pushToast({
          title: "Exclusao em lote com falhas",
          description: `${successCount} concluidos e ${failedIds.length} falharam.`,
          tone: "error",
        });
      } else {
        pushToast({
          title: "Exclusao em lote concluida",
          description: `${successCount} personagens foram removidos do catalogo.`,
          tone: "success",
        });
      }
    } catch (mutationError) {
      pushToast({
        title: "Falha na exclusao em lote",
        description: mutationError instanceof Error ? mutationError.message : "Nao foi possivel concluir todas as exclusoes agora.",
        tone: "error",
      });
    } finally {
      setBatchProgress({
        mode: null,
        current: 0,
        total: 0,
      });
    }
  };

  const handleBulkExportCharacters = () => {
    const selectedCharacters = filteredCharacters.filter((character) =>
      selectedCharacterIds.includes(character.id),
    );

    if (selectedCharacters.length === 0) {
      pushToast({
        title: "Nenhum personagem selecionado",
        description: "Selecione ao menos um registro para exportar.",
        tone: "error",
      });
      return;
    }

    const exportedAt = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `characters-selected-${exportedAt}.json`;
    triggerTextDownload(filename, JSON.stringify(selectedCharacters, null, 2), "application/json;charset=utf-8");

    pushToast({
      title: "Exportacao concluida",
      description: `${selectedCharacters.length} personagens foram exportados em JSON.`,
      tone: "success",
    });
  };

  const handleBulkMoveCategory = async () => {
    if (bulkTargetCategory === "all") {
      pushToast({
        title: "Categoria invalida",
        description: "Escolha uma categoria de destino para concluir o lote.",
        tone: "error",
      });
      return;
    }

    const selectedCharacters = filteredCharacters.filter((character) =>
      selectedCharacterIds.includes(character.id),
    );

    if (selectedCharacters.length === 0) {
      pushToast({
        title: "Nenhum personagem selecionado",
        description: "Selecione ao menos um registro para mover de categoria.",
        tone: "error",
      });
      return;
    }

    try {
      setBatchResult({
        mode: null,
        success: 0,
        failed: 0,
        failedIds: [],
      });
      setBatchProgress({
        mode: "move",
        current: 0,
        total: selectedCharacters.length,
      });

      const failedIds: number[] = [];
      let successCount = 0;

      for (const [index, character] of selectedCharacters.entries()) {
        try {
          if (character.category !== bulkTargetCategory) {
            await updateCharacterMutation.mutateAsync({
              id: character.id,
              payload: {
                name: character.name,
                category: bulkTargetCategory,
                image: character.image,
                description: character.description,
                model3d: character.model3d,
                details: character.details,
                stats: character.stats,
              },
            });
          }

          successCount += 1;
        } catch {
          failedIds.push(character.id);
        }

        setBatchProgress({
          mode: "move",
          current: index + 1,
          total: selectedCharacters.length,
        });
      }

      setSelectedCharacterIds([]);
      setBulkTargetCategory("all");
      setBatchResult({
        mode: "move",
        success: successCount,
        failed: failedIds.length,
        failedIds,
      });

      if (failedIds.length > 0) {
        pushToast({
          title: "Lote de categoria com falhas",
          description: `${successCount} concluidos e ${failedIds.length} falharam.`,
          tone: "error",
        });
      } else {
        pushToast({
          title: "Categoria atualizada",
          description: `${successCount} personagens foram processados no lote.`,
          tone: "success",
        });
      }
    } catch (mutationError) {
      pushToast({
        title: "Falha ao mover categoria",
        description: mutationError instanceof Error ? mutationError.message : "Nao foi possivel concluir o lote agora.",
        tone: "error",
      });
    } finally {
      setBatchProgress({
        mode: null,
        current: 0,
        total: 0,
      });
    }
  };

  const handleExportFailures = () => {
    if (batchResult.failedIds.length === 0) {
      pushToast({
        title: "Sem falhas para exportar",
        description: "Nenhum item falhou no ultimo lote.",
        tone: "error",
      });
      return;
    }

    const exportedAt = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `batch-failures-${exportedAt}.json`;
    const payload = {
      mode: batchResult.mode,
      failed: batchResult.failed,
      failedIds: batchResult.failedIds,
    };

    triggerTextDownload(filename, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
    pushToast({
      title: "Falhas exportadas",
      description: `${batchResult.failedIds.length} IDs foram exportados.`,
      tone: "success",
    });
  };

  const handleExportFailuresCsv = () => {
    if (batchResult.failedIds.length === 0) {
      pushToast({
        title: "Sem falhas para exportar",
        description: "Nenhum item falhou no ultimo lote.",
        tone: "error",
      });
      return;
    }

    const exportedAt = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `batch-failures-${exportedAt}.csv`;
    const rows = [
      "mode,failed_count,failed_id",
      ...batchResult.failedIds.map((id) => `${batchResult.mode ?? "unknown"},${batchResult.failed},${id}`),
    ];

    triggerTextDownload(filename, rows.join("\n"), "text/csv;charset=utf-8");
    pushToast({
      title: "Falhas exportadas em CSV",
      description: `${batchResult.failedIds.length} IDs foram exportados.`,
      tone: "success",
    });
  };

  const handleClearFailures = () => {
    setBatchResult({
      mode: null,
      success: 0,
      failed: 0,
      failedIds: [],
    });
    setCharacterFailuresOnly(false);
    pushToast({
      title: "Historico de falhas limpo",
      description: "O resumo de falhas do ultimo lote foi removido.",
      tone: "success",
    });
  };

  const handleRetryFailures = () => {
    if (batchResult.failedIds.length === 0) {
      pushToast({
        title: "Sem falhas para repetir",
        description: "Nenhum item falhou no ultimo lote.",
        tone: "error",
      });
      return;
    }

    setSelectedCharacterIds(batchResult.failedIds);
    pushToast({
      title: "Falhas selecionadas",
      description: `${batchResult.failedIds.length} itens foram selecionados para nova tentativa.`,
      tone: "success",
    });
  };

  const handleCopyFailureIds = async () => {
    if (batchResult.failedIds.length === 0) {
      pushToast({
        title: "Sem falhas para copiar",
        description: "Nenhum item falhou no ultimo lote.",
        tone: "error",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(batchResult.failedIds.join(", "));
      pushToast({
        title: "IDs copiados",
        description: `${batchResult.failedIds.length} IDs com falha foram copiados.`,
        tone: "success",
      });
    } catch {
      pushToast({
        title: "Falha ao copiar IDs",
        description: "Seu navegador bloqueou a copia automatica agora.",
        tone: "error",
      });
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className="space-y-6"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 24, filter: "blur(8px)" }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <Button asChild className="rounded-[1.1rem] px-5" variant="outline">
        <AppLink to="/">
          <ChevronLeft className="h-4 w-4" />
          Voltar para galeria
        </AppLink>
      </Button>

      <section className="cosmos-model-hero quantum-panel relative overflow-hidden rounded-[2rem] p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(56,189,248,0.2),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(251,191,36,0.12),transparent_18%),radial-gradient(circle_at_70%_86%,rgba(45,212,191,0.14),transparent_20%)]" />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-cyan-100/80 backdrop-blur-xl">
              <MonitorCog className="h-4 w-4" />
              Comando administrativo
            </div>
            <div className="mt-3 text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">Controle de acessos</div>
            <h1 className="mt-2 font-display text-3xl uppercase tracking-[0.12em] text-foreground">Permissoes operacionais</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Gerencie quais contas podem criar, editar e excluir personagens direto pelo painel.
            </p>
          </div>
          <div className="relative z-10 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {isFetching
              ? "Sincronizando..."
              : activeTab === "audit"
                ? `${filteredAuditLogs.length} eventos`
                : activeTab === "characters"
                  ? `${characterAuditLogs.length} acoes de personagem`
                  : `${filteredUsers.length} usuarios`}
          </div>
        </div>
        <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-3">
          <AdminSignalCard icon={<Users className="h-4 w-4" />} label="Usuarios" value={String(data.length)} />
          <AdminSignalCard icon={<ScrollText className="h-4 w-4" />} label="Auditoria" value={String(filteredAuditLogs.length)} />
          <AdminSignalCard icon={<Boxes className="h-4 w-4" />} label="Personagens" value={String(characters.length)} />
        </div>
      </section>

      <section className="quantum-panel rounded-[2rem] p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          <FilterButton active={activeTab === "users"} label="Usuarios" onClick={() => setActiveTab("users")} />
          <FilterButton active={activeTab === "audit"} label="Auditoria" onClick={() => setActiveTab("audit")} />
          <FilterButton active={activeTab === "characters"} label="Personagens" onClick={() => setActiveTab("characters")} />
        </div>
      </section>

      <section className="quantum-panel rounded-[2rem] p-4 sm:p-5">
        {activeTab === "users" ? (
          <AdminUsersTab
            accessSummary={accessSummary}
            currentPage={currentPage}
            currentUserId={currentUser?.id}
            dataLength={data.length}
            draftIsActive={draftIsActive}
            draftName={draftName}
            draftPassword={draftPassword}
            editingUserId={editingUserId}
            errorMessage={error?.message}
            filteredUsers={filteredUsers}
            isLoading={isLoading}
            onDraftIsActiveChange={setDraftIsActive}
            onDraftNameChange={setDraftName}
            onDraftPasswordChange={setDraftPassword}
            onEditCancel={() => {
              setEditingUserId(null);
              setDraftPassword("");
              setDraftIsActive(true);
            }}
            onEditStart={startEditing}
            onPageChange={setCurrentPage}
            onPermissionFilterChange={(value) => {
              setPermissionFilter(value);
              setCurrentPage(1);
            }}
            onRefetch={() => {
              void refetch();
            }}
            onSaveUser={(userId) => {
              void handleSaveUser(userId);
            }}
            onSearchChange={(value) => {
              setSearch(value);
              setCurrentPage(1);
            }}
            onSortByChange={(value) => {
              setSortBy(value);
              setCurrentPage(1);
            }}
            onTogglePermission={(user, permission) => {
              void handleTogglePermission(user, permission);
            }}
            pageSize={pageSize}
            paginatedUsers={paginatedUsers}
            permissionFilter={permissionFilter}
            saveBusyUserId={updateUserMutation.isPending ? updateUserMutation.variables?.id : undefined}
            search={search}
            sortBy={sortBy}
            toggleBusyUserId={updatePermissionsMutation.isPending ? updatePermissionsMutation.variables?.id : undefined}
            totalPages={totalPages}
          />
        ) : null}

        {activeTab === "audit" ? (
          <AdminAuditTab
            auditDatePreset={auditDatePreset}
            auditEndDate={auditEndDate}
            auditFilter={auditFilter}
            auditPage={auditPage}
            auditPageSize={auditPageSize}
            auditSearch={auditSearch}
            auditStartDate={auditStartDate}
            auditSummary={auditSummary}
            auditTotalPages={auditTotalPages}
            filteredAuditLogs={filteredAuditLogs}
            onAuditDatePresetChange={(value) => {
              setAuditDatePreset(value);
              setAuditPage(1);
            }}
            onAuditEndDateChange={(value) => {
              setAuditEndDate(value);
              setAuditPage(1);
            }}
            onAuditFilterChange={(value) => {
              setAuditFilter(value);
              setAuditPage(1);
            }}
            onAuditPageChange={setAuditPage}
            onAuditSearchChange={(value) => {
              setAuditSearch(value);
              setAuditPage(1);
            }}
            onAuditStartDateChange={(value) => {
              setAuditStartDate(value);
              setAuditPage(1);
            }}
            onExport={handleExportAudit}
            paginatedAuditLogs={paginatedAuditLogs}
          />
        ) : null}

        {activeTab === "characters" ? (
          <AdminCharactersTab
            categories={characterCategories}
            category={characterCategory}
            characterPage={characterPage}
            characterPageSize={characterPageSize}
            characterTotalPages={characterTotalPages}
            deleteBusyId={deleteCharacterMutation.isPending ? deleteCharacterMutation.variables : undefined}
            filteredCharacters={filteredCharacters}
            isBulkUpdating={updateCharacterMutation.isPending}
            modelsOnly={characterModelsOnly}
            onBulkDelete={() => {
              void handleBulkDeleteCharacters();
            }}
            onBulkExport={handleBulkExportCharacters}
            onBulkMoveCategory={() => {
              void handleBulkMoveCategory();
            }}
            onCategoryChange={(value) => {
              setCharacterCategory(value);
              setCharacterPage(1);
            }}
            onCharacterPageChange={setCharacterPage}
            onDeleteCharacter={(character) => {
              void handleDeleteCharacter(character);
            }}
            onClearFailures={handleClearFailures}
            onCopyFailureIds={() => {
              void handleCopyFailureIds();
            }}
            onExportFailures={handleExportFailures}
            onExportFailuresCsv={handleExportFailuresCsv}
            onFailuresOnlyChange={(value) => {
              setCharacterFailuresOnly(value);
              setCharacterPage(1);
            }}
            onModelsOnlyChange={(value) => {
              setCharacterModelsOnly(value);
              setCharacterPage(1);
            }}
            onRetryFailures={handleRetryFailures}
            onSelectAllFiltered={() => {
              setSelectedCharacterIds(Array.from(new Set(filteredCharacters.map((character) => character.id))));
            }}
            onSelectAllPage={() => {
              setSelectedCharacterIds((current) => Array.from(new Set([...current, ...paginatedCharacters.map((character) => character.id)])));
            }}
            onSelectedChange={(characterId, selected) => {
              setSelectedCharacterIds((current) => {
                if (selected) {
                  return Array.from(new Set([...current, characterId]));
                }

                return current.filter((id) => id !== characterId);
              });
            }}
            onSelectionClear={() => {
              setSelectedCharacterIds([]);
            }}
            onSearchChange={(value) => {
              setCharacterSearch(value);
              setCharacterPage(1);
            }}
            paginatedCharacters={paginatedCharacters}
            recentCharacterLogs={recentCharacterLogs}
            search={characterSearch}
            selectedIds={selectedCharacterIds}
            failuresOnly={characterFailuresOnly}
            summary={characterSummary}
            targetCategory={bulkTargetCategory}
            onTargetCategoryChange={setBulkTargetCategory}
            batchProgressLabel={
              batchProgress.mode && batchProgress.total > 0
                ? `${batchProgress.mode === "delete" ? "Excluindo" : "Movendo"} ${batchProgress.current}/${batchProgress.total}`
                : undefined
            }
            batchResultLabel={
              batchResult.mode
                ? `${batchResult.mode === "delete" ? "Exclusao" : "Categoria"}: ${batchResult.success} ok, ${batchResult.failed} falhas${batchResult.failed > 0 ? ` (IDs: ${batchResult.failedIds.join(", ")})` : ""}`
                : undefined
            }
            hasFailures={batchResult.failedIds.length > 0}
          />
        ) : null}
      </section>
    </motion.div>
  );
}

function AdminSignalCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="cosmos-signal-card">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
        {icon}
      </div>
      <div className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">{label}</div>
      <div className="mt-1 text-sm font-semibold uppercase tracking-[0.08em] text-white">{value}</div>
    </div>
  );
}
