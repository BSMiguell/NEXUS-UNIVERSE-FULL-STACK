import dynamic from "next/dynamic";
import { NextPageShell } from "@/next-app/next-page-shell";

const BattlePage = dynamic(
  () => import("@/pages/battle-page").then((module) => module.BattlePage),
  { ssr: false },
);

export default function NextBattleRoute() {
  return (
    <NextPageShell>
      <BattlePage />
    </NextPageShell>
  );
}
