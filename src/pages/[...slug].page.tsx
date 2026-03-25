import Link from "next/link";
import { NextPageShell } from "@/next-app/next-page-shell";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, Navigation } from "lucide-react";

export default function CatchAllPage() {
  return (
    <NextPageShell>
      <section className="quantum-panel mx-auto flex min-h-[52vh] w-full max-w-3xl flex-col items-center justify-center gap-6 rounded-[2.4rem] p-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-black uppercase tracking-[0.12em] text-white">
            Rota nao mapeada
          </h1>
          <p className="mt-3 text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Esta rota ainda nao foi migrada para o Next ou nao existe.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-[1.1rem] px-5" variant="outline">
            <Link href="/">
              <Home className="h-4 w-4" />
              Voltar para galeria
            </Link>
          </Button>
          <Button asChild className="rounded-[1.1rem] px-5">
            <Link href="/login">
              <Navigation className="h-4 w-4" />
              Ir para login
            </Link>
          </Button>
        </div>
      </section>
    </NextPageShell>
  );
}
