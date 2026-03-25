import { create } from "zustand";

type GallerySort = "original" | "name-asc" | "name-desc";

type GalleryState = {
  search: string;
  category: string;
  sort: GallerySort;
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setSort: (sort: GallerySort) => void;
  resetFilters: () => void;
};

const initialState = {
  search: "",
  category: "all",
  sort: "original" as GallerySort,
};

export const useGalleryStore = create<GalleryState>((set) => ({
  ...initialState,
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setSort: (sort) => set({ sort }),
  resetFilters: () => set(initialState),
}));
