import { beforeEach, describe, expect, it } from "vitest";
import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/use-auth-store";
import { useFavoritesStore } from "@/store/use-favorites-store";
import { useGalleryStore } from "@/store/use-gallery-store";
import { useUIStore } from "@/store/use-ui-store";

describe("Authentication store flow", () => {
  beforeEach(() => {
    localStorage.clear();
    queryClient.clear();
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
    useUIStore.setState({
      isSearchOpen: false,
      toasts: [],
    });
    useGalleryStore.getState().resetFilters();
  });

  it("registers a new user and hydrates auth state", async () => {
    await useAuthStore.getState().register({
      name: "Bruno",
      email: "bruno@example.com",
      password: "123456",
    });

    const { token, user } = useAuthStore.getState();
    expect(token).toBe("mock-register-token");
    expect(user?.name).toBe("Bruno");
    expect(user?.role).toBe("admin");
  });

  it("logs in and keeps favorites flow available", async () => {
    await useAuthStore.getState().login({
      email: "mock@example.com",
      password: "123456",
    });

    const { token, user } = useAuthStore.getState();
    expect(token).toBe("mock-login-token");
    expect(user?.name).toBe("Mock User");
  });
});
