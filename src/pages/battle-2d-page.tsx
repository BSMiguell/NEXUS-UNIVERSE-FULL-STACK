import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Expand,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Sparkles,
  Swords,
  UserRound,
} from "lucide-react";
import { CharacterSelectorDialog } from "@/components/battle/character-selector-dialog";
import { SkinSelectorDialog } from "@/components/battle/skin-selector-dialog";
import { AppLink } from "@/components/navigation/app-link";
import { Button } from "@/components/ui/button";
import {
  getBattleAttackFrameSources,
  getBattleSkinAttackFrameSources,
} from "@/lib/battle-animations";
import { getBattleSkinOptions, type BattleSkinOption } from "@/lib/battle-skins";
import { getWebpImagePath } from "@/lib/image-sources";
import { cn } from "@/lib/utils";
import { useCharactersQuery } from "@/hooks/use-characters-query";
import { useBattleStore } from "@/store/use-battle-store";
import type { Character } from "@/types/character";

type ArenaSettings = {
  labelsVisible: boolean;
  healthGlow: boolean;
  healthTheme: "cyan" | "amber" | "violet";
  nameColor: string;
  nameSize: number;
};

type FighterState = {
  action: "idle" | "run" | "jump" | "attack" | "special" | "dash" | "hit";
  attackCooldown: number;
  attackFrames: HTMLImageElement[];
  attackTimer: number;
  animationTime: number;
  color: string;
  direction: 1 | -1;
  energy: number;
  health: number;
  hitFlash: number;
  image: HTMLImageElement | null;
  jumpVelocity: number;
  name: string;
  onGround: boolean;
  specialCooldown: number;
  speed: number;
  velocityX: number;
  x: number;
  y: number;
};

type Particle = {
  color: string;
  life: number;
  maxLife: number;
  size: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

type EngineState = {
  bot: FighterState;
  ended: boolean;
  lastTime: number;
  player: FighterState;
  shake: number;
  winner: string | null;
  particles: Particle[];
};

const ARENA_WIDTH = 960;
const ARENA_HEIGHT = 480;
const FLOOR_Y = 396;
const FIGHTER_WIDTH = 160;
const FIGHTER_HEIGHT = 220;
const MAX_HEALTH = 100;
const MAX_ENERGY = 100;
const GRAVITY = 1500;

const defaultSettings: ArenaSettings = {
  labelsVisible: true,
  healthGlow: true,
  healthTheme: "cyan",
  nameColor: "#f8fbff",
  nameSize: 15,
};

export function Battle2DPage() {
  const prefersReducedMotion = useReducedMotion();
  const { data: characters = [], error, isLoading } = useCharactersQuery();
  const addHistoryEntry = useBattleStore((state) => state.addHistoryEntry);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const engineRef = useRef<EngineState | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [botId, setBotId] = useState<number | null>(null);
  const [selectorSide, setSelectorSide] = useState<"player" | "bot" | null>(null);
  const [skinModalSide, setSkinModalSide] = useState<"player" | "bot" | null>(null);
  const [playerSkinId, setPlayerSkinId] = useState("");
  const [botSkinId, setBotSkinId] = useState("");
  const [paused, setPaused] = useState(false);
  const [running, setRunning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ArenaSettings>(defaultSettings);
  const [hud, setHud] = useState({
    botEnergy: 0,
    botHealth: MAX_HEALTH,
    playerEnergy: 0,
    playerHealth: MAX_HEALTH,
    status: "Pronto",
  });

  const sortedCharacters = useMemo(
    () => [...characters].sort((left, right) => left.name.localeCompare(right.name)),
    [characters],
  );
  const playerCharacter =
    sortedCharacters.find((character) => character.id === playerId) ?? null;
  const botCharacter = sortedCharacters.find((character) => character.id === botId) ?? null;
  const playerSkins = useMemo(() => getBattleSkinOptions(playerCharacter), [playerCharacter]);
  const botSkins = useMemo(() => getBattleSkinOptions(botCharacter), [botCharacter]);
  const playerSkin =
    playerSkins.find((skin) => skin.id === playerSkinId) ?? playerSkins[0] ?? null;
  const botSkin = botSkins.find((skin) => skin.id === botSkinId) ?? botSkins[0] ?? null;
  const canStart = Boolean(playerCharacter && botCharacter && playerCharacter.id !== botCharacter.id);

  useEffect(() => {
    if (playerSkins.length > 0 && !playerSkins.some((skin) => skin.id === playerSkinId)) {
      setPlayerSkinId(playerSkins[0].id);
    }
  }, [playerSkinId, playerSkins]);

  useEffect(() => {
    if (botSkins.length > 0 && !botSkins.some((skin) => skin.id === botSkinId)) {
      setBotSkinId(botSkins[0].id);
    }
  }, [botSkinId, botSkins]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysRef.current[event.code] = true;
      if (event.code === "KeyE" && running) {
        setPaused((current) => !current);
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyD", "Space", "KeyF", "KeyQ", "ShiftLeft", "ShiftRight"].includes(event.code)) {
        event.preventDefault();
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current[event.code] = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [running]);

  useEffect(() => {
    if (!running || paused || !engineRef.current || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let lastHudSync = 0;

    const tick = (time: number) => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }

      const deltaMs = engine.lastTime === 0 ? 16 : Math.min(32, time - engine.lastTime);
      const delta = deltaMs / 1000;
      engine.lastTime = time;

      updatePlayer(engine.player, keysRef.current, delta);
      updateBot(engine.bot, engine.player, delta);
      resolveCombat(engine, delta);
      updateParticles(engine, delta);
      renderArena(context, engine, settings);

      if (time - lastHudSync > 50) {
        setHud({
          botEnergy: engine.bot.energy,
          botHealth: engine.bot.health,
          playerEnergy: engine.player.energy,
          playerHealth: engine.player.health,
          status: engine.ended ? `Finalizado • ${engine.winner}` : paused ? "Pausado" : "Em combate",
        });
        lastHudSync = time;
      }

      if (engine.ended && !winner) {
        const nextWinner = engine.winner ?? "Indefinido";
        setWinner(nextWinner);
        setRunning(false);
        setPaused(false);
        addHistoryEntry({
          mode: "2d",
          winnerName: nextWinner,
          loserName:
            nextWinner === engine.player.name ? engine.bot.name : engine.player.name,
          score: `${Math.max(0, Math.round(engine.player.health))}/${MAX_HEALTH} x ${Math.max(0, Math.round(engine.bot.health))}/${MAX_HEALTH}`,
        });
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [addHistoryEntry, paused, running, settings, winner]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const startBattle = async () => {
    if (!playerCharacter || !botCharacter || !playerSkin || !botSkin) {
      return;
    }

    const [playerImage, botImage, playerAttackFrames, botAttackFrames] = await Promise.all([
      loadImage(playerSkin.image || playerCharacter.image),
      loadImage(botSkin.image || botCharacter.image),
      loadAnimationFrames(
        getPreferredAttackFrames(playerCharacter.name, playerSkin),
      ),
      loadAnimationFrames(
        getPreferredAttackFrames(botCharacter.name, botSkin),
      ),
    ]);

    engineRef.current = {
      bot: createFighter(
        botCharacter.name,
        "#fb7185",
        botImage,
        botAttackFrames,
        ARENA_WIDTH - 260,
        -1,
      ),
      ended: false,
      lastTime: 0,
      particles: [],
      player: createFighter(
        playerCharacter.name,
        "#22d3ee",
        playerImage,
        playerAttackFrames,
        160,
        1,
      ),
      shake: 0,
      winner: null,
    };
    setHud({
      botEnergy: 0,
      botHealth: MAX_HEALTH,
      playerEnergy: 0,
      playerHealth: MAX_HEALTH,
      status: "Em combate",
    });
    setWinner(null);
    setPaused(false);
    setRunning(true);
  };

  const resetBattle = () => {
    engineRef.current = null;
    setRunning(false);
    setPaused(false);
    setWinner(null);
    setHud({
      botEnergy: 0,
      botHealth: MAX_HEALTH,
      playerEnergy: 0,
      playerHealth: MAX_HEALTH,
      status: "Pronto",
    });
  };

  const toggleFullscreen = async () => {
    const arena = arenaRef.current;
    if (!arena) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await arena.requestFullscreen();
  };

  const healthThemeClass =
    settings.healthTheme === "amber"
      ? "bg-[linear-gradient(90deg,rgba(251,191,36,0.95),rgba(249,115,22,0.82))]"
      : settings.healthTheme === "violet"
        ? "bg-[linear-gradient(90deg,rgba(168,85,247,0.95),rgba(99,102,241,0.82))]"
        : "bg-[linear-gradient(90deg,rgba(34,211,238,0.95),rgba(56,189,248,0.82))]";

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <section className="cosmos-model-hero quantum-panel relative overflow-hidden rounded-[2.5rem] p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(56,189,248,0.18),transparent_22%),radial-gradient(circle_at_84%_20%,rgba(251,191,36,0.12),transparent_18%),radial-gradient(circle_at_70%_86%,rgba(45,212,191,0.12),transparent_20%)]" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Sistema especial
            </div>
            <h1 className="mt-2 font-display text-4xl font-black uppercase tracking-[0.12em] text-white sm:text-5xl">
              Batalha 2D arcade
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-300/86">
              Arena jogável com teclado, IA, dash, ataque especial, pausa,
              fullscreen e seletor visual de personagem e skins. O layout segue a
              linguagem nova do site.
            </p>
          </div>
          <div className="relative z-10 grid gap-3 sm:grid-cols-3">
            <Metric label="Estado" value={running ? (paused ? "Pausado" : "Ativo") : "Pronto"} />
            <Metric label="Modo" value="PvE 2D" />
            <Metric label="Resultado" value={winner ?? "Aguardando"} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <article className="quantum-panel rounded-[2rem] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
              Seleção de combatentes
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-[1rem] px-4" onClick={() => setSelectorSide("player")} type="button" variant="outline">
                <UserRound className="h-4 w-4" />
                Jogador
              </Button>
              <Button className="rounded-[1rem] px-4" onClick={() => setSelectorSide("bot")} type="button" variant="outline">
                <Swords className="h-4 w-4" />
                Bot
              </Button>
              <Button className="rounded-[1rem] px-4" onClick={() => setSettingsOpen((current) => !current)} type="button" variant="outline">
                <Settings2 className="h-4 w-4" />
                Arena
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <SelectedCharacterCard
              character={playerCharacter}
              label="Jogador"
              onOpenCharacter={() => setSelectorSide("player")}
              onOpenSkin={() => setSkinModalSide("player")}
              skin={playerSkin}
            />
            <SelectedCharacterCard
              character={botCharacter}
              label="Bot"
              onOpenCharacter={() => setSelectorSide("bot")}
              onOpenSkin={() => setSkinModalSide("bot")}
              skin={botSkin}
            />
          </div>

          {settingsOpen ? (
            <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-black/20 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
                Painel de arena
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <RangeField
                  label="Tamanho do nome"
                  max={24}
                  min={10}
                  onChange={(value) =>
                    setSettings((current) => ({ ...current, nameSize: value }))
                  }
                  value={settings.nameSize}
                />
                <label className="grid gap-2 text-sm text-slate-200">
                  Cor do nome
                  <input
                    className="h-11 w-full rounded-xl border border-white/10 bg-background p-2"
                    onChange={(event) =>
                      setSettings((current) => ({ ...current, nameColor: event.target.value }))
                    }
                    type="color"
                    value={settings.nameColor}
                  />
                </label>
                <label className="grid gap-2 text-sm text-slate-200">
                  Tema da barra
                  <select
                    className="h-11 rounded-xl border border-white/10 bg-background px-3 uppercase tracking-[0.12em] text-white"
                    onChange={(event) =>
                      setSettings((current) => ({
                        ...current,
                        healthTheme: event.target.value as ArenaSettings["healthTheme"],
                      }))
                    }
                    value={settings.healthTheme}
                  >
                    <option value="cyan">Cyan</option>
                    <option value="amber">Amber</option>
                    <option value="violet">Violet</option>
                  </select>
                </label>
                <div className="grid gap-2">
                  <ToggleField
                    checked={settings.healthGlow}
                    label="Glow nas barras"
                    onChange={(checked) =>
                      setSettings((current) => ({ ...current, healthGlow: checked }))
                    }
                  />
                  <ToggleField
                    checked={settings.labelsVisible}
                    label="Labels visíveis"
                    onChange={(checked) =>
                      setSettings((current) => ({ ...current, labelsVisible: checked }))
                    }
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <Button className="rounded-[1.2rem] px-5" disabled={!canStart} onClick={() => void startBattle()} type="button">
              <Play className="h-4 w-4" />
              Iniciar batalha
            </Button>
            <Button className="rounded-[1.2rem] px-5" disabled={!running} onClick={() => setPaused((current) => !current)} type="button" variant="outline">
              <Pause className="h-4 w-4" />
              {paused ? "Retomar" : "Pausar"}
            </Button>
            <Button className="rounded-[1.2rem] px-5" onClick={resetBattle} type="button" variant="outline">
              <RotateCcw className="h-4 w-4" />
              Resetar
            </Button>
            <Button className="rounded-[1.2rem] px-5" onClick={() => void toggleFullscreen()} type="button" variant="outline">
              <Expand className="h-4 w-4" />
              Fullscreen
            </Button>
            <Button asChild className="rounded-[1.2rem] px-5" variant="outline">
              <AppLink to="/batalha">
                <Swords className="h-4 w-4" />
                Batalha principal
              </AppLink>
            </Button>
          </div>

          <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
              Comandos
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-300/84 md:grid-cols-2">
              <div>A / D ou setas: mover</div>
              <div>W ou Espaço: pular</div>
              <div>F: ataque básico</div>
              <div>Q: especial</div>
              <div>Shift: dash</div>
              <div>E: pausa</div>
            </div>
            {isLoading ? (
              <div className="mt-3 text-sm text-slate-300/84">Carregando personagens...</div>
            ) : null}
            {error ? (
              <div className="mt-3 text-sm text-rose-300">Falha ao carregar personagens.</div>
            ) : null}
          </div>
        </article>

        <section className="quantum-panel rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
                Arena operacional
              </div>
              <div className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
                Setor de combate
              </div>
            </div>
            <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary">
              {hud.status}
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
            <HealthBlock
              current={hud.playerHealth}
              energy={hud.playerEnergy}
              glow={settings.healthGlow}
              label={playerCharacter?.name ?? "Jogador"}
              labelsVisible={settings.labelsVisible}
              themeClass={healthThemeClass}
            />
            <div className="flex items-center justify-center font-display text-3xl uppercase tracking-[0.18em] text-primary">
              VS
            </div>
            <HealthBlock
              current={hud.botHealth}
              energy={hud.botEnergy}
              glow={settings.healthGlow}
              label={botCharacter?.name ?? "Bot"}
              labelsVisible={settings.labelsVisible}
              themeClass={healthThemeClass}
            />
          </div>

          <div
            className="relative mt-6 overflow-hidden rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(var(--surface-glow),0.16),rgba(5,8,16,0.96))] p-4"
            ref={arenaRef}
          >
            <canvas
              className="block h-auto w-full rounded-[1.3rem] border border-white/10 bg-[#050812]"
              height={ARENA_HEIGHT}
              ref={canvasRef}
              width={ARENA_WIDTH}
            />

            {!running ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="rounded-[1.6rem] border border-white/10 bg-black/60 px-8 py-6 text-center backdrop-blur-md">
                  <Sparkles className="mx-auto h-8 w-8 text-cyan-200/70" />
                  <div className="mt-4 font-display text-3xl uppercase tracking-[0.12em] text-white">
                    Arena pronta
                  </div>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-300/82">
                    Selecione dois personagens, escolha as skins e inicie a batalha.
                  </p>
                </div>
              </div>
            ) : null}

            {paused ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 backdrop-blur-sm">
                <div className="rounded-[1.6rem] border border-white/10 bg-background/90 px-8 py-6 text-center">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
                    Pausa
                  </div>
                  <div className="mt-3 font-display text-3xl uppercase tracking-[0.12em] text-white">
                    Combate interrompido
                  </div>
                  <p className="mt-3 text-sm text-slate-300/82">
                    Pressione E ou use o botão de pausa para retomar.
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </section>

      <CharacterSelectorDialog
        characters={sortedCharacters}
        onClose={() => setSelectorSide(null)}
        onSelect={(character) => {
          if (selectorSide === "player") {
            setPlayerId(character.id);
          } else {
            setBotId(character.id);
          }
          setSelectorSide(null);
        }}
        open={selectorSide !== null}
        selectedId={selectorSide === "player" ? playerId : botId}
        sideLabel={selectorSide === "player" ? "Selecionar jogador" : "Selecionar bot"}
      />

      <SkinSelectorDialog
        activeId={skinModalSide === "player" ? playerSkinId : botSkinId}
        fallbackImage={
          skinModalSide === "player"
            ? playerCharacter?.image || ""
            : botCharacter?.image || ""
        }
        label={skinModalSide === "player" ? "Skins do jogador" : "Skins do bot"}
        onApply={(skinId) => {
          if (skinModalSide === "player") {
            setPlayerSkinId(skinId);
          } else {
            setBotSkinId(skinId);
          }
        }}
        onClose={() => setSkinModalSide(null)}
        open={skinModalSide !== null}
        skins={skinModalSide === "player" ? playerSkins : botSkins}
      />
    </motion.div>
  );
}

function SelectedCharacterCard({
  character,
  label,
  onOpenCharacter,
  onOpenSkin,
  skin,
}: {
  character: Character | null;
  label: string;
  onOpenCharacter: () => void;
  onOpenSkin: () => void;
  skin: BattleSkinOption | null;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
          {label}
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100/50">
          {skin?.label || "Padrao"}
        </div>
      </div>

      {character ? (
        <div className="mt-4 flex items-center gap-4 rounded-[1.2rem] border border-white/10 bg-background/35 p-3">
          <picture>
            <source srcSet={getWebpImagePath(character.image)} type="image/webp" />
            <img
              alt={character.name}
              className="h-20 w-20 rounded-[1rem] object-cover"
              height="80"
              loading="lazy"
              src={skin?.image || character.image}
              width="80"
            />
          </picture>
          <div className="min-w-0">
            <div className="truncate font-display text-lg uppercase tracking-[0.08em] text-white">
              {character.name}
            </div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/60">
              {character.category}
            </div>
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-300/76">
              {character.description}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex min-h-28 items-center justify-center rounded-[1.2rem] border border-dashed border-white/15 bg-background/30 text-sm text-slate-300/78">
          Nenhum personagem selecionado
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button className="rounded-[1rem] px-4" onClick={onOpenCharacter} type="button" variant="outline">
          Selecionar
        </Button>
        <Button className="rounded-[1rem] px-4" disabled={!character} onClick={onOpenSkin} type="button" variant="outline">
          Skin
        </Button>
      </div>
    </div>
  );
}

function HealthBlock({
  current,
  energy,
  glow,
  label,
  labelsVisible,
  themeClass,
}: {
  current: number;
  energy: number;
  glow: boolean;
  label: string;
  labelsVisible: boolean;
  themeClass: string;
}) {
  const width = `${Math.max(0, Math.min(100, current))}%`;
  const energyWidth = `${Math.max(0, Math.min(100, energy))}%`;

  return (
    <div className="flex-1">
      {labelsVisible ? (
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100/60">
          {label}
        </div>
      ) : null}
      <div className="mt-2 h-3 rounded-full bg-white/10">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            themeClass,
            glow && "shadow-[0_0_18px_rgba(var(--surface-glow),0.28)]",
          )}
          style={{ width }}
        />
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.95),rgba(249,115,22,0.78))] transition-all"
          style={{ width: energyWidth }}
        />
      </div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
        {Math.max(0, Math.round(current))}/100
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-white">
        {value}
      </div>
    </div>
  );
}

function RangeField({
  label,
  max,
  min,
  onChange,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label className="grid gap-2 text-sm text-slate-200">
      {label}
      <input
        className="accent-cyan-300"
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        type="range"
        value={value}
      />
      <span className="text-xs uppercase tracking-[0.18em] text-cyan-100/60">{value}</span>
    </label>
  );
}

function ToggleField({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[1rem] border border-white/10 bg-background/30 px-3 py-2 text-sm text-slate-200">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      {label}
    </label>
  );
}

function createFighter(
  name: string,
  color: string,
  image: HTMLImageElement | null,
  attackFrames: HTMLImageElement[],
  x: number,
  direction: 1 | -1,
): FighterState {
  return {
    action: "idle",
    attackCooldown: 0,
    attackFrames,
    attackTimer: 0,
    animationTime: 0,
    color,
    direction,
    energy: 0,
    health: MAX_HEALTH,
    hitFlash: 0,
    image,
    jumpVelocity: 0,
    name,
    onGround: true,
    specialCooldown: 0,
    speed: 280,
    velocityX: 0,
    x,
    y: FLOOR_Y,
  };
}

async function loadImage(src: string) {
  if (!src) {
    return null;
  }

  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

async function loadAnimationFrames(sources: string[]) {
  if (sources.length === 0) {
    return [];
  }

  const frames = await Promise.all(sources.map((source) => loadImage(source)));
  return frames.filter((frame): frame is HTMLImageElement => Boolean(frame));
}

function updatePlayer(player: FighterState, keys: Record<string, boolean>, delta: number) {
  const movingLeft = keys.KeyA || keys.ArrowLeft;
  const movingRight = keys.KeyD || keys.ArrowRight;
  const wantsJump = keys.KeyW || keys.ArrowUp || keys.Space;
  const wantsAttack = keys.KeyF;
  const wantsSpecial = keys.KeyQ;
  const wantsDash = keys.ShiftLeft || keys.ShiftRight;
  let velocityX = 0;

  if (movingLeft) {
    velocityX -= player.speed;
    player.direction = -1;
  }
  if (movingRight) {
    velocityX += player.speed;
    player.direction = 1;
  }
  if (wantsDash) {
    velocityX += player.direction * 240;
  }
  if (wantsJump && player.onGround) {
    player.jumpVelocity = -620;
    player.onGround = false;
  }

  player.attackCooldown = Math.max(0, player.attackCooldown - delta);
  player.specialCooldown = Math.max(0, player.specialCooldown - delta);
  player.attackTimer = Math.max(0, player.attackTimer - delta);
  player.hitFlash = Math.max(0, player.hitFlash - delta * 3);
  player.energy = Math.min(MAX_ENERGY, player.energy + 12 * delta);
  if (player.attackTimer > 0) {
    player.animationTime += delta;
  }

  if (wantsAttack && player.attackCooldown === 0) {
    player.attackCooldown = 0.58;
    player.attackTimer = 0.42;
    player.animationTime = 0;
    player.action = "attack";
  }
  if (wantsSpecial && player.specialCooldown === 0 && player.energy >= 40) {
    player.specialCooldown = 1.25;
    player.attackTimer = 0.62;
    player.energy -= 40;
    player.animationTime = 0;
    player.action = "special";
  }

  player.jumpVelocity += GRAVITY * delta;
  player.y += player.jumpVelocity * delta;
  if (player.y >= FLOOR_Y) {
    player.y = FLOOR_Y;
    player.jumpVelocity = 0;
    player.onGround = true;
  }
  player.velocityX = velocityX;
  player.x = clamp(player.x + velocityX * delta, 80, ARENA_WIDTH - 80);

  if (player.attackTimer <= 0) {
    if (!player.onGround) {
      player.action = "jump";
    } else if (Math.abs(player.velocityX) > 8) {
      player.action = wantsDash ? "dash" : "run";
    } else if (player.hitFlash > 0) {
      player.action = "hit";
    } else {
      player.action = "idle";
    }
  }
}

function updateBot(bot: FighterState, player: FighterState, delta: number) {
  bot.attackCooldown = Math.max(0, bot.attackCooldown - delta);
  bot.specialCooldown = Math.max(0, bot.specialCooldown - delta);
  bot.attackTimer = Math.max(0, bot.attackTimer - delta);
  bot.hitFlash = Math.max(0, bot.hitFlash - delta * 3);
  bot.energy = Math.min(MAX_ENERGY, bot.energy + 11 * delta);
  if (bot.attackTimer > 0) {
    bot.animationTime += delta;
  }

  const distance = player.x - bot.x;
  bot.direction = distance < 0 ? -1 : 1;
  let velocityX = 0;

  if (Math.abs(distance) > 130) {
    velocityX += Math.sign(distance) * bot.speed * 0.78;
  } else if (bot.attackCooldown === 0) {
    bot.attackCooldown = 0.6;
    bot.attackTimer = 0.4;
    bot.animationTime = 0;
    bot.action = "attack";
  }

  if (bot.specialCooldown === 0 && bot.energy >= 55 && Math.abs(distance) < 200) {
    bot.specialCooldown = 1.6;
    bot.attackTimer = 0.58;
    bot.energy -= 55;
    bot.animationTime = 0;
    bot.action = "special";
  }

  if (Math.abs(distance) > 180 && bot.onGround && Math.random() < 0.012) {
    bot.jumpVelocity = -540;
    bot.onGround = false;
  }

  bot.jumpVelocity += GRAVITY * delta;
  bot.y += bot.jumpVelocity * delta;
  if (bot.y >= FLOOR_Y) {
    bot.y = FLOOR_Y;
    bot.jumpVelocity = 0;
    bot.onGround = true;
  }
  bot.velocityX = velocityX;
  bot.x = clamp(bot.x + velocityX * delta, 80, ARENA_WIDTH - 80);

  if (bot.attackTimer <= 0) {
    if (!bot.onGround) {
      bot.action = "jump";
    } else if (Math.abs(bot.velocityX) > 8) {
      bot.action = "run";
    } else if (bot.hitFlash > 0) {
      bot.action = "hit";
    } else {
      bot.action = "idle";
    }
  }
}

function resolveCombat(engine: EngineState, delta: number) {
  const { bot, player } = engine;
  const overlap = FIGHTER_WIDTH - Math.abs(player.x - bot.x);

  if (overlap > 0) {
    const push = overlap / 2 + 2;
    if (player.x <= bot.x) {
      player.x = clamp(player.x - push, 80, ARENA_WIDTH - 80);
      bot.x = clamp(bot.x + push, 80, ARENA_WIDTH - 80);
    } else {
      player.x = clamp(player.x + push, 80, ARENA_WIDTH - 80);
      bot.x = clamp(bot.x - push, 80, ARENA_WIDTH - 80);
    }
  }

  const targetWidth = FIGHTER_WIDTH * 0.56;
  const targetHeight = FIGHTER_HEIGHT * 0.88;
  const playerBody = {
    bottom: player.y,
    left: player.x - targetWidth / 2,
    right: player.x + targetWidth / 2,
    top: player.y - targetHeight,
  };
  const botBody = {
    bottom: bot.y,
    left: bot.x - targetWidth / 2,
    right: bot.x + targetWidth / 2,
    top: bot.y - targetHeight,
  };
  const playerAttackBox = createAttackBox(player);
  const botAttackBox = createAttackBox(bot);
  const playerHitsBot = player.attackTimer > 0 && intersectsRect(playerAttackBox, botBody);
  const botHitsPlayer = bot.attackTimer > 0 && intersectsRect(botAttackBox, playerBody);

  if (playerHitsBot && player.attackCooldown > 0.3) {
    const damage = player.specialCooldown > 1 ? 20 : 8;
    bot.health = Math.max(0, bot.health - damage * delta * 7);
    bot.hitFlash = 0.8;
    bot.action = "hit";
    bot.x = clamp(bot.x + player.direction * 140 * delta, 80, ARENA_WIDTH - 80);
    engine.shake = 8;
    emitBurst(engine.particles, bot.x, bot.y - 110, player.color, 5);
    player.energy = Math.min(MAX_ENERGY, player.energy + 10 * delta);
  }

  if (botHitsPlayer && bot.attackCooldown > 0.35) {
    const damage = bot.specialCooldown > 1.2 ? 18 : 7;
    player.health = Math.max(0, player.health - damage * delta * 7);
    player.hitFlash = 0.8;
    player.action = "hit";
    player.x = clamp(player.x + bot.direction * 140 * delta, 80, ARENA_WIDTH - 80);
    engine.shake = 8;
    emitBurst(engine.particles, player.x, player.y - 110, bot.color, 5);
    bot.energy = Math.min(MAX_ENERGY, bot.energy + 9 * delta);
  }

  engine.shake = Math.max(0, engine.shake - 18 * delta);

  if (player.health <= 0 || bot.health <= 0) {
    engine.ended = true;
    engine.winner = player.health > bot.health ? player.name : bot.name;
  }
}

function updateParticles(engine: EngineState, delta: number) {
  engine.particles = engine.particles
    .map((particle) => ({
      ...particle,
      life: particle.life - delta,
      x: particle.x + particle.vx * delta,
      y: particle.y + particle.vy * delta,
      vy: particle.vy + 40 * delta,
    }))
    .filter((particle) => particle.life > 0);
}

function renderArena(
  context: CanvasRenderingContext2D,
  engine: EngineState,
  settings: ArenaSettings,
) {
  const shakeX = engine.shake > 0 ? (Math.random() - 0.5) * engine.shake : 0;
  const shakeY = engine.shake > 0 ? (Math.random() - 0.5) * engine.shake : 0;

  context.save();
  context.clearRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);
  context.translate(shakeX, shakeY);

  const background = context.createLinearGradient(0, 0, 0, ARENA_HEIGHT);
  background.addColorStop(0, "#07111e");
  background.addColorStop(0.55, "#0b1524");
  background.addColorStop(1, "#05070d");
  context.fillStyle = background;
  context.fillRect(0, 0, ARENA_WIDTH, ARENA_HEIGHT);

  context.strokeStyle = "rgba(34,211,238,0.08)";
  context.lineWidth = 1;
  for (let x = 0; x <= ARENA_WIDTH; x += 48) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, ARENA_HEIGHT);
    context.stroke();
  }
  for (let y = 0; y <= ARENA_HEIGHT; y += 48) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(ARENA_WIDTH, y);
    context.stroke();
  }

  context.fillStyle = "rgba(34,211,238,0.12)";
  context.fillRect(0, FLOOR_Y + 12, ARENA_WIDTH, 3);
  context.fillStyle = "rgba(9,15,24,0.96)";
  context.fillRect(0, FLOOR_Y + 15, ARENA_WIDTH, ARENA_HEIGHT - FLOOR_Y);

  drawFighter(context, engine.player, settings);
  drawFighter(context, engine.bot, settings);

  for (const particle of engine.particles) {
    const alpha = particle.life / particle.maxLife;
    context.globalAlpha = alpha;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;
  context.restore();
}

function drawFighter(
  context: CanvasRenderingContext2D,
  fighter: FighterState,
  settings: ArenaSettings,
) {
  const width =
    fighter.action === "dash"
      ? FIGHTER_WIDTH + 24
      : fighter.action === "attack" || fighter.action === "special"
        ? FIGHTER_WIDTH + 12
        : FIGHTER_WIDTH;
  const height =
    fighter.action === "jump"
      ? FIGHTER_HEIGHT - 14
      : fighter.action === "hit"
        ? FIGHTER_HEIGHT - 8
        : FIGHTER_HEIGHT;
  const bob =
    fighter.action === "run" ? Math.sin(Date.now() / 110) * 5 : fighter.action === "idle" ? Math.sin(Date.now() / 220) * 2 : 0;
  const tilt =
    fighter.action === "attack"
      ? fighter.direction * 0.08
      : fighter.action === "special"
        ? fighter.direction * 0.14
        : fighter.action === "dash"
          ? fighter.direction * 0.18
          : 0;
  const left = fighter.x - width / 2;
  const top = fighter.y - height + bob;
  const animatedFrame = getAttackAnimationFrame(fighter);

  context.save();
  context.translate(fighter.x, fighter.y - height / 2 + bob);
  context.rotate(tilt);
  context.translate(-fighter.x, -(fighter.y - height / 2 + bob));
  if (fighter.hitFlash > 0) {
    context.globalAlpha = 0.8 + Math.sin(Date.now() / 40) * 0.2;
  }
  if (animatedFrame) {
    if (fighter.direction === -1) {
      context.translate(fighter.x, 0);
      context.scale(-1, 1);
      context.drawImage(animatedFrame, -width / 2, top, width, height);
    } else {
      context.drawImage(animatedFrame, left, top, width, height);
    }
  } else if (fighter.image) {
    if (fighter.direction === -1) {
      context.translate(fighter.x, 0);
      context.scale(-1, 1);
      context.drawImage(fighter.image, -width / 2, top, width, height);
    } else {
      context.drawImage(fighter.image, left, top, width, height);
    }
  } else {
    context.fillStyle = fighter.color;
      context.fillRect(left, top, width, height);
  }
  if (fighter.attackTimer > 0) {
    const attackBox = createAttackBox(fighter);
    context.globalAlpha = 0.18;
    context.fillStyle = fighter.color;
    context.fillRect(
      attackBox.left,
      attackBox.top,
      attackBox.right - attackBox.left,
      attackBox.bottom - attackBox.top,
    );
    context.globalAlpha = 1;
  }
  context.restore();

  if (settings.labelsVisible) {
    context.save();
    context.fillStyle = settings.nameColor;
    context.font = `700 ${settings.nameSize}px Orbitron, Arial`;
    context.textAlign = "center";
    context.shadowBlur = settings.healthGlow ? 14 : 0;
    context.shadowColor = fighter.color;
    context.fillText(fighter.name, fighter.x, top - 16);
    context.restore();
  }
}

function emitBurst(
  particles: Particle[],
  x: number,
  y: number,
  color: string,
  count: number,
) {
  for (let index = 0; index < count; index += 1) {
    particles.push({
      color,
      life: 0.35 + Math.random() * 0.25,
      maxLife: 0.55,
      size: 2 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 240,
      vy: -40 - Math.random() * 120,
      x,
      y,
    });
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getAttackAnimationFrame(fighter: FighterState) {
  if (
    fighter.attackFrames.length === 0 ||
    (fighter.action !== "attack" && fighter.action !== "special")
  ) {
    return null;
  }

  const playbackDuration = fighter.action === "special" ? 0.62 : 0.42;
  const progress = clamp(fighter.animationTime / playbackDuration, 0, 0.999);
  const frameIndex = Math.min(
    fighter.attackFrames.length - 1,
    Math.floor(progress * fighter.attackFrames.length),
  );

  return fighter.attackFrames[frameIndex] ?? null;
}

function getPreferredAttackFrames(
  characterName: string,
  skin: BattleSkinOption | null,
) {
  const skinHints = [
    skin?.id,
    skin?.label,
    skin?.image,
  ].filter((value): value is string => Boolean(value));

  for (const hint of skinHints) {
    const skinFrames = getBattleSkinAttackFrameSources(hint);
    if (skinFrames.length > 0) {
      return skinFrames;
    }
  }

  return getBattleAttackFrameSources(characterName);
}

function createAttackBox(fighter: FighterState) {
  const reach = fighter.action === "special" ? 152 : 126;
  const nearOffset = fighter.action === "special" ? 16 : 10;
  const top = fighter.y - 168;
  const bottom = fighter.y - 12;
  const rawLeft = fighter.direction === 1 ? fighter.x + nearOffset : fighter.x - reach;
  const rawRight = fighter.direction === 1 ? fighter.x + reach : fighter.x - nearOffset;

  return {
    bottom,
    left: Math.min(rawLeft, rawRight),
    right: Math.max(rawLeft, rawRight),
    top,
  };
}

function intersectsRect(
  first: { left: number; right: number; top: number; bottom: number },
  second: { left: number; right: number; top: number; bottom: number },
) {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
}
