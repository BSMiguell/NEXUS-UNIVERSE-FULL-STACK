import { AnimatePresence, motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FuzzySearch } from "@/components/search/fuzzy-search";
import { useUIStore } from "@/store/use-ui-store";

export function QuantumSearchDialog() {
  const isOpen = useUIStore((state) => state.isSearchOpen);
  const closeSearch = useUIStore((state) => state.closeSearch);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-950/80 px-4 py-10 backdrop-blur-md"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={closeSearch}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="quantum-panel relative w-full max-w-4xl rounded-[2.35rem] border border-cyan-300/20 p-6 shadow-[0_30px_100px_rgba(6,182,212,0.18)]"
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-x-16 top-0 h-24 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 rounded-[2.35rem] border border-white/5" />
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="max-w-2xl">
                <div className="text-[10px] font-black uppercase tracking-[0.34em] text-cyan-200/75">
                  Pesquisa quantica
                </div>
                <h2 className="mt-2 font-display text-3xl uppercase tracking-[0.1em] text-white">
                  Localizar entidade
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/82">
                  Busque personagens com tolerancia a erro e navegue direto para o
                  perfil desejado sem sair do fluxo principal.
                </p>
              </div>

              <Button
                className="rounded-full"
                onClick={closeSearch}
                size="icon"
                type="button"
                variant="outline"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative mt-6 grid gap-5 xl:grid-cols-[1fr_15rem]">
              <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-200/70">
                  <Search className="h-4 w-4" />
                  Terminal de busca
                </div>
                <FuzzySearch autoFocus onNavigate={closeSearch} />
              </div>

              <aside className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(5,10,20,0.92),rgba(7,12,24,0.72))] p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/65">
                  Comandos rapidos
                </div>
                <div className="mt-4 space-y-3">
                  <ShortcutItem label="Fechar painel" value="Esc" />
                  <ShortcutItem label="Buscar entidade" value="Digite" />
                  <ShortcutItem label="Abrir perfil" value="Enter" />
                </div>
                <div className="mt-5 rounded-[1.2rem] border border-cyan-300/10 bg-cyan-300/5 p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
                    Modo legacy
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300/82">
                    Busca com tolerancia a erro, leitura instantanea e navegação direta para o dossie selecionado.
                  </p>
                </div>
              </aside>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ShortcutItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[1.15rem] border border-white/10 bg-black/20 px-3 py-3">
      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </span>
      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
        {value}
      </span>
    </div>
  );
}
