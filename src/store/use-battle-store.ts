import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BattleHistoryEntry = {
  id: number;
  mode: "quantum" | "2d";
  winnerName: string;
  loserName: string;
  score: string;
  timestamp: string;
};

type BattleState = {
  history: BattleHistoryEntry[];
  addHistoryEntry: (entry: Omit<BattleHistoryEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
};

let nextBattleHistoryId = 1;

export const useBattleStore = create<BattleState>()(
  persist(
    (set) => ({
      history: [],
      addHistoryEntry: (entry) =>
        set((state) => ({
          history: [
            {
              id: nextBattleHistoryId++,
              timestamp: new Date().toISOString(),
              ...entry,
            },
            ...state.history,
          ].slice(0, 20),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "nexus-battle-store",
    },
  ),
);
