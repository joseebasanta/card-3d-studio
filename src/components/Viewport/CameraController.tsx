import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useCardStore } from '../../hooks/useCardStore';
import type { ShotPreset } from '../../hooks/useCardStore';

const PRESET_CONFIGS: Record<
  ShotPreset,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  hero: { position: [0.6, 0.4, 1.8], target: [0, 0, 0] },
  float: { position: [0.1, 0.8, 1.6], target: [0, 0, 0] },
  portrait: { position: [0, 0.05, 2.2], target: [0, 0, 0] },
  drama: { position: [0.8, -0.3, 1.4], target: [0, 0, 0] },
  overhead: { position: [0, 2.5, 0.15], target: [0, 0, 0] },
  stack: { position: [0.5, 0.5, 2.0], target: [0.04, 0.03, -0.05] },
};

export function CameraController() {
  const controlsRef = useRef<any>(null);
  const activePreset = useCardStore((s) => s.activePreset);
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0.6, 0.4, 1.8));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const isAnimating = useRef(false);
  const animProgress = useRef(1);

  useEffect(() => {
    const config = PRESET_CONFIGS[activePreset];
    targetPos.current.set(...config.position);
    targetLookAt.current.set(...config.target);
    isAnimating.current = true;
    animProgress.current = 0;
  }, [activePreset]);

  useFrame((_, delta) => {
    if (!isAnimating.current || !controlsRef.current) return;

    animProgress.current += delta * 2.5;
    const t = Math.min(animProgress.current, 1);
    const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic

    camera.position.lerp(targetPos.current, ease * 0.08 + 0.02);
    controlsRef.current.target.lerp(targetLookAt.current, ease * 0.08 + 0.02);
    controlsRef.current.update();

    if (t >= 1) {
      isAnimating.current = false;
    }
  });

  const handleDoubleClick = useCallback(() => {
    const config = PRESET_CONFIGS[activePreset];
    targetPos.current.set(...config.position);
    targetLookAt.current.set(...config.target);
    isAnimating.current = true;
    animProgress.current = 0;
  }, [activePreset]);

  const { gl } = useThree();
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('dblclick', handleDoubleClick);
    return () => canvas.removeEventListener('dblclick', handleDoubleClick);
  }, [gl, handleDoubleClick]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={0.5}
      maxDistance={6}
    />
  );
}
