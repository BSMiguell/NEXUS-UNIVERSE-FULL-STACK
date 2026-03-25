import { AdminUsersPage } from "@/pages/admin-users-page";
import { NextPageShell } from "@/next-app/next-page-shell";

export default function NextAdminUsersRoute() {
  return (
    <NextPageShell>
      <AdminUsersPage />
    </NextPageShell>
  );
}
