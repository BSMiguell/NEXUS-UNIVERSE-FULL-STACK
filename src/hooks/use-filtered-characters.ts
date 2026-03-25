import { useMemo } from "react";
import { useGalleryStore } from "@/store/use-gallery-store";
import type { Character } from "@/types/character";

export function useFilteredCharacters(charactersData: Character[]) {
  const sort = useGalleryStore((state) => state.sort);

  const filteredAndSortedCharacters = useMemo(() => {
    if (sort === "name-asc") {
      return [...charactersData].sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sort === "name-desc") {
      return [...charactersData].sort((a, b) => b.name.localeCompare(a.name));
    }

    return charactersData;
  }, [charactersData, sort]);

  return {
    characters: filteredAndSortedCharacters,
    totalResults: filteredAndSortedCharacters.length,
  };
}
