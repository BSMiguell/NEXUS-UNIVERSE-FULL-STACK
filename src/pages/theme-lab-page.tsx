import { MoonStar, Palette, RefreshCcw, SunMedium, Type, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  themeFonts,
  useThemeStore,
  type ThemeFontKey,
} from "@/store/use-theme-store";

const fontOptions = [
  { value: "orbitron", label: "Orbitron" },
  { value: "exo2", label: "Exo 2" },
  { value: "rajdhani", label: "Rajdhani" },
  { value: "space-grotesk", label: "Space Grotesk" },
] satisfies { value: ThemeFontKey; label: string }[];

export function ThemeLabPage() {
  const presets = useThemeStore((state) => state.presets);
  const activePresetId = useThemeStore((state) => state.activePresetId);
  const mode = useThemeStore((state) => state.mode);
  const primaryHex = useThemeStore((state) => state.primaryHex);
  const accentHex = useThemeStore((state) => state.accentHex);
  const fontDisplay = useThemeStore((state) => state.fontDisplay);
  const fontBody = useThemeStore((state) => state.fontBody);
  const setActivePreset = useThemeStore((state) => state.setActivePreset);
  const setMode = useThemeStore((state) => state.setMode);
  const setPrimaryHex = useThemeStore((state) => state.setPrimaryHex);
  const setAccentHex = useThemeStore((state) => state.setAccentHex);
  const setFontDisplay = useThemeStore((state) => state.setFontDisplay);
  const setFontBody = useThemeStore((state) => state.setFontBody);
  const resetCustomizations = useThemeStore((state) => state.resetCustomizations);

  return (
    <div className="space-y-10">
      <section className="quantum-panel rounded-[2.6rem] p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
              <Palette className="h-4 w-4" />
              Theme Lab
            </div>
            <div>
              <h1 className="font-display text-5xl font-black uppercase tracking-[0.08em] text-white sm:text-6xl">
                Controle de tema
              </h1>
              <p className="mt-3 max-w-3xl text-lg leading-relaxed text-slate-300/88">
                Primeira fundacao do personalizador global: presets, cores-base e
                troca de tipografia aplicadas na UI inteira por CSS variables.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <ThemeMetric label="Preset" value={String(presets.length)} />
            <ThemeMetric label="Modo" value={mode === "dark" ? "Dark" : "Light"} />
            <ThemeMetric label="Primaria" value={primaryHex.toUpperCase()} />
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.8fr)]">
        <section className="space-y-8">
          <section className="quantum-panel rounded-[2rem] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
                  Presets
                </div>
                <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
                  Direcoes visuais
                </h2>
              </div>

              <Button
                className="rounded-[1.1rem] px-4"
                onClick={resetCustomizations}
                type="button"
                variant="outline"
              >
                <RefreshCcw className="h-4 w-4" />
                Resetar
              </Button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {presets.map((preset) => {
                const isActive = preset.id === activePresetId;

                return (
                  <button
                    className={`rounded-[1.6rem] border p-5 text-left transition ${
                      isActive
                        ? "border-primary/60 bg-primary/10 shadow-[0_0_28px_rgba(var(--surface-glow),0.18)]"
                        : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5"
                    }`}
                    key={preset.id}
                    onClick={() => setActivePreset(preset.id)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div
                        className="h-11 w-11 rounded-2xl border border-white/10"
                        style={{
                          background: `linear-gradient(135deg, ${preset.primaryHex}, ${preset.accentHex})`,
                        }}
                      />
                      <div className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground">
                        {isActive ? "ativo" : "preset"}
                      </div>
                    </div>
                    <h3 className="mt-4 font-display text-xl uppercase tracking-[0.08em] text-white">
                      {preset.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300/82">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="quantum-panel rounded-[2rem] p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
                  Modo de leitura
                </div>
                <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
                  Claro ou escuro
                </h2>
              </div>
              <div className="flex gap-3">
                <ModeButton
                  active={mode === "dark"}
                  icon={MoonStar}
                  label="Dark"
                  onClick={() => setMode("dark")}
                />
                <ModeButton
                  active={mode === "light"}
                  icon={SunMedium}
                  label="Light"
                  onClick={() => setMode("light")}
                />
              </div>
            </div>
          </section>

          <section className="quantum-panel rounded-[2rem] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Ajustes manuais
            </div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
              Primeiras customizacoes
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <ThemeControl
                label="Cor primaria"
                onChange={setPrimaryHex}
                value={primaryHex}
              />
              <ThemeControl
                label="Cor de destaque"
                onChange={setAccentHex}
                value={accentHex}
              />
              <ThemeSelect
                label="Fonte display"
                onChange={(value) => setFontDisplay(value as ThemeFontKey)}
                options={fontOptions}
                value={fontDisplay}
              />
              <ThemeSelect
                label="Fonte base"
                onChange={(value) => setFontBody(value as ThemeFontKey)}
                options={fontOptions}
                value={fontBody}
              />
            </div>
          </section>
        </section>

        <aside className="space-y-6">
          <section className="quantum-panel rounded-[2rem] p-6">
            <div className="text-xs font-bold uppercase tracking-[0.32em] text-cyan-200/75">
              Preview
            </div>
            <h2 className="mt-2 font-display text-2xl uppercase tracking-[0.1em] text-white">
              Amostra ao vivo
            </h2>

            <div className="mt-6 rounded-[2rem] border border-white/10 bg-black/20 p-5">
              <div className="rounded-[1.6rem] border border-primary/20 bg-primary/10 p-5">
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-primary">
                  Interface ativa
                </div>
                <h3 className="mt-3 font-display text-3xl uppercase tracking-[0.1em] text-white">
                  Nexus Theming
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300/84">
                  As escolhas abaixo ja atualizam toda a UI com os mesmos tokens
                  usados em botoes, paineis, fundo e tipografia.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button className="rounded-[1.1rem] px-4" type="button">
                    Acao primaria
                  </Button>
                  <Button
                    className="rounded-[1.1rem] px-4"
                    type="button"
                    variant="outline"
                  >
                    Acao secundaria
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ThemePreviewSwatch
                label="Superficie"
                value="hsl(var(--card))"
              />
              <ThemePreviewSwatch
                label="Borda"
                value="hsl(var(--border))"
              />
            </div>
          </section>

          <section className="quantum-panel rounded-[2rem] p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Type className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.28em] text-muted-foreground">
                  Tipografia aplicada
                </div>
                <div className="mt-1 text-sm text-slate-300/84">
                  Display: {fontLabel(fontDisplay)} | Base: {fontLabel(fontBody)}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {fontOptions.map((option) => (
                <div
                  className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4"
                  key={option.value}
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
                    {option.label}
                  </div>
                  <div
                    className="mt-2 text-2xl text-white"
                    style={{ fontFamily: themeFonts[option.value] }}
                  >
                    Quantum signal ready
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ThemeMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
      <div className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-black uppercase text-white">
        {value}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      className={`rounded-[1.1rem] px-4 ${active ? "shadow-[0_0_24px_rgba(var(--surface-glow),0.18)]" : ""}`}
      onClick={onClick}
      type="button"
      variant={active ? "default" : "outline"}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}

function ThemePreviewSwatch({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-white/10 bg-black/20 p-4">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </div>
      <div
        className="mt-3 h-14 rounded-[1rem] border border-white/10"
        style={{ background: value }}
      />
    </div>
  );
}

function ThemeControl({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-4 flex items-center gap-4">
        <input
          className="h-14 w-16 cursor-pointer rounded-xl border border-white/10 bg-transparent"
          onChange={(event) => onChange(event.target.value)}
          type="color"
          value={value}
        />
        <span className="font-display text-xl uppercase tracking-[0.08em] text-white">
          {value.toUpperCase()}
        </span>
      </div>
    </label>
  );
}

function ThemeSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  value: string;
}) {
  return (
    <label className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </span>
      <select
        className="mt-4 h-12 w-full rounded-[1rem] border border-white/10 bg-background px-4 text-sm uppercase tracking-[0.16em] text-white outline-none transition focus:border-primary/40"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function fontLabel(key: ThemeFontKey) {
  return fontOptions.find((option) => option.value === key)?.label ?? key;
}
