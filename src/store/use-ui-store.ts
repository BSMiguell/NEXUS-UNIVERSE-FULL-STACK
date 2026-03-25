import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export type QuantumToast = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type UIState = {
  isSearchOpen: boolean;
  ambienceEnabled: boolean;
  ambienceVolume: number;
  toasts: QuantumToast[];
  openSearch: () => void;
  closeSearch: () => void;
  toggleAmbience: () => void;
  setAmbienceVolume: (value: number) => void;
  pushToast: (toast: Omit<QuantumToast, "id">) => number;
  dismissToast: (id: number) => void;
};

let nextToastId = 1;

export const useUIStore = create<UIState>((set) => ({
  isSearchOpen: false,
  ambienceEnabled: false,
  ambienceVolume: 0.18,
  toasts: [],
  openSearch: () => set({ isSearchOpen: true }),
  closeSearch: () => set({ isSearchOpen: false }),
  toggleAmbience: () =>
    set((state) => ({ ambienceEnabled: !state.ambienceEnabled })),
  setAmbienceVolume: (value) =>
    set({
      ambienceVolume: Math.max(0, Math.min(1, value)),
    }),
  pushToast: (toast) => {
    const id = nextToastId++;

    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }));

    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((item) => item.id !== id),
      }));
    }, 4200);

    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((item) => item.id !== id),
    })),
}));
