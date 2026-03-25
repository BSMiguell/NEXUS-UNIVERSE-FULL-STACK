import dynamic from "next/dynamic";
import { NextPageShell } from "@/next-app/next-page-shell";

const Battle2DPage = dynamic(
  () => import("@/pages/battle-2d-page").then((module) => module.Battle2DPage),
  { ssr: false },
);

export default function NextBattle2DRoute() {
  return (
    <NextPageShell>
      <Battle2DPage />
    </NextPageShell>
  );
}
