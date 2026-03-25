import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { CharacterHeader } from "./character-header";
import { useAuthStore } from "@/store/use-auth-store";
import { useFavoritesStore } from "@/store/use-favorites-store";
import type { Character } from "@/types/character";

const mockCharacter: Character = {
  id: 1,
  name: "Quantum Knight",
  description: "A valiant warrior from a distant galaxy.",
  category: "Cosmic Hero",
  image: "/path/to/image.jpg",
  model3d: "knight.glb",
  stats: { forca: 80, velocidade: 70, defesa: 90, energia: 60, habilidade: 85 },
  details: { altura: "1.85m", peso: "95kg", universo: "Nexus-7" },
};

function renderHeader() {
  return render(<CharacterHeader character={mockCharacter} />);
}

describe("CharacterHeader", () => {
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

  it("renders the current character information correctly", () => {
    renderHeader();

    expect(screen.getByText("Quantum Knight")).toBeInTheDocument();
    expect(screen.getByText("Cosmic Hero")).toBeInTheDocument();
    expect(screen.getByAltText("Imagem de Quantum Knight")).toBeInTheDocument();
  });

  it("renders the favorite action button", () => {
    renderHeader();

    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
