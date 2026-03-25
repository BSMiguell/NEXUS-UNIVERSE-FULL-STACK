import { Orbit, Shield, Sparkles, Sword, Zap } from "lucide-react";
import type { Character } from "@/types/character";

type CharacterStatsProps = {
  stats: Character["stats"];
};

const statConfig = [
  {
    key: "forca",
    label: "Força",
    icon: Sword,
    color: "from-red-500/20 to-orange-500/20",
    textColor: "text-red-400",
  },
  {
    key: "velocidade",
    label: "Velocidade",
    icon: Zap,
    color: "from-blue-500/20 to-cyan-500/20",
    textColor: "text-cyan-400",
  },
  {
    key: "defesa",
    label: "Defesa",
    icon: Shield,
    color: "from-emerald-500/20 to-teal-500/20",
    textColor: "text-emerald-400",
  },
  {
    key: "energia",
    label: "Energia",
    icon: Sparkles,
    color: "from-purple-500/20 to-pink-500/20",
    textColor: "text-purple-400",
  },
  {
    key: "habilidade",
    label: "Habilidade",
    icon: Orbit,
    color: "from-amber-500/20 to-yellow-500/20",
    textColor: "text-amber-400",
  },
] as const;

export function CharacterStats({ stats }: CharacterStatsProps) {
  const peak = Math.max(...Object.values(stats));
  const average = Math.round(
    Object.values(stats).reduce((total, value) => total + value, 0) /
      Object.values(stats).length,
  );

  return (
    <div className="quantum-panel space-y-8 rounded-[2.5rem] p-8 lg:p-12">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/70">
            Leitura de combate
          </p>
          <h2 className="font-display text-4xl font-black uppercase italic tracking-tight text-foreground sm:text-5xl">
            Atributos de combate
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Readout label="Pico detectado" value={`${peak}%`} />
          <Readout label="Media geral" value={`${average}%`} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statConfig.map(({ key, label, icon: Icon, color, textColor }) => (
          <div
            className="group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20 p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/5"
            key={key}
          >
            {/* Hover Gradient Background */}
            <div
              className={`absolute inset-0 -z-10 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${color}`}
            />

            <div className="flex flex-col items-center gap-4 text-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner transition-transform duration-300 group-hover:scale-110 ${textColor}`}
              >
                <Icon className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-black tracking-[0.2em] text-muted-foreground uppercase">
                  {label}
                </div>
                <div className="font-display text-4xl font-black text-foreground">
                  {stats[key]}
                </div>
              </div>

              {/* Stat Bar (Visual Only) */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full bg-gradient-to-r ${textColor.replace("text-", "from-").replace("-400", "-500")} to-white/20 transition-all duration-1000`}
                  style={{ width: `${stats[key]}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-black/20 px-4 py-3">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold uppercase tracking-[0.08em] text-white">
        {value}
      </div>
    </div>
  );
}
