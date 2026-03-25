import { type ReactNode, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, Command, Play, Radar, Telescope, Zap } from "lucide-react";
import { AppLink } from "@/components/navigation/app-link";
import { Loading3D } from "@/components/3d/loading-3d";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/use-ui-store";

type HeroSectionProps = {
  totalResults: number;
};

export function HeroSection({ totalResults }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const openSearch = useUIStore((state) => state.openSearch);
  const pushToast = useUIStore((state) => state.pushToast);
  const baseFlux = Math.max(totalResults * 3 + 184, 1184);
  const subtitleLines = useMemo(
    () => [
      "OBSERVATORIO COSMICO PARA PERSONAGENS LENDARIOS",
      "GALERIA CINEMATICA COM PROFUNDIDADE E ORBITAS",
      "BUSCA TATICA, COLECOES VIVAS E CENAS 3D",
      "UMA INTERFACE COM GRAVIDADE PROPRIA",
    ],
    [],
  );
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fluxValue, setFluxValue] = useState(baseFlux);
  const Hero3DCore = dynamic(
    () => import("@/components/home/hero-3d-core").then((module) => module.Hero3DCore),
    {
      ssr: false,
      loading: () => <Loading3D className="h-full w-full" label="Carregando observatorio 3D..." />,
    },
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      setLineIndex(0);
      setCharIndex(subtitleLines[0]?.length ?? 0);
      setIsDeleting(false);
      return;
    }

    const currentLine = subtitleLines[lineIndex] ?? "";
    const finishedTyping = !isDeleting && charIndex === currentLine.length;
    const finishedDeleting = isDeleting && charIndex === 0;
    const timeout = window.setTimeout(
      () => {
        if (finishedTyping) {
          setIsDeleting(true);
          return;
        }

        if (finishedDeleting) {
          setIsDeleting(false);
          setLineIndex((previous) => (previous + 1) % subtitleLines.length);
          return;
        }

        setCharIndex((previous) => previous + (isDeleting ? -1 : 1));
      },
      finishedTyping ? 1800 : finishedDeleting ? 450 : isDeleting ? 35 : 75,
    );

    return () => window.clearTimeout(timeout);
  }, [charIndex, isDeleting, lineIndex, prefersReducedMotion, subtitleLines]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setFluxValue(baseFlux);
      return;
    }

    const interval = window.setInterval(() => {
      const offset = Math.floor(Math.random() * 48);
      setFluxValue(baseFlux + offset);
    }, 1800);

    return () => window.clearInterval(interval);
  }, [baseFlux, prefersReducedMotion]);

  const currentLine = subtitleLines[lineIndex] ?? "";
  const typedSubtitle = currentLine.slice(0, charIndex);
  const fluxDisplay = String(fluxValue);

  return (
    <header className="cosmos-hero-shell quantum-panel relative overflow-hidden rounded-[2.3rem] px-5 py-6 sm:rounded-[2.8rem] sm:px-8 sm:py-8 lg:px-12 lg:py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2.8rem]">
        <div className="cosmos-starfield absolute inset-0" />
        <div className="quantum-hero-grid absolute inset-0 opacity-35" />
        <div className="quantum-hero-noise absolute inset-0 opacity-40" />
        <div className="cosmos-aurora absolute inset-0" />
        <div className="absolute inset-y-0 left-[10%] w-px bg-gradient-to-b from-transparent via-cyan-200/35 to-transparent" />
        <div className="absolute inset-y-0 right-[12%] w-px bg-gradient-to-b from-transparent via-amber-200/20 to-transparent" />
        <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 grid min-h-[auto] items-center gap-8 sm:gap-10 xl:min-h-[78vh] xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 self-start rounded-full border border-cyan-200/20 bg-white/5 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/80 shadow-[0_0_24px_rgba(56,189,248,0.08)] backdrop-blur-xl sm:px-5 sm:py-3 sm:text-[11px] sm:tracking-[0.32em]">
            <Zap className="h-4 w-4 text-amber-300" />
            Redesign Espaco e Universo em andamento
          </div>

          <div className="max-w-4xl space-y-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.42em] text-cyan-100/55">
              Capitulo I . Entrada em orbita
            </div>
            <h1 className="font-display text-[2.85rem] font-black uppercase leading-[0.92] tracking-[0.02em] text-white sm:text-6xl sm:leading-[0.88] sm:tracking-[0.03em] xl:text-[6.8rem]">
              <span className="block">O multiverso</span>
              <span className="cosmos-title block">ganhou horizonte</span>
            </h1>
            <p className="max-w-2xl text-[0.98rem] leading-7 text-slate-200/82 sm:text-lg sm:leading-8">
              Uma home pensada como observatorio narrativo: brilho controlado, atmosfera de neblina, profundidade 3D e
              uma galeria que parece viva em vez de apenas exibida.
            </p>
          </div>

          <div className="quantum-typing-shell rounded-[1.4rem] border border-white/10 bg-[rgba(8,22,34,0.34)] px-4 py-3 sm:rounded-[1.6rem] sm:px-5 sm:py-4">
            <div className="quantum-typing-line min-h-[2.8rem] text-sm font-semibold uppercase tracking-[0.15em] text-slate-100/88 sm:min-h-[2rem] sm:text-xl sm:tracking-[0.18em]">
              {typedSubtitle}
              {prefersReducedMotion ? null : <span className="ml-1 inline-block h-6 w-[2px] animate-pulse bg-cyan-300 align-middle" />}
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
            <MetricCard copy="Sinais ativos no radar" label="Fluxo astral" value={fluxDisplay} />
            <MetricCard copy="Perfis na constelacao principal" label="Entidades" value={String(totalResults)} />
            <MetricCard copy="Direcao visual em alta energia" label="Presenca" value="11/10" />
          </div>

          <div className="grid gap-3 sm:flex sm:flex-wrap sm:gap-5">
            <Button className="cosmos-primary-cta h-14 w-full gap-2 rounded-[1.2rem] px-6 text-sm font-bold sm:w-auto sm:px-8" onClick={openSearch} size="lg">
              Explorar constelacao
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button asChild className="cosmos-secondary-cta h-14 w-full gap-2 rounded-[1.2rem] px-6 text-sm font-bold sm:w-auto sm:px-8" size="lg" variant="outline">
              <AppLink to="#hangar-galeria">
                <Telescope className="h-5 w-5" />
                Ver hangar
              </AppLink>
            </Button>
            <Button
              className="cosmos-secondary-cta h-14 w-full gap-2 rounded-[1.2rem] px-6 text-sm font-bold sm:w-auto sm:px-8"
              onClick={() =>
                pushToast({
                  title: "Transmissao em breve",
                  description: "A experiencia de trailer ainda vai ganhar uma cena dedicada nesta nova fase.",
                  tone: "info",
                })
              }
              size="lg"
              variant="outline"
            >
              <Play className="h-5 w-5 fill-current" />
              Ouvir transmissao
            </Button>
          </div>

          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <SideNote icon={<Radar className="h-4 w-4 text-cyan-200" />}>
              O foco agora e transformar a home em uma jornada de orbita ate conversao.
            </SideNote>
            <SideNote icon={<Command className="h-4 w-4 text-amber-200" />}>
              Busca, filtros e galeria continuam operacionais dentro da nova narrativa.
            </SideNote>
          </div>
        </div>

        <div className="relative hidden min-h-[34rem] xl:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="cosmos-observatory-frame">
              <Hero3DCore />
              <div className="cosmos-observatory-glow" />
              <div className="cosmos-orbit-ring cosmos-orbit-ring-a" />
              <div className="cosmos-orbit-ring cosmos-orbit-ring-b" />
              <div className="cosmos-orbit-ring cosmos-orbit-ring-c" />
              <div className="cosmos-signal-node cosmos-signal-node-a" />
              <div className="cosmos-signal-node cosmos-signal-node-b" />
              <div className="cosmos-signal-node cosmos-signal-node-c" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
        <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/60 sm:text-[11px] sm:tracking-[0.34em]">
          <Command className="h-4 w-4" />
          Deslizar para atravessar capitulos
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-100/60 sm:text-[11px] sm:tracking-[0.34em]">
          <span>Scroll</span>
          <ArrowDown className={prefersReducedMotion ? "h-4 w-4" : "h-4 w-4 animate-bounce"} />
        </div>
      </div>
    </header>
  );
}

function MetricCard({
  copy,
  label,
  value,
}: {
  copy: string;
  label: string;
  value: string;
}) {
  return (
    <div className="cosmos-metric-card">
      <div className="cosmos-metric-label">{label}</div>
      <div className="cosmos-metric-value">{value}</div>
      <div className="cosmos-metric-copy">{copy}</div>
    </div>
  );
}

function SideNote({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div className="cosmos-side-note">
      {icon}
      <span>{children}</span>
    </div>
  );
}
