import { cn } from "@/lib/utils";
import { forwardRef } from "react";

type QuantumPanelProps = React.HTMLAttributes<HTMLDivElement>;

export const QuantumPanel = forwardRef<HTMLDivElement, QuantumPanelProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "quantum-panel rounded-[2rem] border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-5 shadow-2xl shadow-black/50 backdrop-blur-lg",
          className,
        )}
        {...props}
      />
    );
  },
);

QuantumPanel.displayName = "QuantumPanel";
