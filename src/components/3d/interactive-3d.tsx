"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

type Interactive3DProps = {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scaleOnHover?: number;
  hotspots?: {
    id: string;
    label: string;
    ariaLabel?: string;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    onClick: () => void;
  }[];
};

export function Interactive3D({
  children,
  className = "",
  maxTilt = 8,
  scaleOnHover = 1.015,
  hotspots = [],
}: Interactive3DProps) {
  const [style, setStyle] = useState<CSSProperties>({
    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
  });

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const midX = rect.width / 2;
    const midY = rect.height / 2;
    const rotateY = ((x - midX) / midX) * maxTilt;
    const rotateX = -((y - midY) / midY) * maxTilt;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scaleOnHover})`,
    });
  };

  const handleLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
    });
  };

  return (
    <div
      className={`relative transition-transform duration-200 will-change-transform ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={style}
    >
      {children}
      {hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          aria-label={hotspot.ariaLabel ?? hotspot.label}
          className="absolute z-20 rounded-full border border-cyan-300/35 bg-cyan-300/15 px-2 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-100 backdrop-blur-sm transition hover:bg-cyan-300/25"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            hotspot.onClick();
          }}
          style={{
            top: hotspot.top,
            left: hotspot.left,
            right: hotspot.right,
            bottom: hotspot.bottom,
          }}
          type="button"
        >
          {hotspot.label}
        </button>
      ))}
    </div>
  );
}
