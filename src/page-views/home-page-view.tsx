import { Interactive3D } from "@/components/3d/interactive-3d";
import { CharacterCard } from "@/components/gallery/character-card";
import { FiltersBar } from "@/components/gallery/filters-bar";
import { HeroSection } from "@/components/home/hero-section";
import { AppLink, AppNavLink } from "@/components/navigation/app-link";
import { Button } from "@/components/ui/button";
import { useCharactersPageQuery } from "@/hooks/use-characters-query";
import { useDebounce } from "@/hooks/use-debounce";
import { useFilteredCharacters } from "@/hooks/use-filtered-characters";
import { useAuthStore } from "@/store/use-auth-store";
import { useGalleryStore } from "@/store/use-gallery-store";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Binary,
  Compass,
  Cpu,
  Eye,
  Heart,
  Orbit,
  Palette,
  Plus,
  Radar,
  Satellite,
  ShieldCheck,
  Sparkles,
  Stars,
  Swords,
  UserRound,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

export function HomePageView() {
  const prefersReducedMotion = useReducedMotion();
  const search = useGalleryStore(state => state.search);
  const category = useGalleryStore(state => state.category);
  const debouncedSearch = useDebounce(search, 300);
  const user = useAuthStore(state => state.user);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const { data, isLoading, isFetching } = useCharactersPageQuery(currentPage, pageSize, {
    search: debouncedSearch,
    category: category === "all" ? undefined : category,
  });
  const parentRef = useRef<HTMLDivElement>(null);
  const { characters } = useFilteredCharacters(data?.items ?? []);
  const totalResults = data?.totalItems ?? 0;
  const totalPages = data?.totalPages ?? 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, category]);

  useEffect(() => {
    if (data && currentPage > data.totalPages) {
      setCurrentPage(Math.max(data.totalPages, 1));
    }
  }, [currentPage, data]);

  const jumpToPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
    parentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="space-y-8 pb-12">
      <HeroSection totalResults={totalResults} />

      <SectionReveal delay={0.04}>
        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="cosmos-story-panel">
            <div className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-100/55">
              Missao
            </div>
            <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-white sm:text-5xl">
              Uma home que parece uma viagem, nao um catalogo
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300/82">
              O redesign transforma a entrada do Nexus Universe em um observatorio narrativo:
              abertura heroica, secoes com ritmo, profundidade visual e uma area de galeria que
              continua util para quem quer navegar rapido.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <StorySignal
                icon={<Compass className="h-5 w-5" />}
                label="Narrativa"
                value="Capitulos com progressao visual"
              />
              <StorySignal
                icon={<Orbit className="h-5 w-5" />}
                label="Movimento"
                value="Orbita lenta, brilho contido e profundidade"
              />
              <StorySignal
                icon={<ShieldCheck className="h-5 w-5" />}
                label="Base"
                value="Busca, filtros e galeria preservados"
              />
              <StorySignal
                icon={<Palette className="h-5 w-5" />}
                label="Atmosfera"
                value="Noite profunda, cobre estelar e gelo neon"
              />
            </div>
          </article>

          <article className="cosmos-story-panel">
            <div className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-100/55">
              Tecnologia
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <StatusCell label="Status" value="Em orbita" />
              <StatusCell label="Home" value="Redesignando" />
              <StatusCell label="Proxima fase" value="Polimento" />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <FeatureStrip
                icon={<Stars className="h-5 w-5" />}
                title="Missao com atmosfera"
                copy="Abertura de alto impacto, com camadas de luz e leitura mais cinematica."
              />
              <FeatureStrip
                icon={<Cpu className="h-5 w-5" />}
                title="Tecnologia visivel"
                copy="3D e motion deixam de ser efeito solto e passam a fazer parte da narrativa."
              />
              <FeatureStrip
                icon={<Heart className="h-5 w-5" />}
                title="Provas com alma"
                copy="Metricas, sinais e orbitas substituem blocos frios de informacao."
              />
              <FeatureStrip
                icon={<Radar className="h-5 w-5" />}
                title="CTA orientado"
                copy="A home empurra para exploracao, descoberta e conversao sem parecer anuncio."
              />
            </div>
          </article>
        </section>
      </SectionReveal>

      <SectionReveal delay={0.08}>
        <nav className="flex flex-wrap gap-3" aria-label="Atalhos principais da Home">
          <HomeShortcut icon={<UserRound className="h-4 w-4" />} label="Galeria" to="/" />
          <HomeShortcut icon={<Heart className="h-4 w-4" />} label="Favoritos" to="/favoritos" />
          <HomeShortcut icon={<Sparkles className="h-4 w-4" />} label="Modelos" to="/modelos" />
          <HomeShortcut icon={<Swords className="h-4 w-4" />} label="Batalha" to="/batalha" />
          <HomeShortcut icon={<Palette className="h-4 w-4" />} label="Tema" to="/tema" />
        </nav>
      </SectionReveal>

      <SectionReveal delay={0.12}>
        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="cosmos-command-panel">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
                  Hangar
                </div>
                <div>
                  <h2 className="font-display text-3xl uppercase tracking-[0.12em] text-foreground">
                    Navegacao quantica com base operacional
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    A home combina observatorio, filtros taticos, telemetria de presenca e acesso
                    rapido para as principais rotas do universo.
                  </p>
                </div>
              </div>

              {user?.permissions?.canManageCharacters ? (
                <Button
                  asChild
                  className="h-12 rounded-[1.1rem] px-5 shadow-[0_0_30px_rgba(45,212,191,0.18)]"
                >
                  <AppLink to="/characters/new">
                    <Plus className="h-4 w-4" />
                    Novo personagem
                  </AppLink>
                </Button>
              ) : null}
            </div>
          </article>

          <article className="cosmos-command-panel">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatusCell label="Status" value="Ativo" />
              <StatusCell label="Energia" value="100%" />
              <StatusCell label="Frequencia" value="01" />
            </div>
          </article>
        </section>
      </SectionReveal>

      <SectionReveal delay={0.16}>
        <FiltersBar totalResults={totalResults} />
      </SectionReveal>

      <SectionReveal delay={0.2}>
        <section className="quantum-dashboard-grid">
          <DashboardNode
            icon={<UserRound className="h-7 w-7" />}
            label="Entidades"
            value={String(totalResults)}
          />
          <DashboardNode
            icon={<Eye className="h-7 w-7" />}
            label="Observando agora"
            value={String(characters.length)}
          />
          <DashboardNode
            icon={<Binary className="h-7 w-7" />}
            label="Dimensoes"
            value={String(category === "all" ? "13+" : "01")}
          />
          <DashboardNode
            icon={<Satellite className="h-7 w-7" />}
            label="Frequencia atual"
            value="01"
          />
        </section>
      </SectionReveal>

      <SectionReveal delay={0.24}>
        <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <article className="cosmos-story-panel">
            <div className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-100/55">
              Provas
            </div>
            <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-white">
              Orbitas de confianca
            </h2>
            <div className="mt-6 grid gap-4">
              <ProofOrbit
                author="Arquivo Prime"
                title="Visual com gravidade"
                quote="A entrada agora parece uma cena de abertura, nao um conjunto solto de modulos."
              />
              <ProofOrbit
                author="Radar Tatico"
                title="Navegacao mais clara"
                quote="As secoes contam uma historia, mas o usuario ainda encontra filtros e atalhos rapido."
              />
              <ProofOrbit
                author="Estacao Alpha"
                title="Tecnologia integrada"
                quote="3D, glow e motion deixaram de ser enfeite e passaram a sustentar a identidade."
              />
            </div>
          </article>

          <article className="cosmos-story-panel">
            <div className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-100/55">
              Roadmap
            </div>
            <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-white">
              Constelacao de entrega
            </h2>
            <div className="mt-6 space-y-5">
              <RoadmapStop phase="Fase 0-2" status="feito agora" title="Direcao visual e atmosfera">
                Hero cosmico, paineis narrativos, linguagem estelar e sistema inicial de
                superficies.
              </RoadmapStop>
              <RoadmapStop
                phase="Fase 3"
                status="feito agora"
                title="Arquitetura narrativa da home"
              >
                Missao, tecnologia, provas, roadmap e CTA para o hangar convivendo com a galeria
                real do produto.
              </RoadmapStop>
              <RoadmapStop phase="Fase 4-6" status="proximo" title="Refino de motion e 3D">
                Expandir cenas orbitais, hover com mais profundidade e ajustes finos de ritmo
                visual.
              </RoadmapStop>
              <RoadmapStop phase="Fase 7-8" status="proximo" title="QA, performance e polimento">
                Checagem de build, responsividade, reduced motion e consistencia visual geral.
              </RoadmapStop>
            </div>
          </article>
        </section>
      </SectionReveal>

      <SectionReveal delay={0.28}>
        <div
          id="hangar-galeria"
          ref={parentRef}
          className="quantum-panel rounded-[2.2rem] p-4 sm:p-5"
        >
          <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-100/55">
                CTA Final
              </div>
              <h2 className="mt-3 font-display text-4xl uppercase tracking-[0.08em] text-white">
                Galeria em orbita ativa
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300/72">
                A parte util do produto continua aqui: filtros, cards, paginacao e descoberta real
                dos personagens.
              </p>
            </div>
            <AppLink
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-200/80 transition hover:text-cyan-100"
              to="/modelos"
            >
              Ir para modelos
              <ArrowRight className="h-4 w-4" />
            </AppLink>
          </div>

          <div className="home-grid-shell rounded-[1.6rem] p-3 sm:p-4">
            {characters.length > 0 ? (
              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentPage}-${debouncedSearch}-${category}`}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: -18, filter: "blur(8px)" }
                    }
                    initial={
                      prefersReducedMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 18, filter: "blur(8px)" }
                    }
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                  >
                    {characters.map((character, itemIndex) => (
                      <CharacterCard
                        animationIndex={itemIndex}
                        character={character}
                        key={character.id}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                <QuantumPagination
                  currentPage={currentPage}
                  isBusy={isFetching}
                  onPageChange={jumpToPage}
                  totalPages={totalPages}
                />
              </div>
            ) : isLoading ? (
              <div className="flex min-h-[32rem] items-center justify-center rounded-[2rem] border border-white/10 bg-black/20 p-12 text-center">
                <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                  Carregando personagens...
                </div>
              </div>
            ) : (
              <div className="flex min-h-[32rem] items-center justify-center rounded-[2rem] border border-dashed border-white/15 bg-black/20 p-12 text-center text-muted-foreground">
                <div>
                  <p className="text-xl">Nenhum personagem encontrado.</p>
                  <p className="mt-2">Tente ajustar seus filtros de busca.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionReveal>
    </main>
  );
}

function SectionReveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function QuantumPagination({
  currentPage,
  isBusy,
  onPageChange,
  totalPages,
}: {
  currentPage: number;
  isBusy: boolean;
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  return (
    <nav className="quantum-pagination-react" aria-label="Navegacao de paginas">
      <button
        className="pagination-quantum-react"
        disabled={currentPage === 1 || isBusy}
        onClick={() => onPageChange(1)}
        type="button"
      >
        Realidade zero
      </button>
      <button
        className="pagination-quantum-react"
        disabled={currentPage === 1 || isBusy}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        Anterior
      </button>
      <div className="pagination-terminal-react">
        <div className="pagination-label-react">Navegacao quantica</div>
        <div className="pagination-display-react">
          Frequencia <span>{currentPage}</span> de <span>{totalPages}</span>
        </div>
      </div>
      <button
        className="pagination-quantum-react"
        disabled={currentPage >= totalPages || isBusy}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        Proxima
      </button>
      <button
        className="pagination-quantum-react"
        disabled={currentPage >= totalPages || isBusy}
        onClick={() => onPageChange(totalPages)}
        type="button"
      >
        Limite quantico
      </button>
    </nav>
  );
}

function DashboardNode({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Interactive3D>
      <article className="quantum-dashboard-node">
        <div className="quantum-dashboard-icon">{icon}</div>
        <div className="quantum-dashboard-value">{value}</div>
        <div className="quantum-dashboard-label">{label}</div>
      </article>
    </Interactive3D>
  );
}

function FeatureStrip({ copy, icon, title }: { copy: string; icon: ReactNode; title: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-xl uppercase tracking-[0.08em] text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-300/72">{copy}</p>
    </div>
  );
}

function HomeShortcut({ icon, label, to }: { icon: ReactNode; label: string; to: string }) {
  return (
    <Interactive3D className="inline-flex" maxTilt={6}>
      <AppNavLink
        activeClassName="is-active border-primary/50 bg-primary/15 text-primary shadow-[0_0_24px_rgba(45,212,191,0.18)]"
        className="home-shortcut inline-flex min-h-11 items-center gap-2 rounded-full border px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition"
        inactiveClassName="border-border/70 bg-card/45 text-muted-foreground hover:border-white/20 hover:text-foreground"
        to={to}
      >
        {icon}
        {label}
      </AppNavLink>
    </Interactive3D>
  );
}

function ProofOrbit({ author, quote, title }: { author: string; quote: string; title: string }) {
  return (
    <div className="cosmos-proof-orbit">
      <div className="text-[11px] font-bold uppercase tracking-[0.34em] text-cyan-100/50">
        {author}
      </div>
      <div className="mt-3 font-display text-2xl uppercase tracking-[0.08em] text-white">
        {title}
      </div>
      <p className="mt-3 text-sm leading-7 text-slate-300/78">{quote}</p>
    </div>
  );
}

function RoadmapStop({
  children,
  phase,
  status,
  title,
}: {
  children: ReactNode;
  phase: string;
  status: string;
  title: string;
}) {
  return (
    <div className="cosmos-roadmap-stop">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-100/55">
          {phase}
        </span>
        <span className="rounded-full border border-amber-200/15 bg-amber-200/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.28em] text-amber-100/78">
          {status}
        </span>
      </div>
      <div className="mt-3 font-display text-2xl uppercase tracking-[0.06em] text-white">
        {title}
      </div>
      <p className="mt-2 text-sm leading-7 text-slate-300/74">{children}</p>
    </div>
  );
}

function StatusCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-border/70 bg-card/50 p-4">
      <div className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/70">{label}</div>
      <div className="mt-2 font-display text-3xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function StorySignal({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="cosmos-signal-card">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
        {icon}
      </div>
      <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.32em] text-cyan-100/55">
        {label}
      </div>
      <div className="mt-2 text-sm leading-7 text-slate-300/74">{value}</div>
    </div>
  );
}
