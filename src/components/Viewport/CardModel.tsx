import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useCardStore } from '../../hooks/useCardStore';
import { createRoundedRectShape } from '../../utils/geometry';

/* ------------------------------------------------------------------ */
/*  Default placeholder texture                                        */
/* ------------------------------------------------------------------ */

function createDefaultTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 856;
  canvas.height = 540;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 856, 540);
  grad.addColorStop(0, '#0c0c1d');
  grad.addColorStop(0.5, '#141432');
  grad.addColorStop(1, '#0a1628');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 856, 540);

  ctx.fillStyle = 'rgba(120, 140, 255, 0.06)';
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(100 + i * 140, 270 + Math.sin(i) * 80, 60 + i * 10, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '600 36px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CARD STUDIO', 428, 250);
  ctx.font = '300 16px Inter, system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillText('Upload an image to begin', 428, 286);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* ------------------------------------------------------------------ */
/*  Load a texture with correct settings                               */
/* ------------------------------------------------------------------ */

/**
 * Hook that loads an image src into a THREE.Texture and triggers a
 * React re-render when the image data is ready, so materials pick it up.
 */
function useImageTexture(src: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (!src) {
      setTexture(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.needsUpdate = true;
      setTexture(tex);
    };

    img.src = src;

    return () => {
      img.onload = null;
    };
  }, [src]);

  return texture;
}

/* ------------------------------------------------------------------ */
/*  Card geometry                                                      */
/* ------------------------------------------------------------------ */

const BEVEL_THICKNESS = 0.006;
const BEVEL_SIZE = 0.006;
const BEVEL_SEGMENTS = 3;
const CURVE_SEGMENTS = 24;

/**
 * Creates card geometry with ExtrudeGeometry + bevel.
 *
 * THREE.js ExtrudeGeometry (non-indexed) produces two groups:
 *   materialIndex 0 = sides/bevel  (e.g. 588 verts)
 *   materialIndex 1 = ALL caps     (e.g. 4200 verts, front+back interleaved)
 *
 * We build an index buffer to reorder triangles into three clean groups:
 *   group 0 = front face  (material 0)
 *   group 1 = back face   (material 1)
 *   group 2 = sides/bevel (material 2)
 *
 * We also remap UVs for front/back caps to fill [0,1].
 */
function createCardGeometry(
  width: number,
  height: number,
  depth: number,
  radius: number,
): THREE.BufferGeometry {
  const shape = createRoundedRectShape(width, height, radius);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: BEVEL_THICKNESS,
    bevelSize: BEVEL_SIZE,
    bevelOffset: 0,
    bevelSegments: BEVEL_SEGMENTS,
    curveSegments: CURVE_SEGMENTS,
  });

  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const midZ = depth / 2;

  // Classify triangles into three lists of vertex indices
  const frontIdx: number[] = [];
  const backIdx: number[] = [];
  const sideIdx: number[] = [];

  for (const g of geo.groups) {
    if (g.materialIndex === 1) {
      // Sides/bevel (materialIndex 1 in modern Three.js ExtrudeGeometry)
      for (let i = g.start; i < g.start + g.count; i++) sideIdx.push(i);
    } else {
      // Caps (materialIndex 0) — split by Z centroid of each triangle
      for (let i = g.start; i < g.start + g.count; i += 3) {
        const z0 = pos.getZ(i), z1 = pos.getZ(i + 1), z2 = pos.getZ(i + 2);
        if ((z0 + z1 + z2) / 3 > midZ) {
          frontIdx.push(i, i + 1, i + 2);
        } else {
          backIdx.push(i, i + 1, i + 2);
        }
      }
    }
  }

  // Build index buffer: [front..., back..., sides...]
  const indices = [...frontIdx, ...backIdx, ...sideIdx];
  geo.setIndex(indices);

  // 3 clean groups
  geo.clearGroups();
  geo.addGroup(0, frontIdx.length, 0);                              // front
  geo.addGroup(frontIdx.length, backIdx.length, 1);                 // back
  geo.addGroup(frontIdx.length + backIdx.length, sideIdx.length, 2); // sides

  // Remap front cap UVs to [0,1]
  for (const vi of frontIdx) {
    uv.setXY(vi, (pos.getX(vi) + width / 2) / width, (pos.getY(vi) + height / 2) / height);
  }
  // Remap back cap UVs (mirrored X)
  for (const vi of backIdx) {
    uv.setXY(vi, 1 - (pos.getX(vi) + width / 2) / width, (pos.getY(vi) + height / 2) / height);
  }
  uv.needsUpdate = true;

  // Centre on Z
  geo.translate(0, 0, -depth / 2);
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------------------------------------------ */
/*  SingleCard                                                         */
/* ------------------------------------------------------------------ */

interface SingleCardProps {
  frontTex: THREE.Texture;
  backTex: THREE.Texture | null;
  geometry: THREE.BufferGeometry;
  metalness: number;
  roughness: number;
  clearcoat: number;
  iridescence: number;
  metallicEdge: boolean;
  shimmerSweep: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

function SingleCard({
  frontTex,
  backTex,
  geometry,
  metalness,
  roughness,
  clearcoat,
  iridescence,
  metallicEdge,
  shimmerSweep,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: SingleCardProps) {
  const shimmerRef = useRef<THREE.SpotLight>(null);

  useFrame(({ clock }) => {
    if (shimmerSweep && shimmerRef.current) {
      const t = clock.getElapsedTime();
      const cycle = ((t * 0.6) % 3) - 1.5;
      shimmerRef.current.position.set(cycle * 1.0, 0.3, 0.6);
      shimmerRef.current.target.position.set(cycle * 0.5, 0, 0);
      shimmerRef.current.target.updateMatrixWorld();
      shimmerRef.current.intensity = 4 * Math.max(0, 1 - Math.abs(cycle) * 0.5);
    }
  });

  const frontMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: frontTex,
        metalness,
        roughness,
        clearcoat,
        clearcoatRoughness: 0.05,
        iridescence,
        iridescenceIOR: 1.3,
        iridescenceThicknessRange: [100, 400],
        envMapIntensity: 1.0,
      }),
    [frontTex, metalness, roughness, clearcoat, iridescence],
  );

  const backMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        map: backTex ?? frontTex,
        metalness,
        roughness,
        clearcoat: clearcoat * 0.5,
        envMapIntensity: 0.8,
      }),
    [backTex, frontTex, metalness, roughness, clearcoat],
  );

  const edgeMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: metallicEdge ? '#e0e0e0' : '#888888',
        metalness: metallicEdge ? 0.95 : 0.6,
        roughness: metallicEdge ? 0.05 : 0.25,
        emissive: metallicEdge ? '#ffffff' : '#000000',
        emissiveIntensity: metallicEdge ? 0.15 : 0,
        clearcoat: metallicEdge ? 1.0 : 0.3,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.5,
      }),
    [metallicEdge],
  );

  // Material array: [0] front, [1] back, [2] edge
  const materials = useMemo(
    () => [frontMaterial, backMaterial, edgeMaterial],
    [frontMaterial, backMaterial, edgeMaterial],
  );


  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} material={materials} castShadow receiveShadow />
      {shimmerSweep && (
        <spotLight
          ref={shimmerRef}
          color="#ffffff"
          intensity={4}
          distance={3}
          angle={0.3}
          penumbra={0.8}
          decay={2}
          position={[0, 0.3, 0.6]}
        >
          <primitive object={new THREE.Object3D()} attach="target" />
        </spotLight>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  CardModel (public)                                                 */
/* ------------------------------------------------------------------ */

export function CardModel() {
  const {
    frontImage,
    backImage,
    frontAspect,
    metalness,
    roughness,
    clearcoat,
    iridescence,
    floatAnimation,
    shimmerSweep,
    metallicEdge,
    activePreset,
  } = useCardStore();

  const groupRef = useRef<THREE.Group>(null);

  const cardHeight = 1;
  const cardWidth = cardHeight * frontAspect;
  const cardDepth = 0.018;
  const cornerRadius = 0.04;

  const geometry = useMemo(
    () => createCardGeometry(cardWidth, cardHeight, cardDepth, cornerRadius),
    [cardWidth, cardHeight, cardDepth, cornerRadius],
  );

  const defaultTex = useMemo(() => createDefaultTexture(), []);

  // Load uploaded textures via hook (triggers re-render when image data is ready)
  const loadedFrontTex = useImageTexture(frontImage);
  const loadedBackTex = useImageTexture(backImage);

  const frontTex = loadedFrontTex ?? defaultTex;
  const backTex = loadedBackTex;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (floatAnimation) {
      const t = clock.getElapsedTime();
      groupRef.current.position.y = Math.sin(t * 1.2) * 0.04;
      groupRef.current.rotation.z = Math.sin(t * 0.7) * 0.018;
      groupRef.current.rotation.x = Math.sin(t * 0.9) * 0.008;
    } else {
      groupRef.current.position.y *= 0.92;
      groupRef.current.rotation.z *= 0.92;
      groupRef.current.rotation.x *= 0.92;
    }
  });

  const isStack = activePreset === 'stack';

  const sharedProps = {
    frontTex,
    backTex,
    geometry,
    metalness,
    roughness,
    clearcoat,
    iridescence,
    metallicEdge,
  };

  return (
    <group ref={groupRef}>
      {isStack ? (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <SingleCard
              key={i}
              {...sharedProps}
              shimmerSweep={shimmerSweep && i === 4}
              position={[i * 0.015, i * 0.012, -i * 0.035]}
              rotation={[0, i * 0.015, i * 0.008]}
            />
          ))}
        </>
      ) : (
        <SingleCard {...sharedProps} shimmerSweep={shimmerSweep} />
      )}
    </group>
  );
}
