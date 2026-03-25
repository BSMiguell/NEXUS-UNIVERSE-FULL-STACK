import type { NextApiRequest, NextApiResponse } from "next";
import { addFavoriteId, getFavoriteIds } from "./_store";

type FavoritesResponse = {
  favoriteIds: number[];
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<FavoritesResponse | { message: string }>,
) {
  if (req.method === "GET") {
    res.status(200).json({ favoriteIds: getFavoriteIds() });
    return;
  }

  if (req.method === "POST") {
    const characterId = Number((req.body as { characterId?: number })?.characterId);

    if (!Number.isFinite(characterId) || characterId <= 0) {
      res.status(400).json({ message: "characterId invalido" });
      return;
    }

    res.status(200).json({ favoriteIds: addFavoriteId(characterId) });
    return;
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).json({ message: "Metodo nao permitido" });
}
