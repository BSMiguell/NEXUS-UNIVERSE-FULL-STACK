import { ProtectedRoute } from "@/components/auth/protected-route";
import { NextPageShell } from "@/next-app/next-page-shell";
import { FavoritesPageView } from "@/page-views/favorites-page-view";

export default function NextFavoritesRoute() {
  return (
    <NextPageShell>
      <ProtectedRoute>
        <FavoritesPageView />
      </ProtectedRoute>
    </NextPageShell>
  );
}
