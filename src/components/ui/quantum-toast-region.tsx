import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore, type QuantumToast } from "@/store/use-ui-store";

const toneStyles: Record<QuantumToast["tone"], string> = {
  success:
    "border-emerald-300/30 bg-[linear-gradient(135deg,rgba(6,78,59,0.92),rgba(8,47,73,0.94))] text-emerald-50",
  error:
    "border-red-300/30 bg-[linear-gradient(135deg,rgba(127,29,29,0.94),rgba(69,10,10,0.94))] text-red-50",
  info:
    "border-cyan-300/30 bg-[linear-gradient(135deg,rgba(8,47,73,0.94),rgba(30,41,59,0.96))] text-cyan-50",
};

function ToastIcon({ tone }: { tone: QuantumToast["tone"] }) {
  if (tone === "success") {
    return <CheckCircle2 className="h-5 w-5" />;
  }

  if (tone === "error") {
    return <AlertTriangle className="h-5 w-5" />;
  }

  return <Info className="h-5 w-5" />;
}

export function QuantumToastRegion() {
  const toasts = useUIStore((state) => state.toasts);
  const dismissToast = useUIStore((state) => state.dismissToast);

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[min(28rem,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            className={cn(
              "pointer-events-auto overflow-hidden rounded-[1.5rem] border shadow-[0_20px_70px_rgba(2,6,23,0.55)] backdrop-blur-xl",
              toneStyles[toast.tone],
            )}
            exit={{ opacity: 0, x: 30, scale: 0.98 }}
            initial={{ opacity: 0, x: 48, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div>
              <div className="flex items-start gap-3 p-4">
                <div className="mt-0.5 rounded-full border border-white/10 bg-black/15 p-2">
                  <ToastIcon tone={toast.tone} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.34em] text-white/70">
                    Nexus feedback
                  </div>
                  <div className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-white">
                    {toast.title}
                  </div>
                  {toast.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-white/80">
                      {toast.description}
                    </p>
                  ) : null}
                </div>

                <Button
                  className="h-9 w-9 rounded-full border border-white/10 bg-black/15 text-white/80 hover:bg-white/10 hover:text-white"
                  onClick={() => dismissToast(toast.id)}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="h-1 w-full bg-white/5">
                <motion.div
                  animate={{ width: "0%" }}
                  className="h-full bg-[linear-gradient(90deg,rgba(255,255,255,0.68),rgba(34,211,238,0.72))]"
                  initial={{ width: "100%" }}
                  transition={{ duration: 4.2, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
