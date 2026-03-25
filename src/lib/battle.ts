import type { Character, CharacterStats } from "@/types/character";

export type BattleRound = {
  attackerId: number;
  attackerName: string;
  defenderId: number;
  defenderName: string;
  damage: number;
  remainingHealth: number;
  summary: string;
};

export type BattleSimulation = {
  winnerId: number;
  winnerName: string;
  loserId: number;
  loserName: string;
  rounds: BattleRound[];
  score: string;
};

export type BattleTournamentMatch = {
  match: number;
  simulation: BattleSimulation;
};

export type BattleTournamentResult = {
  championId: number;
  championName: string;
  contenderId: number;
  contenderName: string;
  wins: Record<number, number>;
  matches: BattleTournamentMatch[];
  summary: string;
};

export type BattleBot = {
  id: number;
  name: string;
  image: string;
  stats: CharacterStats;
  description: string;
};

export function simulateBattle(left: Character, right: Character): BattleSimulation {
  const leftHealth = computeHealth(left.stats);
  const rightHealth = computeHealth(right.stats);
  let currentLeftHealth = leftHealth;
  let currentRightHealth = rightHealth;
  const rounds: BattleRound[] = [];
  let turn = 0;

  while (currentLeftHealth > 0 && currentRightHealth > 0 && rounds.length < 12) {
    const attacker = turn % 2 === 0 ? left : right;
    const defender = turn % 2 === 0 ? right : left;
    const defenderHealth =
      turn % 2 === 0 ? currentRightHealth : currentLeftHealth;
    const damage = computeDamage(attacker.stats, defender.stats, rounds.length);
    const remainingHealth = Math.max(0, defenderHealth - damage);

    if (turn % 2 === 0) {
      currentRightHealth = remainingHealth;
    } else {
      currentLeftHealth = remainingHealth;
    }

    rounds.push({
      attackerId: attacker.id,
      attackerName: attacker.name,
      defenderId: defender.id,
      defenderName: defender.name,
      damage,
      remainingHealth,
      summary: `${attacker.name} pressiona ${defender.name} e causa ${damage} de dano.`,
    });

    turn += 1;
  }

  const winner = currentLeftHealth >= currentRightHealth ? left : right;
  const loser = winner.id === left.id ? right : left;
  const winnerHealth = winner.id === left.id ? currentLeftHealth : currentRightHealth;
  const winnerMaxHealth = winner.id === left.id ? leftHealth : rightHealth;

  return {
    winnerId: winner.id,
    winnerName: winner.name,
    loserId: loser.id,
    loserName: loser.name,
    rounds,
    score: `${winnerHealth}/${winnerMaxHealth}`,
  };
}

export function simulateTournament(
  left: Character,
  right: Character,
  battleCount = 5,
): BattleTournamentResult {
  const matches: BattleTournamentMatch[] = [];
  const wins: Record<number, number> = {
    [left.id]: 0,
    [right.id]: 0,
  };

  for (let index = 0; index < battleCount; index += 1) {
    const boostedLeft =
      index % 2 === 0
        ? left
        : {
            ...left,
            stats: {
              ...left.stats,
              velocidade: clampStat(left.stats.velocidade + 2),
              habilidade: clampStat(left.stats.habilidade + 1),
            },
          };
    const boostedRight =
      index % 2 === 1
        ? right
        : {
            ...right,
            stats: {
              ...right.stats,
              defesa: clampStat(right.stats.defesa + 2),
              energia: clampStat(right.stats.energia + 1),
            },
          };
    const simulation = simulateBattle(boostedLeft, boostedRight);
    wins[simulation.winnerId] = (wins[simulation.winnerId] ?? 0) + 1;
    matches.push({ match: index + 1, simulation });
  }

  const champion = wins[left.id] >= wins[right.id] ? left : right;
  const contender = champion.id === left.id ? right : left;
  const championWins = wins[champion.id] ?? 0;
  const contenderWins = wins[contender.id] ?? 0;

  return {
    championId: champion.id,
    championName: champion.name,
    contenderId: contender.id,
    contenderName: contender.name,
    wins,
    matches,
    summary: `${champion.name} venceu a serie por ${championWins}x${contenderWins}.`,
  };
}

export function createBattleBot(source: Character): BattleBot {
  return {
    id: 900000 + source.id,
    name: `BOT ${source.name}`,
    image: source.image,
    description:
      "Entidade sintetica da arena, calibrada para testar pressao, ritmo e leitura de combate.",
    stats: {
      forca: clampStat(Math.round((source.stats.forca + 12) * 0.9)),
      velocidade: clampStat(Math.round((source.stats.velocidade + 8) * 0.88)),
      defesa: clampStat(Math.round((source.stats.defesa + 10) * 0.9)),
      energia: clampStat(Math.round((source.stats.energia + 6) * 0.87)),
      habilidade: clampStat(Math.round((source.stats.habilidade + 14) * 0.9)),
    },
  };
}

export function simulateBattle2D(left: Character, bot: BattleBot) {
  let playerHealth = computeHealth(left.stats);
  let botHealth = computeHealth(bot.stats);
  const rounds: BattleRound[] = [];
  let turn = 0;

  while (playerHealth > 0 && botHealth > 0 && rounds.length < 16) {
    const attackerName = turn % 2 === 0 ? left.name : bot.name;
    const defenderName = turn % 2 === 0 ? bot.name : left.name;
    const attackerStats = turn % 2 === 0 ? left.stats : bot.stats;
    const defenderStats = turn % 2 === 0 ? bot.stats : left.stats;
    const damage = computeDamage(attackerStats, defenderStats, rounds.length);

    if (turn % 2 === 0) {
      botHealth = Math.max(0, botHealth - damage);
      rounds.push({
        attackerId: left.id,
        attackerName,
        defenderId: bot.id,
        defenderName,
        damage,
        remainingHealth: botHealth,
        summary: `${attackerName} acerta um combo vetorial em ${defenderName}.`,
      });
    } else {
      playerHealth = Math.max(0, playerHealth - damage);
      rounds.push({
        attackerId: bot.id,
        attackerName,
        defenderId: left.id,
        defenderName,
        damage,
        remainingHealth: playerHealth,
        summary: `${attackerName} responde com uma investida sintetica.`,
      });
    }

    turn += 1;
  }

  return {
    winnerName: playerHealth >= botHealth ? left.name : bot.name,
    playerHealth,
    playerMaxHealth: computeHealth(left.stats),
    botHealth,
    botMaxHealth: computeHealth(bot.stats),
    rounds,
  };
}

export type BattleSkinPreset = {
  id: "default" | "neon" | "inferno" | "void";
  label: string;
  description: string;
  filter: string;
};

export function getBattleSkinPresets(): BattleSkinPreset[] {
  return [
    {
      id: "default",
      label: "Original",
      description: "Leitura limpa da skin base.",
      filter: "none",
    },
    {
      id: "neon",
      label: "Neon",
      description: "Brilho frio com contraste alto.",
      filter: "saturate(1.15) brightness(1.08) drop-shadow(0 0 18px rgba(34,211,238,0.45))",
    },
    {
      id: "inferno",
      label: "Inferno",
      description: "Temperatura agressiva para ofensiva maxima.",
      filter: "hue-rotate(-20deg) saturate(1.3) brightness(1.02) drop-shadow(0 0 20px rgba(251,146,60,0.42))",
    },
    {
      id: "void",
      label: "Void",
      description: "Assinatura de arena sombria e espectral.",
      filter: "contrast(1.12) saturate(0.9) hue-rotate(40deg) drop-shadow(0 0 20px rgba(168,85,247,0.4))",
    },
  ];
}

function computeHealth(stats: CharacterStats) {
  return stats.defesa + stats.energia + Math.round(stats.habilidade / 2);
}

function computeDamage(
  attackerStats: CharacterStats,
  defenderStats: CharacterStats,
  roundIndex: number,
) {
  const attackPower =
    attackerStats.forca * 0.36 +
    attackerStats.velocidade * 0.24 +
    attackerStats.habilidade * 0.24 +
    attackerStats.energia * 0.16;
  const defensePower =
    defenderStats.defesa * 0.42 +
    defenderStats.velocidade * 0.18 +
    defenderStats.habilidade * 0.16;
  const momentum = roundIndex % 3 === 2 ? 8 : 0;

  return Math.max(8, Math.round(attackPower - defensePower * 0.45 + momentum));
}

function clampStat(value: number) {
  return Math.max(45, Math.min(100, value));
}
