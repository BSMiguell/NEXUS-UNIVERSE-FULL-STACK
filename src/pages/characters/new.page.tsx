import { ProtectedRoute } from "@/components/auth/protected-route";
import { NextPageShell } from "@/next-app/next-page-shell";
import { CharacterFormPage } from "@/pages/character-form-page";

export default function NextCharacterCreateRoute() {
  return (
    <NextPageShell>
      <ProtectedRoute requiredPermission="canManageCharacters">
        <CharacterFormPage isEditingParam={false} />
      </ProtectedRoute>
    </NextPageShell>
  );
}
