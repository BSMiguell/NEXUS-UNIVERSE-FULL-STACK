import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Crosshair,
  History,
  type LucideIcon,
  RefreshCcw,
  ShieldAlert,
  Swords,
  Trophy,
} from "lucide-react";
import { Background3D } from "@/components/3d/background-3d";
import { Interactive3D } from "@/components/3d/interactive-3d";
import { AppLink } from "@/components/navigation/app-link";
import { CharacterSelectorDialog } from "@/components/battle/character-selector-dialog";
import { Button } from "@/components/ui/button";
import { useCharactersQuery } from "@/hooks/use-characters-query";
import {
  simulateBattle,
  simulateTournament,
  type BattleSimulation,
  type BattleTournamentResult,
} from "@/lib/battle";
import { getWebpImagePath } from "@/lib/image-sources";
import { cn } from "@/lib/utils";
import { useBattleStore } from "@/store/use-battle-store";
import type { Character } from "@/types/character";

type BattleMode = "duel" | "tournament";

export function BattlePage() {
  const prefersReducedMotion = useReducedMotion();
  const { data: characters = [], isLoading, error } = useCharactersQuery();
  const history = useBattleStore((state) => state.history);
  const addHistoryEntry = useBattleStore((state) => state.addHistoryEntry);
  const clearHistory = useBattleStore((state) => state.clearHistory);
  const [leftId, setLeftId] = useState<number | null>(null);
  const [rightId, setRightId] = useState<number | null>(null);
  const [mode, setMode] = useState<BattleMode>("duel");
  const [result, setResult] = useState<BattleSimulation | null>(null);
  const [tournamentResult, setTournamentResult] = useState<BattleTournamentResult | null>(
    null,
  );
  const [selectorSide, setSelectorSide] = useState<"left" | "right" | null>(null);

  const availableCharacters = useMemo(
    () => [...characters].sort((a, b) => a.name.localeCompare(b.name)),
    [characters],
  );
  const leftCharacter =
    availableCharacters.find((character) => character.id === leftId) ?? null;
  const rightCharacter =
    availableCharacters.find((character) => character.id === rightId) ?? null;

  const canBattle =
    Boolean(leftCharacter) &&
    Boolean(rightCharacter) &&
    leftCharacter?.id !== rightCharacter?.id;

  const resetArena = () => {
    setLeftId(null);
    setRightId(null);
    setResult(null);
    setTournamentResult(null);
  };

  const runBattle = () => {
    if (!leftCharacter || !rightCharacter || leftCharacter.id === rightCharacter.id) {
      return;
    }

    if (mode === "tournament") {
      const nextResult = simulateTournament(leftCharacter, rightCharacter);
      setTournamentResult(nextResult);
      setResult(nextResult.matches[0]?.simulation ?? null);
      addHistoryEntry({
        mode: "quantum",
        winnerName: nextResult.championName,
        loserName: nextResult.contenderName,
        score: nextResult.summary,
      });
      return;
    }

    const nextResult = simulateBattle(leftCharacter, rightCharacter);
    setResult(nextResult);
    setTournamentResult(null);
    addHistoryEntry({
      mode: "quantum",
      winnerName: nextResult.winnerName,
      loserName: nextResult.loserName,
      score: nextResult.score,
    });
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <section className="cosmos-model-hero quantum-panel relative overflow-hidden rounded-[2.5rem] p-8">
        <div className="pointer-events-none absolute inset-0 opacity-35">
          <Background3D />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,rgba(56,189,248,0.16),transparent_20%),radial-gradient(circle_at_80%_20%,rgba(251,191,36,0.12),transparent_16%)]" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Sistema especial
            </div>
            <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-[0.12em] text-white sm:text-5xl">
              Batalha quantica
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300/86">
              A arena agora segue a leitura do legado: duelo tatico, serie em torneio,
              painel de telemetria, log detalhado e historico persistente da operacao.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <BattleMetric label="Historico" value={String(history.length)} icon={History} />
            <BattleMetric
              label="Modo"
              value={mode === "duel" ? "1v1" : "Best of 5"}
              icon={Swords}
            />
            <BattleMetric
              label="Resultado"
              value={
                tournamentResult?.championName ?? result?.winnerName ?? "Aguardando"
              }
              icon={Trophy}
              hotspot={{
                label: "Ver resultado",
                onClick: () =>
                  document.getElementById("battle-result")?.scrollIntoView({
                    behavior: prefersReducedMotion ? "auto" : "smooth",
                    block: "start",
                  }),
              }}
            />
            <BattleMetric
              label="Historico rapido"
              value="Atalho"
              icon={History}
              hotspot={{
                label: "Ver historico",
                onClick: () =>
                  document.getElementById("battle-history")?.scrollIntoView({
                    behavior: prefersReducedMotion ? "auto" : "smooth",
                    block: "start",
                  }),
              }}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <article className="quantum-panel rounded-[2rem] p-6" id="battle-result">
          <div className="flex flex-wrap gap-3">
            <ModeChip
              active={mode === "duel"}
              description="Simulacao singular com rounds completos."
              label="Duelo tatico"
              onClick={() => setMode("duel")}
            />
            <ModeChip
              active={mode === "tournament"}
              description="Serie completa em 5 batalhas, como no legado."
              label="Modo torneio"
              onClick={() => setMode("tournament")}
            />
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <SelectorBlock
              character={leftCharacter}
              disabled={isLoading || availableCharacters.length === 0}
              label="Combatente alfa"
              onOpenSelector={() => setSelectorSide("left")}
              onChange={(value) => setLeftId(Number(value))}
              options={availableCharacters}
              value={leftId}
            />
            <SelectorBlock
              character={rightCharacter}
              disabled={isLoading || availableCharacters.length === 0}
              label="Combatente omega"
              onOpenSelector={() => setSelectorSide("right")}
              onChange={(value) => setRightId(Number(value))}
              options={availableCharacters}
              value={rightId}
            />
          </div>

          <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
                Selecao rapida
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/50">
                {availableCharacters.length} entidades prontas
              </div>
            </div>

            {isLoading ? (
              <div className="mt-4 rounded-[1.2rem] border border-dashed border-white/15 bg-background/30 p-4 text-sm text-slate-300/82">
                Carregando personagens da arena...
              </div>
            ) : error ? (
              <div className="mt-4 rounded-[1.2rem] border border-dashed border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100/86">
                Falha ao carregar os personagens para a batalha.
              </div>
            ) : availableCharacters.length === 0 ? (
              <div className="mt-4 rounded-[1.2rem] border border-dashed border-white/15 bg-background/30 p-4 text-sm text-slate-300/82">
                Nenhum personagem disponivel no momento.
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {availableCharacters.slice(0, 12).map((character) => (
                  <QuickPickCharacter
                    character={character}
                    key={character.id}
                    leftActive={leftId === character.id}
                    onPickLeft={() => setLeftId(character.id)}
                    onPickRight={() => setRightId(character.id)}
                    rightActive={rightId === character.id}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/60">
                Leitura da arena
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <TelemetryStat
                  label="Pressao ofensiva"
                  value={
                    leftCharacter && rightCharacter
                      ? String(
                          leftCharacter.stats.forca + leftCharacter.stats.velocidade,
                        )
                      : "--"
                  }
                />
                <TelemetryStat
                  label="Blindagem omega"
                  value={
                    rightCharacter
                      ? String(rightCharacter.stats.defesa + rightCharacter.stats.energia)
                      : "--"
                  }
                />
                <TelemetryStat
                  label="Ritmo de serie"
                  value={mode === "duel" ? "Pontual" : "Longo"}
                />
                <TelemetryStat
                  label="Resultado pronto"
                  value={canBattle ? "Sim" : "Pendente"}
                />
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(var(--surface-glow),0.14),rgba(5,8,16,0.94))] p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/60">
                Controle
              </div>
              <div className="mt-4 space-y-3">
                <Button
                  className="w-full rounded-[1.15rem] px-5"
                  disabled={!canBattle}
                  onClick={runBattle}
                  type="button"
                >
                  <Swords className="h-4 w-4" />
                  {mode === "duel" ? "Iniciar batalha quantica" : "Iniciar torneio"}
                </Button>
                <Button
                  className="w-full rounded-[1.15rem] px-5"
                  onClick={resetArena}
                  type="button"
                  variant="outline"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reiniciar arena
                </Button>
                <Button asChild className="w-full rounded-[1.15rem] px-5" variant="outline">
                  <AppLink to="/batalha-2d">
                    <Crosshair className="h-4 w-4" />
                    Arena 2D
                  </AppLink>
                </Button>
              </div>
            </div>
          </div>
        </article>

        <article className="quantum-panel rounded-[2rem] p-6">
          <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
            Registro de batalha
          </div>
          <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
            Resultado operacional
          </h2>

          {tournamentResult ? (
            <div className="mt-6 space-y-4">
              <ResultHero
                subtitle={tournamentResult.summary}
                title={tournamentResult.championName}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {tournamentResult.matches.map(({ match, simulation }) => (
                  <div
                    className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4"
                    key={`${simulation.winnerId}-${match}`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/60">
                      Batalha {match}
                    </div>
                    <div className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
                      {simulation.winnerName}
                    </div>
                    <p className="mt-2 text-sm text-slate-300/82">{simulation.score}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : result ? (
            <div className="mt-6 space-y-4">
              <ResultHero
                subtitle={`Score final: ${result.score}`}
                title={result.winnerName}
              />

              <div className="space-y-3">
                {result.rounds.map((round, index) => (
                  <div
                    className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4"
                    key={`${round.attackerId}-${round.defenderId}-${index}`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/60">
                      Round {index + 1}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-200/86">
                      {round.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.6rem] border border-dashed border-white/15 bg-black/20 p-8 text-center">
              <ShieldAlert className="mx-auto h-8 w-8 text-cyan-200/60" />
              <div className="mt-4 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/60">
                Arena pronta
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300/82">
                Selecione dois personagens para abrir o dossie de batalha ou iniciar
                uma serie em modo torneio.
              </p>
            </div>
          )}
        </article>
      </section>

      <section className="quantum-panel rounded-[2rem] p-6" id="battle-history">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Historico
            </div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
              Batalhas recentes
            </h2>
          </div>
          <Button
            className="rounded-[1.2rem] px-5"
            onClick={clearHistory}
            type="button"
            variant="outline"
          >
            Limpar historico
          </Button>
        </div>

        <div className="mt-6 grid gap-3">
          {history.length > 0 ? (
            history.map((entry) => (
              <div
                className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4"
                key={entry.id}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold uppercase tracking-[0.12em] text-white">
                    {entry.winnerName} venceu {entry.loserName}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/60">
                    {entry.mode} | {new Date(entry.timestamp).toLocaleString("pt-BR")}
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-300/82">{entry.score}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-white/15 bg-black/20 p-6 text-sm text-slate-300/82">
              Nenhuma batalha registrada ainda.
            </div>
          )}
        </div>
      </section>

      <CharacterSelectorDialog
        characters={availableCharacters}
        onClose={() => setSelectorSide(null)}
        onSelect={(character) => {
          if (selectorSide === "left") {
            setLeftId(character.id);
          }
          if (selectorSide === "right") {
            setRightId(character.id);
          }
          setSelectorSide(null);
        }}
        open={selectorSide !== null}
        selectedId={selectorSide === "left" ? leftId : rightId}
        sideLabel={selectorSide === "right" ? "Selecionar combatente omega" : "Selecionar combatente alfa"}
      />
    </motion.div>
  );
}

function SelectorBlock({
  character,
  disabled = false,
  label,
  onOpenSelector,
  onChange,
  options,
  value,
}: {
  character: Character | null;
  disabled?: boolean;
  label: string;
  onOpenSelector: () => void;
  onChange: (value: string) => void;
  options: Character[];
  value: number | null;
}) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
        {label}
      </div>
      <select
        className="mt-4 h-12 w-full rounded-[1rem] border border-white/10 bg-background px-4 text-sm uppercase tracking-[0.14em] text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        value={value ?? ""}
      >
        <option value="">
          {disabled ? "Carregando personagens" : "Selecionar"}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>

      {character ? (
        <div className="mt-4 flex items-center gap-4 rounded-[1.2rem] border border-white/10 bg-black/20 p-3">
          <picture>
            <source srcSet={getWebpImagePath(character.image)} type="image/webp" />
            <img
              alt={character.name}
              className="h-16 w-16 rounded-xl object-cover"
              height="64"
              loading="lazy"
              src={character.image}
              width="64"
            />
          </picture>
          <div>
            <div className="font-display text-lg uppercase tracking-[0.08em] text-white">
              {character.name}
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-cyan-200/70">
              {character.category}
            </div>
          </div>
        </div>
      ) : null}

      <Button
        className="mt-4 w-full rounded-[1rem] px-4"
        disabled={disabled}
        onClick={onOpenSelector}
        type="button"
        variant="outline"
      >
        Abrir seletor visual
      </Button>
    </div>
  );
}

function QuickPickCharacter({
  character,
  leftActive,
  onPickLeft,
  onPickRight,
  rightActive,
}: {
  character: Character;
  leftActive: boolean;
  onPickLeft: () => void;
  onPickRight: () => void;
  rightActive: boolean;
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-background/35 p-3">
      <div className="flex items-center gap-3">
        <picture>
          <source srcSet={getWebpImagePath(character.image)} type="image/webp" />
          <img
            alt={character.name}
            className="h-14 w-14 rounded-xl object-cover"
            height="56"
            loading="lazy"
            src={character.image}
            width="56"
          />
        </picture>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold uppercase tracking-[0.12em] text-white">
            {character.name}
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/60">
            {character.category}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className={cn(
            "rounded-[0.95rem] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
            leftActive
              ? "border-primary/40 bg-primary/12 text-white"
              : "border-white/10 bg-black/20 text-slate-200 hover:border-white/20",
          )}
          onClick={onPickLeft}
          type="button"
        >
          Alfa
        </button>
        <button
          className={cn(
            "rounded-[0.95rem] border px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
            rightActive
              ? "border-primary/40 bg-primary/12 text-white"
              : "border-white/10 bg-black/20 text-slate-200 hover:border-white/20",
          )}
          onClick={onPickRight}
          type="button"
        >
          Omega
        </button>
      </div>
    </div>
  );
}

function BattleMetric({
  label,
  value,
  icon: Icon,
  hotspot,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hotspot?: {
    label: string;
    onClick: () => void;
  };
}) {
  return (
    <Interactive3D
      hotspots={
        hotspot
          ? [
              {
                id: `${label}-hotspot`,
                label: hotspot.label,
                ariaLabel: `${hotspot.label} - ${label}`,
                top: "0.4rem",
                right: "0.4rem",
                onClick: hotspot.onClick,
              },
            ]
          : []
      }
    >
      <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
              {label}
            </div>
            <div className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
              {value}
            </div>
          </div>
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Interactive3D>
  );
}

function TelemetryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-background/40 p-3">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/60">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
        {value}
      </div>
    </div>
  );
}

function ModeChip({
  active,
  description,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-[1.4rem] border px-4 py-3 text-left transition-all",
        active
          ? "border-primary/35 bg-primary/12 shadow-[0_0_24px_rgba(var(--surface-glow),0.18)]"
          : "border-white/10 bg-black/20 hover:border-white/20",
      )}
      onClick={onClick}
      type="button"
    >
      <div className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
        {label}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-slate-300/76">{description}</p>
    </button>
  );
}

function ResultHero({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div className="rounded-[1.4rem] border border-primary/20 bg-primary/10 p-5">
      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
        Vencedor detectado
      </div>
      <div className="mt-2 font-display text-3xl uppercase tracking-[0.08em] text-white">
        {title}
      </div>
      <p className="mt-2 text-sm text-slate-300/82">{subtitle}</p>
    </div>
  );
}
