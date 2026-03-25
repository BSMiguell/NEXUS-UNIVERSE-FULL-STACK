"use client";

import type { ReactNode } from "react";
import { AppProviders } from "@/app-providers";
import { NextPageLayout } from "@/next-app/next-page-layout";

export function NextPageShell({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <NextPageLayout>{children}</NextPageLayout>
    </AppProviders>
  );
}
