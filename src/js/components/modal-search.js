class QuantumSearch {
  constructor(gallery) {
    this.gallery = gallery;
    this.searchIndex = [];
    this.init();
  }

  init() {
    this.buildSearchIndex();
  }

  buildSearchIndex() {
    this.searchIndex = charactersData.map((character) => ({
      id: character.id,
      name: character.name.toLowerCase(),
      category: character.category,
      image: character.image,
      originalName: character.name,
      description: character.description,
      details: character.details,
    }));
  }

  // Função de similaridade usando Levenshtein Distance
  levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

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

  // Função de similaridade aprimorada
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    // Se a string mais curta estiver contida na mais longa
    if (longer.includes(shorter)) {
      return 0.9;
    }

    // Calcula distância de Levenshtein
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);

    // Retorna similaridade (0-1)
    return 1 - distance / maxLength;
  }

  search(query, limit = 10) {
    if (!query || query.trim() === "") {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    // Primeiro, busca exata ou por substring
    for (const character of this.searchIndex) {
      if (character.name.includes(normalizedQuery)) {
        results.push({
          ...character,
          score: 1.0,
          matchType: "exact",
        });
      }
    }

    // Se não encontrou resultados exatos, busca por similaridade
    if (results.length === 0) {
      for (const character of this.searchIndex) {
        const similarity = this.calculateSimilarity(
          character.name,
          normalizedQuery,
        );

        // Considera apenas similaridades acima de 0.6
        if (similarity > 0.6) {
          results.push({
            ...character,
            score: similarity,
            matchType: "similar",
          });
        }
      }
    }

    // Ordena por score (maior primeiro)
    results.sort((a, b) => b.score - a.score);

    // Remove duplicatas
    const uniqueResults = [];
    const seenIds = new Set();

    for (const result of results) {
      if (!seenIds.has(result.id)) {
        seenIds.add(result.id);
        uniqueResults.push(result);
      }
    }

    return uniqueResults.slice(0, limit);
  }

  // Busca tolerante a erros de digitação
  fuzzySearch(query, limit = 10) {
    if (!query || query.trim() === "") {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    // Tenta diferentes variações da busca
    const variations = [
      normalizedQuery,
      normalizedQuery.replace(/\s+/g, ""), // Remove espaços
      normalizedQuery.replace(/[^a-z0-9]/g, ""), // Remove caracteres especiais
    ];

    for (const variation of variations) {
      const searchResults = this.search(variation, limit);
      results.push(...searchResults);
    }

    // Remove duplicatas e ordena
    const uniqueResults = [];
    const seenIds = new Set();

    for (const result of results) {
      if (!seenIds.has(result.id)) {
        seenIds.add(result.id);
        uniqueResults.push(result);
      }
    }

    return uniqueResults.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}
