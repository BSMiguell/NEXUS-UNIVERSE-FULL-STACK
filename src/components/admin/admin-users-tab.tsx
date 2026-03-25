import { Pencil, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterButton, PermissionToggle, StatusPill } from "@/components/admin/admin-page-shared";
import type { AuthPermission, AdminUser } from "@/types/auth";

type PermissionFilter = "all" | "characters" | "users" | "withoutAccess";
type SortBy = "name-asc" | "name-desc" | "recent" | "access";

export function AdminUsersTab({
  accessSummary,
  currentPage,
  currentUserId,
  dataLength,
  draftIsActive,
  draftName,
  draftPassword,
  editingUserId,
  errorMessage,
  filteredUsers,
  isLoading,
  onDraftIsActiveChange,
  onDraftNameChange,
  onDraftPasswordChange,
  onEditCancel,
  onEditStart,
  onPageChange,
  onPermissionFilterChange,
  onRefetch,
  onSaveUser,
  onSearchChange,
  onSortByChange,
  onTogglePermission,
  pageSize,
  paginatedUsers,
  permissionFilter,
  saveBusyUserId,
  search,
  sortBy,
  toggleBusyUserId,
  totalPages,
}: {
  accessSummary: { characters: number; users: number; withoutAccess: number };
  currentPage: number;
  currentUserId?: number;
  dataLength: number;
  draftIsActive: boolean;
  draftName: string;
  draftPassword: string;
  editingUserId: number | null;
  errorMessage?: string;
  filteredUsers: AdminUser[];
  isLoading: boolean;
  onDraftIsActiveChange: (value: boolean) => void;
  onDraftNameChange: (value: string) => void;
  onDraftPasswordChange: (value: string) => void;
  onEditCancel: () => void;
  onEditStart: (user: AdminUser) => void;
  onPageChange: (value: number | ((current: number) => number)) => void;
  onPermissionFilterChange: (value: PermissionFilter) => void;
  onRefetch: () => void;
  onSaveUser: (userId: number) => void;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: SortBy) => void;
  onTogglePermission: (user: AdminUser, permission: AuthPermission) => void;
  pageSize: number;
  paginatedUsers: AdminUser[];
  permissionFilter: PermissionFilter;
  saveBusyUserId?: number;
  search: string;
  sortBy: SortBy;
  toggleBusyUserId?: number;
  totalPages: number;
}) {
  return (
    <>
      <div className="mb-4 grid gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4 lg:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-card/30 px-4 py-3 text-sm text-muted-foreground">
          <Search className="h-4 w-4 text-cyan-200" />
          <input
            className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nome ou email"
            type="search"
            value={search}
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <FilterButton active={permissionFilter === "all"} label="Todos" onClick={() => onPermissionFilterChange("all")} />
          <FilterButton active={permissionFilter === "characters"} label="Personagens" onClick={() => onPermissionFilterChange("characters")} />
          <FilterButton active={permissionFilter === "users"} label="Usuarios" onClick={() => onPermissionFilterChange("users")} />
          <FilterButton active={permissionFilter === "withoutAccess"} label="Sem acesso" onClick={() => onPermissionFilterChange("withoutAccess")} />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap gap-2">
          <StatusPill label="Gerenciam personagens" value={accessSummary.characters} />
          <StatusPill label="Gerenciam usuarios" value={accessSummary.users} />
          <StatusPill label="Sem acesso" value={accessSummary.withoutAccess} />
        </div>

        <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-card/30 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
          Ordenar
          <select className="bg-transparent text-foreground outline-none" onChange={(event) => onSortByChange(event.target.value as SortBy)} value={sortBy}>
            <option value="access">Mais acesso primeiro</option>
            <option value="recent">Mais recentes</option>
            <option value="name-asc">Nome A-Z</option>
            <option value="name-desc">Nome Z-A</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="flex min-h-[20rem] items-center justify-center rounded-[1.6rem] border border-white/10 bg-black/20 p-8 text-center">
          <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
            Carregando usuarios...
          </div>
        </div>
      ) : errorMessage ? (
        <div className="flex min-h-[20rem] flex-col items-center justify-center gap-4 rounded-[1.6rem] border border-rose-400/20 bg-rose-500/5 p-8 text-center">
          <div className="rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-rose-200">
            Falha ao carregar usuarios
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {errorMessage || "A API de administracao nao respondeu corretamente."}
          </p>
          <Button className="rounded-[1.1rem] px-5" onClick={onRefetch} type="button" variant="outline">
            Tentar novamente
          </Button>
        </div>
      ) : dataLength === 0 ? (
        <div className="flex min-h-[20rem] items-center justify-center rounded-[1.6rem] border border-white/10 bg-black/20 p-8 text-center">
          <div>
            <p className="font-display text-2xl uppercase tracking-[0.08em] text-white">Nenhum usuario encontrado</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Quando novas contas forem criadas, elas vao aparecer aqui automaticamente.
            </p>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="flex min-h-[20rem] items-center justify-center rounded-[1.6rem] border border-white/10 bg-black/20 p-8 text-center">
          <div>
            <p className="font-display text-2xl uppercase tracking-[0.08em] text-white">Nenhum resultado para esse filtro</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ajuste a busca ou troque o filtro de permissao para encontrar a conta desejada.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {paginatedUsers.map((user) => {
            const isCurrentUser = currentUserId === user.id;
            const isBusy = toggleBusyUserId === user.id;
            const isEditing = editingUserId === user.id;
            const isSavingUser = saveBusyUserId === user.id;

            return (
              <article key={user.id} className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
                        {user.role}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100/80">
                        {user.isActive ? "ativa" : "desativada"}
                      </span>
                      {isCurrentUser ? (
                        <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
                          Voce
                        </span>
                      ) : null}
                    </div>

                    {isEditing ? (
                      <div className="grid gap-3 sm:max-w-xl">
                        <label className="block">
                          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Nome publico</div>
                          <input className="form-input" onChange={(event) => onDraftNameChange(event.target.value)} type="text" value={draftName} />
                        </label>
                        <label className="block">
                          <div className="mb-2 text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">Nova senha</div>
                          <input className="form-input" onChange={(event) => onDraftPasswordChange(event.target.value)} placeholder="Deixe em branco para manter a senha atual" type="password" value={draftPassword} />
                        </label>
                        <label className="flex items-center gap-3 text-sm text-foreground">
                          <input checked={draftIsActive} className="h-4 w-4 accent-cyan-400" disabled={isCurrentUser} onChange={(event) => onDraftIsActiveChange(event.target.checked)} type="checkbox" />
                          {isCurrentUser ? "Sua conta permanece ativa" : draftIsActive ? "Conta ativa" : "Conta desativada"}
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <Button className="rounded-[1rem]" disabled={isSavingUser} onClick={() => onSaveUser(user.id)} type="button">
                            <Save className="h-4 w-4" />
                            {isSavingUser ? "Salvando..." : "Salvar usuario"}
                          </Button>
                          <Button className="rounded-[1rem]" disabled={isSavingUser} onClick={onEditCancel} type="button" variant="outline">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h2 className="font-display text-2xl uppercase tracking-[0.08em] text-white">{user.name}</h2>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </>
                    )}

                    {!isEditing ? (
                      <Button className="rounded-[1rem]" onClick={() => onEditStart(user)} type="button" variant="outline">
                        <Pencil className="h-4 w-4" />
                        Editar conta
                      </Button>
                    ) : null}
                  </div>

                  <div className="flex flex-col items-start gap-4 rounded-[1.4rem] border border-white/10 bg-card/30 p-4 sm:min-w-[24rem]">
                    <PermissionToggle checked={user.permissions.canManageCharacters} description="Libera criar, editar e excluir personagens em toda a aplicacao." disabled={isBusy} label="Gerenciar personagens" onChange={() => onTogglePermission(user, "canManageCharacters")} />
                    <PermissionToggle checked={user.permissions.canManageUsers} description="Libera entrar no painel de acessos e alterar permissoes de outras contas." disabled={isBusy || isCurrentUser} label="Gerenciar usuarios" onChange={() => onTogglePermission(user, "canManageUsers")} statusLabel={isCurrentUser ? "Protegido na propria conta" : undefined} />
                  </div>
                </div>
              </article>
            );
          })}

          {filteredUsers.length > pageSize ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80">Pagina {currentPage} de {totalPages}</div>
              <div className="flex flex-wrap gap-2">
                <FilterButton active={false} disabled={currentPage === 1} label="Primeira" onClick={() => onPageChange(1)} />
                <FilterButton active={false} disabled={currentPage === 1} label="Anterior" onClick={() => onPageChange((page) => Math.max(1, page - 1))} />
                <FilterButton active={false} disabled={currentPage === totalPages} label="Proxima" onClick={() => onPageChange((page) => Math.min(totalPages, page + 1))} />
                <FilterButton active={false} disabled={currentPage === totalPages} label="Ultima" onClick={() => onPageChange(totalPages)} />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
