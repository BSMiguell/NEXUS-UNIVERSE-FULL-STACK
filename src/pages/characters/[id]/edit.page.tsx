import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { NextPageShell } from "@/next-app/next-page-shell";
import { CharacterFormPage } from "@/pages/character-form-page";

export default function NextCharacterEditRoute() {
  const router = useRouter();
  const characterId = Number(router.query.id ?? 0);

  return (
    <NextPageShell>
      <ProtectedRoute requiredPermission="canManageCharacters">
        <CharacterFormPage characterIdParam={characterId} isEditingParam />
      </ProtectedRoute>
    </NextPageShell>
  );
}
