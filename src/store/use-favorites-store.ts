import { create } from "zustand";
import { addFavorite, getMyFavorites, removeFavorite } from "@/services/favorites";
import { useAuthStore } from "@/store/use-auth-store";

export type FavoritesSort = "added-desc" | "name-asc" | "name-desc";

type FavoritesState = {
  favoriteIds: Set<number>;
  favoritesOrder: number[];
  sort: FavoritesSort;
  isLoading: boolean;
  hydrateFavorites: () => Promise<void>;
  toggleFavorite: (id: number) => Promise<void>;
  clearFavorites: () => Promise<void>;
  setSort: (sort: FavoritesSort) => void;
  reset: () => void;
};

function applyFavoriteIds(ids: number[]) {
  return {
    favoriteIds: new Set(ids),
    favoritesOrder: ids,
  };
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: new Set(),
  favoritesOrder: [],
  sort: "added-desc",
  isLoading: false,
  hydrateFavorites: async () => {
    const token = useAuthStore.getState().token;

    if (!token) {
      set({ favoriteIds: new Set(), favoritesOrder: [], isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const data = await getMyFavorites();
      set({
        ...applyFavoriteIds(data.favoriteIds),
        isLoading: false,
      });
    } catch {
      set({ favoriteIds: new Set(), favoritesOrder: [], isLoading: false });
    }
  },
  toggleFavorite: async (id) => {
    const token = useAuthStore.getState().token;

    if (!token) {
      throw new Error("AUTH_REQUIRED");
    }

    const isFavorite = get().favoriteIds.has(id);

    if (isFavorite) {
      await removeFavorite(id);
      set((state) => {
        const nextIds = state.favoritesOrder.filter((favoriteId) => favoriteId !== id);
        return applyFavoriteIds(nextIds);
      });
      return;
    }

    const data = await addFavorite(id);
    set({
      ...applyFavoriteIds(data.favoriteIds),
    });
  },
  clearFavorites: async () => {
    const ids = [...get().favoritesOrder];

    for (const id of ids) {
      await removeFavorite(id);
    }

    set({ favoriteIds: new Set(), favoritesOrder: [] });
  },
  setSort: (sort) => set({ sort }),
  reset: () => set({ favoriteIds: new Set(), favoritesOrder: [], isLoading: false }),
}));
