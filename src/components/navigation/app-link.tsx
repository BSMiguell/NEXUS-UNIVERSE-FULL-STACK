"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children: ReactNode;
  to: string;
};

type AppNavLinkProps = AppLinkProps & {
  activeClassName?: string;
  inactiveClassName?: string;
};

function isActivePath(pathname: string, to: string) {
  if (to === "/") {
    return pathname === "/";
  }

  return pathname === to;
}

export function AppLink({ children, to, ...props }: AppLinkProps) {
  return (
    <Link href={to} {...props}>
      {children}
    </Link>
  );
}

export function AppNavLink({
  activeClassName = "",
  children,
  className,
  inactiveClassName = "",
  to,
  ...props
}: AppNavLinkProps) {
  const pathname = usePathname() ?? "";
  const isActive = isActivePath(pathname, to);

  return (
    <Link
      className={[className, isActive ? activeClassName : inactiveClassName].filter(Boolean).join(" ")}
      href={to}
      {...props}
    >
      {children}
    </Link>
  );
}
