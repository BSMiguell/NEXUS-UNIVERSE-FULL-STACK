import type { NextApiRequest, NextApiResponse } from "next";
import { removeFavoriteId } from "./_store";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ favoriteIds?: number[]; message?: string }>,
) {
  if (req.method !== "DELETE") {
    res.setHeader("Allow", "DELETE");
    res.status(405).json({ message: "Metodo nao permitido" });
    return;
  }

  const rawCharacterId = Array.isArray(req.query.characterId)
    ? req.query.characterId[0]
    : req.query.characterId;
  const characterId = Number(rawCharacterId);

  if (!Number.isFinite(characterId) || characterId <= 0) {
    res.status(400).json({ message: "characterId invalido" });
    return;
  }

  res.status(200).json({ favoriteIds: removeFavoriteId(characterId) });
}
