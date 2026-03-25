"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { isWebGLSupported } from "@/lib/webgl";
import { Loading3D } from "@/components/3d/loading-3d";

type Nexus3DSceneProps = {
  cameraPosition?: [number, number, number];
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
};

function DefaultFallback({ className = "h-96 w-full" }: { className?: string }) {
  return (
    <div className={`quantum-loader-shell flex items-center justify-center rounded-[1.8rem] text-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-300 ${className}`}>
      WebGL indisponivel neste dispositivo.
    </div>
  );
}

export function Nexus3DScene({
  cameraPosition = [0, 0, 5],
  children,
  className = "h-96 w-full",
  fallback,
}: Nexus3DSceneProps) {
  const [webglReady, setWebglReady] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setWebglReady(isWebGLSupported());
    setChecked(true);
  }, []);

  if (!checked) {
    return <Loading3D className={className} />;
  }

  if (!webglReady) {
    return fallback ?? <DefaultFallback className={className} />;
  }

  return (
    <Canvas camera={{ position: cameraPosition }} className={className} gl={{ alpha: true, antialias: true }}>
      {children}
    </Canvas>
  );
}
