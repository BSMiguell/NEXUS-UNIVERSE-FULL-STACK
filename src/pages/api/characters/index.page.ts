import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Character } from "@/types/character";

type CharactersPageResponse = {
  items: Character[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
};

const charactersFilePath = resolve(process.cwd(), "public", "api", "characters.json");

function loadCharacters(): Character[] {
  const fileContents = readFileSync(charactersFilePath, "utf-8");
  return JSON.parse(fileContents) as Character[];
}

function parseNumberParam(value: string | string[] | undefined, fallback: number) {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.status(405).json({ message: "Metodo nao permitido" });
    return;
  }

  const search = String(req.query.search ?? "").trim().toLowerCase();
  const category = String(req.query.category ?? "").trim();
  const favorites = String(req.query.favorites ?? "").trim();
  const modelsOnly = String(req.query.modelsOnly ?? "") === "true";
  const page = parseNumberParam(req.query.page, 1);
  const limit = parseNumberParam(req.query.limit, 12);

  let filtered = loadCharacters();

  if (search) {
    filtered = filtered.filter((character) =>
      character.name.toLowerCase().includes(search),
    );
  }

  if (category && category !== "all") {
    filtered = filtered.filter((character) => character.category === category);
  }

  if (favorites) {
    const favoriteIds = favorites
      .split(",")
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));
    filtered = filtered.filter((character) => favoriteIds.includes(character.id));
  }

  if (modelsOnly) {
    filtered = filtered.filter((character) => Boolean(character.model3d));
  }

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * limit;
  const items = filtered.slice(start, start + limit);

  const payload: CharactersPageResponse = {
    items,
    totalItems,
    totalPages,
    currentPage,
  };

  res.status(200).json(payload);
}
