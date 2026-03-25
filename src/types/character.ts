export type CharacterStats = {
  forca: number;
  velocidade: number;
  defesa: number;
  energia: number;
  habilidade: number;
};

export type CharacterDetails = Record<string, string | number | undefined>;

export type Character = {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
  model3d?: string;
  details: CharacterDetails;
  stats: CharacterStats;
};

export type CharacterInput = Omit<Character, "id">;

export type CharactersPage = {
  items: Character[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
};
