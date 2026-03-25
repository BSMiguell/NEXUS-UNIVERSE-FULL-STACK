import { useRouter } from "next/router";
import { ModelsPageView } from "@/page-views/models-page-view";

export function ModelsPage() {
  const router = useRouter();
  const focusedCharacterId = Number(router.query.personagem ?? 0);
  return <ModelsPageView focusedCharacterId={focusedCharacterId} />;
}
