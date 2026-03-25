import { apiClient } from "@/lib/api-client";
import { getPreferredAssetPath, getPreferredImagePath } from "@/lib/image-sources";
import type {
  Character,
  CharacterInput,
  CharactersPage,
} from "@/types/character";

export type CharactersFilters = {
  search?: string;
  favorites?: string;
  category?: string;
  modelsOnly?: boolean;
};

const MAX_CHARACTER_PAGES = 500;

function normalizeFilter(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function withPreferredImages(characters: Character[]) {
  return characters.map((character) => ({
    ...character,
    image: getPreferredImagePath(character.image),
    model3d: getPreferredAssetPath(character.model3d),
  }));
}

export async function getCharactersPage(
  page = 1,
  limit = 12,
  filters: CharactersFilters = {},
): Promise<CharactersPage> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 12;
  const search = normalizeFilter(filters.search);
  const favorites = normalizeFilter(filters.favorites);
  const category = normalizeFilter(filters.category);

  const { data } = await apiClient.get<CharactersPage>("/api/characters", {
    params: {
      page: safePage,
      limit: safeLimit,
      ...(search ? { search } : {}),
      ...(favorites ? { favorites } : {}),
      ...(category ? { category } : {}),
      ...(filters.modelsOnly ? { modelsOnly: "true" } : {}),
    },
  });

  return {
    ...data,
    items: withPreferredImages(data.items),
  };
}

export async function getCharacters(): Promise<Character[]> {
  const allCharactersById = new Map<number, Character>();
  let currentPage = 1;
  let totalPages = 1;

  do {
    const data = await getCharactersPage(currentPage, 100);
    data.items.forEach((character) => {
      allCharactersById.set(character.id, character);
    });
    totalPages = Math.min(Math.max(1, data.totalPages), MAX_CHARACTER_PAGES);
    currentPage += 1;
  } while (currentPage <= totalPages);

  return Array.from(allCharactersById.values());
}

export async function getCharacterById(id: number): Promise<Character> {
  const { data } = await apiClient.get<Character>(`/api/characters/${id}`);

  return {
    ...data,
    image: getPreferredImagePath(data.image),
    model3d: getPreferredAssetPath(data.model3d),
  };
}

export async function createCharacter(
  payload: CharacterInput,
): Promise<Character> {
  const { data } = await apiClient.post<Character>("/api/characters", payload);
  return {
    ...data,
    image: getPreferredImagePath(data.image),
    model3d: getPreferredAssetPath(data.model3d),
  };
}

export async function updateCharacter(
  id: number,
  payload: CharacterInput,
): Promise<Character> {
  const { data } = await apiClient.put<Character>(`/api/characters/${id}`, payload);
  return {
    ...data,
    image: getPreferredImagePath(data.image),
    model3d: getPreferredAssetPath(data.model3d),
  };
}

export async function deleteCharacter(id: number): Promise<void> {
  await apiClient.delete(`/api/characters/${id}`);
}
