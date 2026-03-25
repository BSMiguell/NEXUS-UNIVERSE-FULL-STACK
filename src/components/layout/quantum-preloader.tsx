import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type QuantumPreloaderProps = {
  visible: boolean;
};

const bootMessages = [
  "Inicializando realidade quantica",
  "Sincronizando malha multiversal",
  "Preparando interface legacy+",
  "Estabilizando sinal do nexus",
];

export function QuantumPreloader({ visible }: QuantumPreloaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      setProgress(0);
      return;
    }

    let frame = 0;
    let start = 0;

    const animate = (timestamp: number) => {
      if (!start) {
        start = timestamp;
      }

      const elapsed = timestamp - start;
      const nextValue = Math.min(100, Math.round((elapsed / 1800) * 100));
      setProgress(nextValue);

      if (nextValue < 100) {
        frame = window.requestAnimationFrame(animate);
      }
    };

    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [visible]);

  const messageIndex = Math.min(
    bootMessages.length - 1,
    Math.floor(progress / 25),
  );

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(3,7,18,0.92)] backdrop-blur-xl"
          exit={{ opacity: 0 }}
          initial={{ opacity: 1 }}
        >
          <div className="quantum-loader-shell w-full max-w-xl rounded-[2.4rem] p-8 text-center">
            <div className="quantum-loader-core mx-auto">
              <div className="quantum-loader-ring" />
              <div className="quantum-loader-ring delay-1" />
              <div className="quantum-loader-ring delay-2" />
              <div className="quantum-loader-dot" />
            </div>

            <div className="mt-8 space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.38em] text-cyan-200/80">
                Nexus Universe 10/10
              </div>
              <h2 className="font-display text-3xl uppercase tracking-[0.12em] text-white sm:text-4xl">
                {bootMessages[messageIndex]}
              </h2>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300/75">
                Carregando terminal premium... {progress}%
              </p>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full border border-cyan-300/15 bg-black/30 p-1">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.85),rgba(96,165,250,0.8),rgba(217,70,239,0.8))]"
                initial={{ width: "0%" }}
                transition={{ ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
