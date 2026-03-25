import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { FuzzySearch } from "@/components/search/fuzzy-search";
import { useAuthStore } from "@/store/use-auth-store";
import { useFavoritesStore } from "@/store/use-favorites-store";
import { useGalleryStore } from "@/store/use-gallery-store";

function renderSearchExperience() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <FuzzySearch />
    </QueryClientProvider>,
  );
}

describe("Search experience", () => {
  beforeEach(() => {
    useGalleryStore.getState().resetFilters();
    useAuthStore.setState({
      token: null,
      user: null,
      isAuthReady: true,
    });
    useFavoritesStore.setState({
      favoriteIds: new Set(),
      favoritesOrder: [],
      sort: "added-desc",
      isLoading: false,
    });
  });

  it("shows only matching characters when the user searches", async () => {
    const user = userEvent.setup();
    renderSearchExperience();

    const searchInput = screen.getByPlaceholderText(/buscar personagem no multiverso/i);

    await user.type(searchInput, "Goku");

    expect(await screen.findByText("Goku")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText("Vegeta")).not.toBeInTheDocument();
      expect(screen.queryByText("Luffy")).not.toBeInTheDocument();
    });
  }, 10000);
});
