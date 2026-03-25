import { Info, UserPlus } from "lucide-react";
import type { Character } from "@/types/character";

type CharacterDetailsProps = {
  details: Character["details"];
};

export function CharacterDetails({ details }: CharacterDetailsProps) {
  const detailList = Object.entries(details).filter(
    ([, value]) => value !== undefined,
  );
  const spotlight = detailList.slice(0, 3);
  const archive = detailList.slice(3);

  return (
    <div className="quantum-panel space-y-8 rounded-[2.5rem] p-8 lg:p-12">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <Info className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-foreground">
            Informações do Universo
          </h2>
          <p className="text-sm tracking-widest text-muted-foreground uppercase">
            Dados de origem e biografia
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {spotlight.map(([key, value]) => (
          <div
            className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(4,8,18,0.9),rgba(10,12,20,0.72))] p-6"
            key={key}
          >
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/65">
              {formatLabel(key)}
            </div>
            <div className="mt-3 font-display text-2xl font-bold uppercase tracking-[0.06em] text-white">
              {String(value)}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {archive.map(([key, value]) => (
          <div
            className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/5"
            key={key}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-3.5 w-3.5 text-primary opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                  {formatLabel(key)}
                </span>
              </div>
              <div className="font-display text-2xl font-bold tracking-tight text-foreground/90 transition-colors duration-300 group-hover:text-foreground">
                {String(value)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatLabel(value: string) {
  return value.replace(/[_-]/g, " ");
}
