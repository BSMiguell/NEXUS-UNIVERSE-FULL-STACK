import { HomePageView } from "@/page-views/home-page-view";
import { NextPageShell } from "@/next-app/next-page-shell";

export default function NextHomeRoute() {
  return (
    <NextPageShell>
      <HomePageView />
    </NextPageShell>
  );
}
