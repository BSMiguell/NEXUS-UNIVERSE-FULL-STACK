import {
  AlertTriangle,
  Box,
  ChevronLeft,
  Cuboid,
  FileSearch,
  Orbit,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/router";
import {
  useMemo,
  type ReactNode,
} from "react";
import { CharacterModelCanvas } from "@/components/3d/character-model-canvas";
import { Button } from "@/components/ui/button";
import { AppLink } from "@/components/navigation/app-link";
import { useCharacterQuery } from "@/hooks/use-characters-query";
import { getWebpImagePath } from "@/lib/image-sources";
import {
  getModelExtension,
  getModelFileName,
  getModelLibrary,
  getModelReadinessLabel,
} from "@/lib/model-metadata";
import { useUIStore } from "@/store/use-ui-store";
import type { Character } from "@/types/character";

const detailPriority = {
  origin: ["origem", "universo", "mundo"],
  faction: ["faccao", "facção", "afiliacao", "afiliação", "grupo", "aldeia"],
  ability: ["habilidades", "habilidade", "poder", "tecnica", "técnica", "jutsu", "arma"],
  status: ["status", "condicao", "condição"],
};

type ModelViewerPageProps = {
  characterIdParam?: number;
};

export function ModelViewerPage({ characterIdParam }: ModelViewerPageProps = {}) {
  const router = useRouter();
  const pushToast = useUIStore((state) => state.pushToast);

  const characterId = resolveCharacterId({
    characterIdParam,
    routeCharacterIdParam: router.query.id,
  });
  const isValidId = Number.isFinite(characterId) && characterId > 0;
  const { data: character, error, isLoading } = useCharacterQuery(
    characterId,
    isValidId,
  );

  const posterSrc = character ? getWebpImagePath(character.image) : "";
  const spotlightDetails = useMemo(
    () => (character ? getSpotlightDetails(character) : []),
    [character],
  );
  const extraDetails = useMemo(
    () => (character ? getExtraDetails(character, spotlightDetails) : []),
    [character, spotlightDetails],
  );
  const modelFileName = getModelFileName(character?.model3d);
  const modelExtension = getModelExtension(character?.model3d);
  const modelLibrary = getModelLibrary(character?.model3d);
  const readinessLabel = getModelReadinessLabel(character?.model3d);

  if (!isValidId) {
    return <ViewerNotFoundState />;
  }

  if (isLoading) {
    return (
      <section className="quantum-panel flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-[2.5rem] p-10 text-center">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 animate-ping rounded-full border-2 border-primary/20" />
          <div className="absolute inset-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-black uppercase tracking-[0.18em] text-foreground">
            Sincronizando viewer
          </h2>
          <p className="mt-2 uppercase tracking-[0.2em] text-muted-foreground">
            Consultando a assinatura do personagem na base dimensional...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="quantum-panel flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-[2.5rem] p-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-black uppercase tracking-[0.18em] text-foreground">
            Falha ao carregar dados
          </h2>
          <p className="mt-2 uppercase tracking-[0.2em] text-muted-foreground">
            Nao foi possivel recuperar o personagem solicitado pela rota atual.
          </p>
        </div>
        <Button asChild className="rounded-[1.2rem] px-5">
          <AppLink to="/modelos">
            <Box className="h-4 w-4" />
            Voltar para biblioteca 3D
          </AppLink>
        </Button>
      </section>
    );
  }

  if (!character) {
    return <ViewerNotFoundState />;
  }

  if (!character.model3d) {
    return (
      <section className="quantum-panel flex min-h-[60vh] flex-col items-center justify-center gap-8 rounded-[2.5rem] p-10 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <h1 className="font-display text-3xl font-black uppercase tracking-[0.12em] text-white">
            Modelo indisponivel
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-300/82">
            Este personagem ainda nao possui um arquivo `model3d` configurado na base atual.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-[1.2rem] px-5" variant="outline">
            <AppLink to={`/personagem/${character.id}`}>
              <ChevronLeft className="h-4 w-4" />
              Voltar ao perfil
            </AppLink>
          </Button>
          <Button asChild className="rounded-[1.2rem] px-5">
            <AppLink to="/modelos">
              <Box className="h-4 w-4" />
              Ver biblioteca 3D
            </AppLink>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-10">
      <section className="quantum-panel rounded-[2.5rem] p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
              <Cuboid className="h-4 w-4" />
              Viewer tridimensional
            </div>
            <div>
              <h1 className="font-display text-4xl font-black uppercase tracking-[0.1em] text-white sm:text-5xl lg:text-6xl">
                {character.name}
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-300/86">
                Modelo 3D sincronizado com os metadados do personagem para leitura
                de origem, faccao, habilidades e status em um unico cockpit.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="rounded-[1.2rem] px-5" variant="outline">
              <AppLink to={`/personagem/${character.id}`}>
                <ChevronLeft className="h-4 w-4" />
                Voltar ao perfil
              </AppLink>
            </Button>
            <Button asChild className="rounded-[1.2rem] px-5">
              <AppLink to={`/modelos?personagem=${character.id}`}>
                <ScanSearch className="h-4 w-4" />
                Voltar aos modelos
              </AppLink>
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.8fr)]">
        <section className="quantum-panel rounded-[2.5rem] p-4 lg:p-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/30">
            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-black/35 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-cyan-200/80">
                <Orbit className="h-4 w-4 text-primary" />
                Orbital controls ativos
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.26em] text-muted-foreground">
                arraste, aproxime, gire
              </div>
            </div>

            <CharacterModelCanvas
              alt={`Modelo 3D de ${character.name}`}
              className="h-[70vh] min-h-[520px] w-full bg-[radial-gradient(circle_at_top,rgba(var(--surface-glow),0.12),rgba(0,0,0,0.88))]"
              fallback={
                <ViewerFallback
                  description="O arquivo .glb nao foi encontrado ou falhou ao carregar. A leitura dos dados permanece disponivel no painel lateral."
                  posterSrc={posterSrc}
                  title="Modelo 3D indisponivel"
                  tone="asset"
                />
              }
              loadingFallback={<ViewerLoadingOverlay />}
              src={character.model3d}
            />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="quantum-panel rounded-[2rem] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Perfil sincronizado
            </div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
              Leitura contextual
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300/82">
              {character.description}
            </p>

            <div className="mt-6 grid gap-4">
              {spotlightDetails.map((detail) => (
                <SpotlightRow
                  key={detail.key}
                  label={detail.label}
                  value={detail.value}
                />
              ))}
            </div>
          </section>

          <section className="quantum-panel rounded-[2rem] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Assinatura do modelo
            </div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
              Dados tecnicos
            </h2>

            <div className="mt-6 grid gap-4">
              <InfoRow label="Categoria" value={character.category} />
              <InfoRow label="Registro" value={`ID ${character.id.toString().padStart(4, "0")}`} />
              <InfoRow label="Arquivo" value={modelFileName} />
              <InfoRow label="Formato" value={modelExtension} />
              <InfoRow label="Biblioteca" value={modelLibrary} />
              <InfoRow label="Readiness" value={readinessLabel} />
            </div>
          </section>

          {extraDetails.length > 0 ? (
            <section className="quantum-panel rounded-[2rem] p-6">
              <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
                Metadados adicionais
              </div>
              <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
                Universo e atributos
              </h2>

              <div className="mt-6 grid gap-3">
                {extraDetails.map((detail) => (
                  <MetaRow
                    key={detail.key}
                    label={detail.label}
                    value={detail.value}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="quantum-panel rounded-[2rem] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Acoes rapidas
            </div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
              Ferramentas do viewer
            </h2>

            <div className="mt-6 grid gap-3">
              <Button
                className="justify-start rounded-[1.2rem]"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(character.model3d ?? "")
                    .then(() => {
                      pushToast({
                        title: "Caminho copiado",
                        description: "O caminho do asset 3D foi enviado para a area de transferencia.",
                        tone: "success",
                      });
                    })
                    .catch(() => {
                      pushToast({
                        title: "Falha ao copiar",
                        description: "Nao foi possivel copiar o caminho do asset neste navegador.",
                        tone: "error",
                      });
                    });
                }}
                type="button"
                variant="outline"
              >
                <Box className="h-4 w-4" />
                Copiar caminho do asset
              </Button>
            </div>
          </section>

          <section className="quantum-panel rounded-[2rem] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Controles
            </div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
              Navegacao do viewer
            </h2>

            <div className="mt-6 grid gap-3">
              <ControlTip title="Rotacao">
                Clique e arraste para orbitar o modelo.
              </ControlTip>
              <ControlTip title="Zoom">
                Use a roda do mouse ou gesto de pinca para aproximar.
              </ControlTip>
              <ControlTip title="Fallback elegante">
                Se o .glb falhar, o poster e os metadados permanecem disponiveis
                para a experiencia nao quebrar.
              </ControlTip>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ViewerNotFoundState() {
  return (
    <section className="quantum-panel flex min-h-[60vh] flex-col items-center justify-center gap-8 rounded-[2.5rem] p-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <div className="space-y-3">
        <h1 className="font-display text-3xl font-black uppercase tracking-[0.12em] text-white">
          Personagem nao encontrado
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-slate-300/82">
          O identificador solicitado nao corresponde a nenhum registro da biblioteca atual.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild className="rounded-[1.2rem] px-5" variant="outline">
          <AppLink to="/">
            <ChevronLeft className="h-4 w-4" />
            Voltar para a base
          </AppLink>
        </Button>
        <Button asChild className="rounded-[1.2rem] px-5">
          <AppLink to="/modelos">
            <Box className="h-4 w-4" />
            Ver biblioteca 3D
          </AppLink>
        </Button>
      </div>
    </section>
  );
}

function resolveCharacterId({
  characterIdParam,
  routeCharacterIdParam,
}: {
  characterIdParam?: number;
  routeCharacterIdParam?: string | string[];
}) {
  if (
    typeof characterIdParam === "number" &&
    Number.isFinite(characterIdParam) &&
    characterIdParam > 0
  ) {
    return characterIdParam;
  }

  const routeCharacterId = Array.isArray(routeCharacterIdParam)
    ? routeCharacterIdParam[0]
    : routeCharacterIdParam;
  return Number(routeCharacterId ?? 0);
}

function ViewerLoadingOverlay() {
  return (
    <div className="flex h-[70vh] min-h-[520px] flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_top,rgba(var(--surface-glow),0.08),rgba(0,0,0,0.4))] p-8 text-center backdrop-blur-[2px]">
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 animate-ping rounded-full border border-primary/20" />
        <div className="absolute inset-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-black uppercase tracking-[0.12em] text-white">
          Carregando viewer 3D
        </h3>
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
          Inicializando a malha e validando o arquivo do modelo...
        </p>
      </div>
    </div>
  );
}

function ViewerFallback({
  description,
  posterSrc,
  title,
  tone,
}: {
  description: string;
  posterSrc?: string;
  title: string;
  tone: "asset" | "system";
}) {
  return (
    <div className="flex h-[70vh] min-h-[520px] flex-col items-center justify-center gap-6 bg-[radial-gradient(circle_at_top,rgba(var(--surface-glow),0.08),rgba(0,0,0,0.92))] p-8 text-center">
      {posterSrc ? (
        <div className="relative mb-2 h-40 w-32 overflow-hidden rounded-[1.6rem] border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.38)]">
          <img
            alt=""
            className="h-full w-full object-cover opacity-80"
            src={posterSrc}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      ) : null}
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full border ${
          tone === "asset"
            ? "border-primary/20 bg-primary/10 text-primary"
            : "border-amber-400/20 bg-amber-400/10 text-amber-300"
        }`}
      >
        {tone === "asset" ? (
          <FileSearch className="h-8 w-8" />
        ) : (
          <AlertTriangle className="h-8 w-8" />
        )}
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-2xl font-black uppercase tracking-[0.12em] text-white">
          {title}
        </h3>
        <p className="max-w-lg text-sm uppercase tracking-[0.18em] text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/78">
        <Sparkles className="h-4 w-4 text-primary" />
        Painel lateral mantido online
      </div>
    </div>
  );
}

function SpotlightRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-primary/15 bg-primary/5 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-white">
        {value}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 break-all text-sm font-semibold uppercase tracking-[0.14em] text-white">
        {value}
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-slate-200/88">{value}</div>
    </div>
  );
}

function ControlTip({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
        {title}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-slate-300/84">
        {children}
      </div>
    </div>
  );
}

function normalizeDetailKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatLabel(value: string) {
  return value.replace(/[_-]/g, " ");
}

function getSpotlightDetails(character: Character) {
  const details = Object.entries(character.details).filter(
    ([, value]) => value !== undefined,
  );

  const selection = Object.entries(detailPriority)
    .map(([label, aliases]) => {
      const match = details.find(([key]) =>
        aliases.includes(normalizeDetailKey(key)),
      );

      if (!match) {
        return null;
      }

      return {
        key: match[0],
        label:
          label === "origin"
            ? "Origem"
            : label === "faction"
              ? "Faccao"
              : label === "ability"
                ? "Habilidade central"
                : "Status",
        value: String(match[1]),
      };
    })
    .filter((item): item is { key: string; label: string; value: string } => Boolean(item));

  if (selection.length > 0) {
    return selection;
  }

  return details.slice(0, 4).map(([key, value]) => ({
    key,
    label: formatLabel(key),
    value: String(value),
  }));
}

function getExtraDetails(
  character: Character,
  spotlightDetails: { key: string; label: string; value: string }[],
) {
  const spotlightKeys = new Set(spotlightDetails.map((detail) => detail.key));

  return Object.entries(character.details)
    .filter(([key, value]) => value !== undefined && !spotlightKeys.has(key))
    .map(([key, value]) => ({
      key,
      label: formatLabel(key),
      value: String(value),
    }));
}
