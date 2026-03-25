import { apiClient } from "@/lib/api-client";

export type FavoritesResponse = {
  favoriteIds: number[];
};

export async function getMyFavorites(): Promise<FavoritesResponse> {
  const { data } = await apiClient.get<FavoritesResponse>("/api/me/favorites");
  return data;
}

export async function addFavorite(characterId: number): Promise<FavoritesResponse> {
  const { data } = await apiClient.post<FavoritesResponse>("/api/me/favorites", {
    characterId,
  });
  return data;
}

export async function removeFavorite(characterId: number): Promise<void> {
  await apiClient.delete(`/api/me/favorites/${characterId}`);
}
