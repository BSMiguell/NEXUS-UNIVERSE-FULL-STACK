"use client";

import { Stars } from "@react-three/drei";
import { Nexus3DScene } from "@/components/3d/nexus-3d-scene";

type Background3DProps = {
  className?: string;
};

export function Background3D({ className = "h-full w-full pointer-events-none" }: Background3DProps) {
  return (
    <Nexus3DScene cameraPosition={[0, 0, 4]} className={className}>
      <ambientLight intensity={0.35} />
      <pointLight intensity={0.7} position={[2, 2, 3]} color="#22d3ee" />
      <Stars radius={80} depth={35} count={1400} factor={2.4} saturation={0} fade />
    </Nexus3DScene>
  );
}
