"use client";

import { Float, OrbitControls, Stars, TorusKnot } from "@react-three/drei";
import { Nexus3DScene } from "@/components/3d/nexus-3d-scene";

export function Hero3DCore() {
  return (
    <Nexus3DScene cameraPosition={[0, 0, 5]} className="h-full w-full">
      <ambientLight intensity={0.55} />
      <pointLight intensity={1.2} position={[4, 4, 5]} color="#67e8f9" />
      <pointLight intensity={0.8} position={[-5, -2, -3]} color="#f472b6" />
      <Stars radius={90} depth={40} count={2200} factor={3} saturation={0} fade />
      <Float speed={1.5} rotationIntensity={1.2} floatIntensity={1.4}>
        <TorusKnot args={[0.95, 0.32, 220, 32]}>
          <meshStandardMaterial color="#22d3ee" emissive="#0e7490" emissiveIntensity={0.55} metalness={0.65} roughness={0.25} />
        </TorusKnot>
      </Float>
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={1.05} />
    </Nexus3DScene>
  );
}
