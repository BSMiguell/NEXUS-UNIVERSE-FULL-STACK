import { LoginPageView } from "@/page-views/login-page-view";
import { NextPageShell } from "@/next-app/next-page-shell";

export default function NextLoginRoute() {
  return (
    <NextPageShell>
      <LoginPageView />
    </NextPageShell>
  );
}
