"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LayoutGrid,
  LogIn,
  LogOut,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  UserPlus,
  Volume2,
  VolumeX,
} from "lucide-react";
import { QuantumAmbience } from "@/components/layout/quantum-ambience";
import { QuantumBackground } from "@/components/layout/quantum-background";
import { QuantumPreloader } from "@/components/layout/quantum-preloader";
import { QuantumSearchDialog } from "@/components/search/quantum-search-dialog";
import { Button } from "@/components/ui/button";
import { QuantumToastRegion } from "@/components/ui/quantum-toast-region";
import { getRuntimeMode } from "@/lib/runtime-env";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";
import { useUIStore } from "@/store/use-ui-store";

const links = [
  { href: "/", icon: LayoutGrid, label: "Galeria" },
  { href: "/favoritos", icon: Heart, label: "Favoritos" },
  { href: "/modelos", icon: Sparkles, label: "Modelos" },
  { href: "/batalha", icon: Swords, label: "Batalha" },
  { href: "/tema", icon: Palette, label: "Tema" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href;
}

export function NextPageLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/";
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const openSearch = useUIStore((state) => state.openSearch);
  const ambienceEnabled = useUIStore((state) => state.ambienceEnabled);
  const toggleAmbience = useUIStore((state) => state.toggleAmbience);
  const pushToast = useUIStore((state) => state.pushToast);
  const [showPreloader, setShowPreloader] = useState(false);

  useEffect(() => {
    if (getRuntimeMode() === "test") {
      return;
    }

    try {
      const shouldShow =
        window.sessionStorage.getItem("nexus-loader-complete") !== "true";
      if (shouldShow) {
        setShowPreloader(true);
      }
    } catch {
      setShowPreloader(false);
    }
  }, []);

  useEffect(() => {
    if (!showPreloader) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowPreloader(false);
      window.sessionStorage.setItem("nexus-loader-complete", "true");
    }, 2100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showPreloader]);

  const handleLogout = () => {
    logout();
    pushToast({
      title: "Sessao encerrada",
      description: "Voce saiu do terminal quantico com seguranca.",
      tone: "info",
    });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <QuantumBackground />
      <QuantumAmbience />
      <QuantumPreloader visible={showPreloader} />
      <QuantumToastRegion />
      <QuantumSearchDialog />
      <div
        className={cn(
          "relative z-10 mx-auto flex min-h-screen max-w-[1800px] flex-col px-4 py-6 sm:px-6 lg:px-8",
          isHome && "pt-3",
        )}
      >
        {!isHome ? (
          <header className="quantum-panel mb-8 rounded-[2rem] p-6">
            <div className="relative flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-3">
                  <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-display text-[11px] uppercase tracking-[0.4em] text-primary">
                    Nexus Universe 10/10
                  </span>
                  <div>
                    <h1 className="font-display text-3xl uppercase tracking-[0.16em] text-white sm:text-4xl">
                      Painel Quantum
                    </h1>
                    <p className="mt-2 max-w-3xl text-sm uppercase tracking-[0.18em] text-muted-foreground sm:text-base">
                      Galeria multiversal em Next.js, preservando a atmosfera sci-fi do projeto.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />
                  <div className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
                    Sistema ativo
                  </div>
                  <Button className="rounded-full" onClick={openSearch} type="button" variant="outline">
                    <Search className="h-4 w-4" />
                    Pesquisa
                  </Button>
                  <Button
                    className="rounded-full"
                    onClick={() => {
                      toggleAmbience();
                      pushToast({
                        title: ambienceEnabled ? "Ambiencia desligada" : "Ambiencia ativada",
                        description: ambienceEnabled
                          ? "O audio atmosferico foi silenciado."
                          : "A trilha atmosferica opcional entrou em modo online.",
                        tone: "info",
                      });
                    }}
                    type="button"
                    variant="outline"
                  >
                    {ambienceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    Audio
                  </Button>
                  {token ? (
                    <>
                      <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100/80">
                        {user?.name || user?.email}
                      </div>
                      <Button className="rounded-full" onClick={handleLogout} type="button" variant="outline">
                        <LogOut className="h-4 w-4" />
                        Sair
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild className="rounded-full" variant="outline">
                        <Link href="/login">
                          <LogIn className="h-4 w-4" />
                          Login
                        </Link>
                      </Button>
                      <Button asChild className="rounded-full">
                        <Link href="/register">
                          <UserPlus className="h-4 w-4" />
                          Registrar
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <nav className="flex flex-wrap gap-3">
                {links.map(({ href, icon: Icon, label }) => (
                  <Link
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition",
                      isActivePath(pathname, href)
                        ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_24px_rgba(45,212,191,0.18)]"
                        : "border-white/10 bg-black/20 text-muted-foreground hover:border-white/20 hover:text-foreground",
                    )}
                    href={href}
                    key={href}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
                {user?.permissions?.canManageUsers ? (
                  <Link
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] transition",
                      isActivePath(pathname, "/admin/users")
                        ? "border-primary/50 bg-primary/15 text-primary shadow-[0_0_24px_rgba(45,212,191,0.18)]"
                        : "border-white/10 bg-black/20 text-muted-foreground hover:border-white/20 hover:text-foreground",
                    )}
                    href="/admin/users"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Acessos
                  </Link>
                ) : null}
              </nav>
            </div>
          </header>
        ) : (
          <div className="mb-4 flex items-center justify-end gap-3">
            <Button
              className="rounded-full border-cyan-300/20 bg-black/35 backdrop-blur-xl"
              onClick={openSearch}
              type="button"
              variant="outline"
            >
              <Search className="h-4 w-4" />
              Pesquisa
            </Button>
            <Button
              className="rounded-full border-cyan-300/20 bg-black/35 backdrop-blur-xl"
              onClick={() => {
                toggleAmbience();
                pushToast({
                  title: ambienceEnabled ? "Ambiencia desligada" : "Ambiencia ativada",
                  description: ambienceEnabled
                    ? "O audio atmosferico foi silenciado."
                    : "A trilha atmosferica opcional entrou em modo online.",
                  tone: "info",
                });
              }}
              type="button"
              variant="outline"
            >
              {ambienceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Audio
            </Button>
            {user?.permissions?.canManageUsers ? (
              <Button
                asChild
                className="rounded-full border-cyan-300/20 bg-black/35 backdrop-blur-xl"
                variant="outline"
              >
                <Link href="/admin/users">
                  <ShieldCheck className="h-4 w-4" />
                  Acessos
                </Link>
              </Button>
            ) : null}
            {token ? (
              <>
                <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100/80">
                  {user?.name || user?.email}
                </div>
                <Button
                  className="rounded-full border-cyan-300/20 bg-black/35 backdrop-blur-xl"
                  onClick={handleLogout}
                  type="button"
                  variant="outline"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  className="rounded-full border-cyan-300/20 bg-black/35 backdrop-blur-xl"
                  variant="outline"
                >
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </Button>
                <Button asChild className="rounded-full">
                  <Link href="/register">
                    <UserPlus className="h-4 w-4" />
                    Registrar
                  </Link>
                </Button>
              </>
            )}
          </div>
        )}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
