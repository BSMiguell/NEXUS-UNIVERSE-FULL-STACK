import { Radar, RefreshCw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

type ModelEmptyStateProps = {
  onReset: () => void;
};

export function ModelEmptyState({ onReset }: ModelEmptyStateProps) {
  return (
    <div className="cosmos-story-panel flex flex-col items-center justify-center gap-8 rounded-[2.5rem] px-8 py-24 text-center">
      <div className="relative flex h-40 w-40 items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-cyan-300/20" />
        <div className="absolute inset-4 animate-[spin_14s_linear_infinite] rounded-full border border-dashed border-primary/25" />
        <div className="absolute inset-0 rounded-full bg-cyan-300/5 blur-3xl" />
        <Radar className="absolute h-24 w-24 text-cyan-300/15" />
        <SearchX className="relative h-14 w-14 text-primary shadow-[0_0_30px_rgba(45,212,191,0.45)]" />
      </div>

      <div className="max-w-xl space-y-4">
        <h3 className="font-display text-4xl font-black uppercase tracking-[0.1em] text-white">
          Nenhum modelo detectado
        </h3>
        <p className="text-lg leading-relaxed text-slate-300/82">
          A leitura atual nao encontrou nenhuma assinatura 3D. Reconfigure a busca para restaurar o sinal da matriz.
        </p>
      </div>

      <Button className="rounded-[1.2rem] px-10" onClick={onReset} variant="default">
        <RefreshCw className="h-4 w-4" />
        Restaurar conexao
      </Button>
    </div>
  );
}
