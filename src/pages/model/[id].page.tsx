import { useRouter } from "next/router";
import { NextPageShell } from "@/next-app/next-page-shell";
import { ModelViewerPage } from "@/pages/model-viewer-page";

export default function NextModelViewerAliasRoute() {
  const router = useRouter();
  const characterId = Number(router.query.id ?? 0);

  return (
    <NextPageShell>
      <ModelViewerPage characterIdParam={characterId} />
    </NextPageShell>
  );
}
