import { useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { CardModel } from './CardModel';
import { CameraController } from './CameraController';
import { useCardStore } from '../../hooks/useCardStore';
import { useExport } from '../../hooks/useExport';

function Lights() {
  const {
    keyLightIntensity,
    fillLightIntensity,
    rimLightIntensity,
    keyDirection,
    lightParallax,
  } = useCardStore();

  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);

  useFrame(({ pointer }) => {
    if (!keyRef.current) return;

    let dx = (keyDirection.x - 0.5) * 5;
    let dy = (keyDirection.y - 0.5) * 5;

    if (lightParallax) {
      dx += pointer.x * 2.0;
      dy += pointer.y * 2.0;
    }

    keyRef.current.position.x = dx;
    keyRef.current.position.y = dy + 2;
    keyRef.current.position.z = 3;

    // Fill light opposes key light
    if (fillRef.current) {
      fillRef.current.position.x = -dx * 0.6;
      fillRef.current.position.y = -dy * 0.3 + 1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.12} color="#e0e4f0" />
      <directionalLight
        ref={keyRef}
        intensity={keyLightIntensity}
        position={[2, 3, 3]}
        castShadow
        color="#fff8f0"
      />
      <directionalLight
        ref={fillRef}
        intensity={fillLightIntensity}
        position={[-3, 1, 2]}
        color="#e0e8ff"
      />
      <directionalLight
        intensity={rimLightIntensity}
        position={[0, 1, -3]}
        color="#ffe8d0"
      />
    </>
  );
}

function ShadowPlane() {
  const dropShadow = useCardStore((s) => s.dropShadow);
  if (!dropShadow) return null;
  return (
    <ContactShadows
      position={[0, -0.55, 0]}
      opacity={0.5}
      scale={5}
      blur={2.5}
      far={3}
      color="#000000"
      resolution={512}
    />
  );
}

function Background() {
  const backgroundColor = useCardStore((s) => s.backgroundColor);
  const { scene } = useThree();
  const prevColor = useRef<string>('');

  useFrame(() => {
    if (backgroundColor === 'checker') {
      scene.background = null;
    } else if (prevColor.current !== backgroundColor) {
      scene.background = new THREE.Color(backgroundColor);
      prevColor.current = backgroundColor;
    }
  });

  return null;
}

function CheckerOverlay() {
  const backgroundColor = useCardStore((s) => s.backgroundColor);
  if (backgroundColor !== 'checker') return null;
  return (
    <div
      className="absolute inset-0 -z-10"
      style={{
        background:
          'repeating-conic-gradient(#404040 0% 25%, #333333 0% 50%) 50% / 20px 20px',
      }}
    />
  );
}

export function Scene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { exportPNG } = useExport();

  const sceneData = useRef<{
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  } | null>(null);

  const handleExport = useCallback(() => {
    if (sceneData.current) {
      const { gl, scene, camera } = sceneData.current;
      exportPNG(gl, scene, camera);
    }
  }, [exportPNG]);

  (window as any).__cardStudioExport = handleExport;

  return (
    <div className="relative w-full h-full">
      <CheckerOverlay />
      <Canvas
        ref={canvasRef}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
          alpha: true,
        }}
        camera={{ position: [0.6, 0.4, 1.8], fov: 45 }}
        onCreated={({ gl, scene, camera }) => {
          sceneData.current = { gl, scene, camera };
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
        className="!absolute inset-0"
      >
        <Background />
        <Lights />
        <CardModel />
        <ShadowPlane />
        <CameraController />
        <Environment preset="studio" />
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/20 tracking-wider pointer-events-none select-none font-medium">
        Drag to orbit&ensp;·&ensp;Scroll to zoom&ensp;·&ensp;Double-click to reset
      </div>
    </div>
  );
}
