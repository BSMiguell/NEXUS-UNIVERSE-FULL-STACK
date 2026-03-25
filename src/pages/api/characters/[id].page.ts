import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Character } from "@/types/character";

const charactersFilePath = resolve(process.cwd(), "public", "api", "characters.json");

function loadCharacters(): Character[] {
  const fileContents = readFileSync(charactersFilePath, "utf-8");
  return JSON.parse(fileContents) as Character[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Metodo nao permitido" });
    return;
  }

  const rawId = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  const id = Number(rawId);

  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ message: "ID invalido" });
    return;
  }

  const character = loadCharacters().find((entry) => entry.id === id);

  if (!character) {
    res.status(404).json({ message: "Personagem nao encontrado" });
    return;
  }

  res.status(200).json(character);
}
