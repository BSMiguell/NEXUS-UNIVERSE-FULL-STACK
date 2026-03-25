import { useRouter } from "next/router";
import { CharacterDetailPageView } from "@/page-views/character-detail-page-view";

export function CharacterDetailPage() {
  const router = useRouter();
  const characterId = Number(router.query.id ?? 0);
  return <CharacterDetailPageView characterId={characterId} />;
}
