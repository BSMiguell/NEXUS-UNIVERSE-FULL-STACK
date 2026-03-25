import { useRouter } from "next/router";
import { NextPageShell } from "@/next-app/next-page-shell";
import { ModelsPageView } from "@/page-views/models-page-view";

export default function NextModelsRoute() {
  const router = useRouter();
  const focusedCharacterId = Number(router.query.personagem ?? 0);

  return (
    <NextPageShell>
      <ModelsPageView focusedCharacterId={focusedCharacterId} />
    </NextPageShell>
  );
}
