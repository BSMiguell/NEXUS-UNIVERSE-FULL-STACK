import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeFontKey = "orbitron" | "exo2" | "rajdhani" | "space-grotesk";

export type ThemeTokens = {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  border: string;
  input: string;
  ring: string;
  "surface-glow": string;
  "surface-glow-strong": string;
};

export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  tokens: ThemeTokens;
  primaryHex: string;
  accentHex: string;
  fontDisplay: ThemeFontKey;
  fontBody: ThemeFontKey;
};

export type ThemeMode = "dark" | "light";

type ThemeState = {
  presets: ThemePreset[];
  activePresetId: string;
  mode: ThemeMode;
  primaryHex: string;
  accentHex: string;
  fontDisplay: ThemeFontKey;
  fontBody: ThemeFontKey;
  setActivePreset: (presetId: string) => void;
  setMode: (mode: ThemeMode) => void;
  setPrimaryHex: (value: string) => void;
  setAccentHex: (value: string) => void;
  setFontDisplay: (value: ThemeFontKey) => void;
  setFontBody: (value: ThemeFontKey) => void;
  resetCustomizations: () => void;
};

export const themeFonts: Record<ThemeFontKey, string> = {
  orbitron: '"Orbitron", sans-serif',
  exo2: '"Exo 2", sans-serif',
  rajdhani: '"Rajdhani", sans-serif',
  "space-grotesk": '"Space Grotesk", sans-serif',
};

export const themePresets: ThemePreset[] = [
  {
    id: "quantum-default",
    name: "Quantum Default",
    description: "A identidade sci-fi atual, com glow ciano e profundidade fria.",
    primaryHex: "#5eead4",
    accentHex: "#38bdf8",
    fontDisplay: "orbitron",
    fontBody: "rajdhani",
    tokens: {
      background: "222 47% 7%",
      foreground: "210 40% 98%",
      card: "224 45% 10%",
      "card-foreground": "210 40% 98%",
      primary: "171 77% 64%",
      "primary-foreground": "222 47% 8%",
      secondary: "217 33% 17%",
      "secondary-foreground": "210 40% 98%",
      muted: "217 33% 17%",
      "muted-foreground": "215 20% 68%",
      accent: "198 93% 60%",
      "accent-foreground": "222 47% 8%",
      border: "215 27% 20%",
      input: "215 27% 20%",
      ring: "171 77% 64%",
      "surface-glow": "45 212 191",
      "surface-glow-strong": "56 189 248",
    },
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    description: "Energia amber com contraste quente para sessoes mais heroicas.",
    primaryHex: "#f59e0b",
    accentHex: "#f97316",
    fontDisplay: "exo2",
    fontBody: "rajdhani",
    tokens: {
      background: "20 30% 8%",
      foreground: "36 100% 97%",
      card: "18 28% 12%",
      "card-foreground": "36 100% 97%",
      primary: "38 92% 50%",
      "primary-foreground": "25 90% 8%",
      secondary: "16 30% 18%",
      "secondary-foreground": "36 100% 97%",
      muted: "18 24% 18%",
      "muted-foreground": "32 32% 73%",
      accent: "24 95% 53%",
      "accent-foreground": "20 70% 10%",
      border: "21 26% 24%",
      input: "21 26% 24%",
      ring: "38 92% 50%",
      "surface-glow": "245 158 11",
      "surface-glow-strong": "249 115 22",
    },
  },
  {
    id: "void-rose",
    name: "Void Rose",
    description: "Uma leitura mais dramatica, com magenta eletrico e azul profundo.",
    primaryHex: "#f472b6",
    accentHex: "#60a5fa",
    fontDisplay: "orbitron",
    fontBody: "space-grotesk",
    tokens: {
      background: "248 37% 8%",
      foreground: "210 40% 98%",
      card: "247 31% 12%",
      "card-foreground": "210 40% 98%",
      primary: "330 81% 70%",
      "primary-foreground": "248 37% 10%",
      secondary: "243 24% 18%",
      "secondary-foreground": "210 40% 98%",
      muted: "243 24% 18%",
      "muted-foreground": "235 17% 72%",
      accent: "217 91% 68%",
      "accent-foreground": "243 40% 10%",
      border: "243 18% 26%",
      input: "243 18% 26%",
      ring: "330 81% 70%",
      "surface-glow": "244 114 182",
      "surface-glow-strong": "96 165 250",
    },
  },
];

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const fullHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  const value = Number.parseInt(fullHex, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let hue = 0;
  let saturation = 0;

  if (delta !== 0) {
    saturation =
      lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case red:
        hue = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }

    hue /= 6;
  }

  return {
    h: Math.round(hue * 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

function hexToHslValue(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  return `${h} ${s}% ${l}%`;
}

function findPreset(presetId: string) {
  return (
    themePresets.find((preset) => preset.id === presetId) ?? themePresets[0]
  );
}

function getPresetSnapshot(presetId: string) {
  const preset = findPreset(presetId);

  return {
    activePresetId: preset.id,
    mode: "dark" as ThemeMode,
    primaryHex: preset.primaryHex,
    accentHex: preset.accentHex,
    fontDisplay: preset.fontDisplay,
    fontBody: preset.fontBody,
  };
}

export function resolveThemeTokens(state: Pick<
  ThemeState,
  | "activePresetId"
  | "mode"
  | "primaryHex"
  | "accentHex"
  | "fontDisplay"
  | "fontBody"
>) {
  const preset = findPreset(state.activePresetId);
  const primaryRgb = hexToRgb(state.primaryHex);
  const accentRgb = hexToRgb(state.accentHex);
  const baseTokens =
    state.mode === "light"
      ? {
          ...preset.tokens,
          background: "210 33% 97%",
          foreground: "224 45% 12%",
          card: "0 0% 100%",
          "card-foreground": "224 45% 12%",
          secondary: "210 26% 92%",
          "secondary-foreground": "224 45% 14%",
          muted: "210 24% 92%",
          "muted-foreground": "220 14% 42%",
          border: "214 24% 84%",
          input: "214 24% 84%",
        }
      : preset.tokens;

  return {
    ...baseTokens,
    primary: hexToHslValue(state.primaryHex),
    accent: hexToHslValue(state.accentHex),
    ring: hexToHslValue(state.primaryHex),
    "surface-glow": `${primaryRgb.r} ${primaryRgb.g} ${primaryRgb.b}`,
    "surface-glow-strong": `${accentRgb.r} ${accentRgb.g} ${accentRgb.b}`,
    "font-display": themeFonts[state.fontDisplay],
    "font-body": themeFonts[state.fontBody],
  };
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      presets: themePresets,
      ...getPresetSnapshot(themePresets[0].id),
      setActivePreset: (presetId) => set(() => getPresetSnapshot(presetId)),
      setMode: (mode) => set({ mode }),
      setPrimaryHex: (value) => set({ primaryHex: value }),
      setAccentHex: (value) => set({ accentHex: value }),
      setFontDisplay: (value) => set({ fontDisplay: value }),
      setFontBody: (value) => set({ fontBody: value }),
      resetCustomizations: () => {
        const { activePresetId } = get();
        set(() => getPresetSnapshot(activePresetId));
      },
    }),
    {
      name: "nexus-theme-store",
      partialize: (state) => ({
        activePresetId: state.activePresetId,
        mode: state.mode,
        primaryHex: state.primaryHex,
        accentHex: state.accentHex,
        fontDisplay: state.fontDisplay,
        fontBody: state.fontBody,
      }),
    },
  ),
);
