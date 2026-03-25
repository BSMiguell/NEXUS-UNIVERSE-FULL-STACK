import { useRouter } from "next/router";
import { NextPageShell } from "@/next-app/next-page-shell";
import { CharacterDetailPageView } from "@/page-views/character-detail-page-view";

export default function NextCharacterDetailRoute() {
  const router = useRouter();
  const characterId = Number(router.query.id ?? 0);

  return (
    <NextPageShell>
      <CharacterDetailPageView characterId={characterId} />
    </NextPageShell>
  );
}
