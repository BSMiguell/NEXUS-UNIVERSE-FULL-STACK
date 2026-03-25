"use client";

import { Box, OrbitControls, Stars } from "@react-three/drei";
import { Nexus3DScene } from "@/components/3d/nexus-3d-scene";

export function Cena3DBasica() {
  return (
    <Nexus3DScene cameraPosition={[0, 0, 5]} className="h-96 w-full">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      <Box position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <meshStandardMaterial color="#0066FF" />
      </Box>
      <OrbitControls enableZoom enablePan enableRotate />
    </Nexus3DScene>
  );
}
