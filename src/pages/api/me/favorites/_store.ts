const favoriteIds = new Set<number>([1, 2]);

export function getFavoriteIds() {
  return Array.from(favoriteIds);
}

export function addFavoriteId(id: number) {
  favoriteIds.add(id);
  return getFavoriteIds();
}

export function removeFavoriteId(id: number) {
  favoriteIds.delete(id);
  return getFavoriteIds();
}
