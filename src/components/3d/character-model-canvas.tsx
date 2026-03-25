"use client";

import {
  Bounds,
  ContactShadows,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { Group } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";
import { isWebGLSupported } from "@/lib/webgl";

type CharacterModelCanvasProps = {
  alt: string;
  className?: string;
  fallback: ReactNode;
  loadingFallback: ReactNode;
  src: string;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  onError: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch() {
    this.props.onError();
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export function CharacterModelCanvas({
  alt,
  className = "h-[70vh] min-h-[520px] w-full",
  fallback,
  loadingFallback,
  src,
}: CharacterModelCanvasProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [checkedWebgl, setCheckedWebgl] = useState(false);

  useEffect(() => {
    setWebglReady(isWebGLSupported());
    setCheckedWebgl(true);
  }, []);

  if (!checkedWebgl) {
    return <>{loadingFallback}</>;
  }

  if (!webglReady || hasError) {
    return <>{fallback}</>;
  }

  return (
    <div className={`relative ${className}`}>
      <ModelErrorBoundary
        fallback={fallback}
        onError={() => {
          setHasError(true);
        }}
      >
        <Canvas
          className="h-full w-full"
          dpr={[1, 1.75]}
          gl={{ alpha: true, antialias: true }}
          shadows
        >
          <Suspense fallback={null}>
            <PerspectiveCamera makeDefault far={100} fov={34} position={[0, 0.6, 3.4]} />
            <color args={["#0b111b"]} attach="background" />
            <ambientLight intensity={1.45} />
            <hemisphereLight args={["#7dd3fc", "#020617", 1.1]} />
            <directionalLight castShadow intensity={2.2} position={[4, 6, 5]} />
            <directionalLight intensity={1.1} position={[-3, 3, -2]} />

            <Bounds clip fit margin={1.25} observe>
              <ModelAsset
                alt={alt}
                onReady={() => {
                  setIsReady(true);
                }}
                src={src}
              />
            </Bounds>

            <ContactShadows
              blur={2.2}
              color="#08111d"
              opacity={0.5}
              position={[0, -1.2, 0]}
              scale={12}
            />
            <OrbitControls
              autoRotate
              autoRotateSpeed={1.15}
              enableDamping
              enablePan={false}
              maxDistance={8}
              minDistance={1.8}
            />
          </Suspense>
        </Canvas>
      </ModelErrorBoundary>

      {!isReady ? <div className="pointer-events-none absolute inset-0 z-10">{loadingFallback}</div> : null}
    </div>
  );
}

function ModelAsset({
  alt,
  onReady,
  src,
}: {
  alt: string;
  onReady: () => void;
  src: string;
}) {
  const gltf = useLoader(GLTFLoader, src, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder);
  });

  const scene = useMemo(() => {
    const clonedScene = SkeletonUtils.clone(gltf.scene) as Group;
    clonedScene.traverse((object) => {
      if ("castShadow" in object) {
        object.castShadow = true;
      }

      if ("receiveShadow" in object) {
        object.receiveShadow = true;
      }
    });
    return clonedScene;
  }, [gltf.scene]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <group name={alt}>
      <primitive object={scene} />
    </group>
  );
}
