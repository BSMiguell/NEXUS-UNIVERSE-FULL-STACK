import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/use-auth-store";
import { useFavoritesStore } from "@/store/use-favorites-store";
import { resolveThemeTokens, useThemeStore } from "@/store/use-theme-store";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap />
      <ThemeBootstrap />
      {children}
    </QueryClientProvider>
  );
}

function SessionBootstrap() {
  const token = useAuthStore((state) => state.token);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const hydrateFavorites = useFavoritesStore((state) => state.hydrateFavorites);
  const resetFavorites = useFavoritesStore((state) => state.reset);

  useEffect(() => {
    if (!isAuthReady) {
      return;
    }

    if (!token) {
      resetFavorites();
      return;
    }

    void hydrateFavorites();
  }, [hydrateFavorites, isAuthReady, resetFavorites, token]);

  return null;
}

function ThemeBootstrap() {
  const activePresetId = useThemeStore((state) => state.activePresetId);
  const mode = useThemeStore((state) => state.mode);
  const primaryHex = useThemeStore((state) => state.primaryHex);
  const accentHex = useThemeStore((state) => state.accentHex);
  const fontDisplay = useThemeStore((state) => state.fontDisplay);
  const fontBody = useThemeStore((state) => state.fontBody);

  useEffect(() => {
    const root = document.documentElement;
    const tokens = resolveThemeTokens({
      activePresetId,
      mode,
      primaryHex,
      accentHex,
      fontDisplay,
      fontBody,
    });

    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
    root.dataset.themeMode = mode;
  }, [accentHex, activePresetId, fontBody, fontDisplay, mode, primaryHex]);

  return null;
}
