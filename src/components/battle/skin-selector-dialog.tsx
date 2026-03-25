import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BattleSkinOption } from "@/lib/battle-skins";

type SkinSelectorDialogProps = {
  activeId: string;
  fallbackImage: string;
  label: string;
  onApply: (skinId: string) => void;
  onClose: () => void;
  open: boolean;
  skins: BattleSkinOption[];
};

export function SkinSelectorDialog({
  activeId,
  fallbackImage,
  label,
  onApply,
  onClose,
  open,
  skins,
}: SkinSelectorDialogProps) {
  if (!open) {
    return null;
  }

  const activeSkin = skins.find((skin) => skin.id === activeId) ?? skins[0];
  const previewImage = activeSkin?.image || fallbackImage;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/75 px-4 py-10 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="quantum-panel max-h-[85vh] w-full max-w-5xl overflow-hidden rounded-[2rem] p-0"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
              Skin selector
            </div>
            <div className="mt-2 font-display text-2xl uppercase tracking-[0.12em] text-white">
              {label}
            </div>
          </div>
          <Button className="rounded-[1rem] px-4" onClick={onClose} type="button" variant="outline">
            <X className="h-4 w-4" />
            Fechar
          </Button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="border-b border-white/10 p-6 lg:border-b-0 lg:border-r">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
                Preview
              </div>
              <div className="mt-4 flex justify-center rounded-[1.4rem] border border-white/10 bg-background/40 p-4">
                <img
                  alt={activeSkin?.label || "Skin"}
                  className="h-72 w-full max-w-[16rem] object-contain"
                  height="288"
                  src={previewImage}
                  width="256"
                />
              </div>
              <div className="mt-4 font-display text-xl uppercase tracking-[0.1em] text-white">
                {activeSkin?.label || "Padrao"}
              </div>
              <div className="mt-2 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
                {activeSkin?.tag || "Base"}
              </div>
            </div>
          </aside>

          <div className="max-h-[60vh] overflow-y-auto p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {skins.map((skin) => {
                const skinImage = skin.image || fallbackImage;

                return (
                  <button
                    className={cn(
                      "rounded-[1.4rem] border p-4 text-left transition-all",
                      skin.id === activeId
                        ? "border-primary/35 bg-primary/10 shadow-[0_0_20px_rgba(var(--surface-glow),0.18)]"
                        : "border-white/10 bg-black/20 hover:border-white/20",
                    )}
                    key={skin.id}
                    onClick={() => onApply(skin.id)}
                    type="button"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        alt={skin.label}
                        className="h-24 w-20 rounded-[1rem] object-cover"
                        height="96"
                        src={skinImage}
                        width="80"
                      />
                      <div>
                        <div className="font-display text-lg uppercase tracking-[0.08em] text-white">
                          {skin.label}
                        </div>
                        <div className="mt-1 text-[10px] font-black uppercase tracking-[0.24em] text-cyan-100/60">
                          {skin.tag}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
