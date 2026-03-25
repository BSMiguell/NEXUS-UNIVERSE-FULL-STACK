import { useRouter } from "next/router";
import { useAuthStore } from "@/store/use-auth-store";
import type { AuthPermission, AuthRole } from "@/types/auth";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredPermission?: AuthPermission;
  requiredRole?: AuthRole;
};

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
}: ProtectedRouteProps) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const isAuthReady = useAuthStore((state) => state.isAuthReady);
  const hasUserContext = Boolean(user);
  const resolvedUser = user ?? undefined;

  const missingToken = isAuthReady && !token;
  const waitingUserContext = isAuthReady && Boolean(token) && !hasUserContext;
  const missingRole = Boolean(
    hasUserContext && requiredRole && resolvedUser?.role !== requiredRole,
  );
  const missingPermission = Boolean(
    hasUserContext
      && requiredPermission
      && !resolvedUser?.permissions?.[requiredPermission],
  );

  if (!isAuthReady) {
    return null;
  }

  if (waitingUserContext) {
    return null;
  }

  if (missingToken) {
    void router.replace("/login");
    return null;
  }

  if (missingRole) {
    void router.replace("/");
    return null;
  }

  if (missingPermission) {
    void router.replace("/");
    return null;
  }

  return <>{children}</>;
}
