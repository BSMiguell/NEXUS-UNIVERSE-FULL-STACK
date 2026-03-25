import { useMemo } from "react";
import type { Character } from "@/types/character";

// Helper para normalizar texto (removendo acentos e etc.)
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// 1. Tipagem dos resultados da busca
interface SearchResult extends Character {
  score: number;
}

// 2. Funções de cálculo de similaridade (adaptadas do legado)
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function calculateSimilarity(source: string, query: string): number {
  if (source.includes(query)) return 0.95; // Prioridade alta para substrings
  const distance = levenshteinDistance(source, query);
  const maxLength = Math.max(source.length, query.length);
  if (maxLength === 0) return 1;
  return 1 - distance / maxLength;
}

// 3. O Hook customizado
export function useFuzzySearch(
  charactersData: Character[],
  query: string,
  limit = 24,
) {
  // 4. Memoização do índice de busca para performance
  const searchIndex = useMemo(() => {
    return charactersData.map((character: Character) => ({
      ...character,
      // Criamos um "super campo" de busca normalizado
      searchableString: normalize(
        [
          character.name,
          character.category,
          character.description,
          ...Object.values(character.details),
        ].join(" "),
      ),
    }));
  }, [charactersData]);

  // 5. Memoização dos resultados da busca
  const searchResults = useMemo(() => {
    if (!query || query.trim() === "") {
      return charactersData.map((c: Character) => ({ ...c, score: 1 })); // Retorna todos se a busca for vazia
    }

    const normalizedQuery = normalize(query);
    const results: SearchResult[] = [];

    for (const character of searchIndex) {
      const similarity = calculateSimilarity(
        character.searchableString,
        normalizedQuery,
      );

      // Aumentamos o threshold para melhorar a relevância
      if (similarity > 0.7) {
        results.push({
          ...character,
          score: similarity,
        });
      }
    }

    // Ordena por score
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }, [charactersData, query, searchIndex, limit]);

  return searchResults;
}
