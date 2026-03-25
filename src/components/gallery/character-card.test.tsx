import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CharacterCard } from "@/components/gallery/character-card";
import { useAuthStore } from "@/store/use-auth-store";
import { useFavoritesStore } from "@/store/use-favorites-store";
import type { Character } from "@/types/character";

const mockCharacter: Character = {
  id: 7,
  name: "Goku",
  category: "Dragon Ball",
  image: "/assets/images/Dragon-Ball/Goku-1.png",
  description: "Um guerreiro saiyajin pronto para proteger o universo.",
  model3d: "/assets/models/goku.glb",
  details: {
    universo: "Dragon Ball",
  },
  stats: {
    forca: 100,
    velocidade: 98,
    defesa: 92,
    energia: 100,
    habilidade: 95,
  },
};

function renderCharacterCard() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CharacterCard character={mockCharacter} />
    </QueryClientProvider>,
  );
}

describe("CharacterCard", () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: "test-token",
      user: {
        id: 1,
        name: "Tester",
        email: "tester@example.com",
        role: "admin",
        isActive: true,
        permissions: {
          canManageCharacters: true,
          canManageUsers: true,
        },
      },
      isAuthReady: true,
    });

    useFavoritesStore.setState({
      favoriteIds: new Set(),
      favoritesOrder: [],
      sort: "added-desc",
      isLoading: false,
    });
  });

  it("renders the character name", () => {
    renderCharacterCard();

    expect(screen.getByText("Goku")).toBeInTheDocument();
  });

  it("renders the character image with the correct source and alt text", () => {
    renderCharacterCard();

    const image = screen.getByAltText("Imagem de Goku");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", mockCharacter.image);
  });
});
