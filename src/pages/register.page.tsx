import { NextPageShell } from "@/next-app/next-page-shell";
import { RegisterPageView } from "@/page-views/register-page-view";

export default function NextRegisterRoute() {
  return (
    <NextPageShell>
      <RegisterPageView />
    </NextPageShell>
  );
}
