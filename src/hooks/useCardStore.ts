import { create } from 'zustand';

export type ShotPreset = 'hero' | 'float' | 'portrait' | 'drama' | 'overhead' | 'stack';
export type ExportScale = '1x' | '2x' | '3x' | '4k';

export interface CardStudioState {
  frontImage: string | null;
  backImage: string | null;
  frontAspect: number;

  metalness: number;
  roughness: number;
  clearcoat: number;
  iridescence: number;

  keyLightIntensity: number;
  fillLightIntensity: number;
  rimLightIntensity: number;
  keyDirection: { x: number; y: number };

  dropShadow: boolean;
  floatAnimation: boolean;
  shimmerSweep: boolean;
  lightParallax: boolean;
  metallicEdge: boolean;

  backgroundColor: string;
  activePreset: ShotPreset;
  exportScale: ExportScale;
  transparentBg: boolean;

  setFrontImage: (url: string | null, aspect?: number) => void;
  setBackImage: (url: string | null) => void;
  setMaterial: (key: 'metalness' | 'roughness' | 'clearcoat' | 'iridescence', value: number) => void;
  setLighting: (key: 'keyLightIntensity' | 'fillLightIntensity' | 'rimLightIntensity', value: number) => void;
  setKeyDirection: (dir: { x: number; y: number }) => void;
  toggleEffect: (key: 'dropShadow' | 'floatAnimation' | 'shimmerSweep' | 'lightParallax' | 'metallicEdge') => void;
  setBackgroundColor: (color: string) => void;
  setActivePreset: (preset: ShotPreset) => void;
  setExportScale: (scale: ExportScale) => void;
  setTransparentBg: (val: boolean) => void;
}

export const useCardStore = create<CardStudioState>((set) => ({
  frontImage: null,
  backImage: null,
  frontAspect: 1.586,

  metalness: 0.5,
  roughness: 0.2,
  clearcoat: 0.8,
  iridescence: 0.35,

  keyLightIntensity: 1.5,
  fillLightIntensity: 0.4,
  rimLightIntensity: 0.55,
  keyDirection: { x: 0.5, y: 0.5 },

  dropShadow: false,
  floatAnimation: false,
  shimmerSweep: false,
  lightParallax: false,
  metallicEdge: false,

  backgroundColor: '#111111',
  activePreset: 'hero',
  exportScale: '2x',
  transparentBg: false,

  setFrontImage: (url, aspect) => set({ frontImage: url, frontAspect: aspect ?? 1.586 }),
  setBackImage: (url) => set({ backImage: url }),
  setMaterial: (key, value) => set({ [key]: value }),
  setLighting: (key, value) => set({ [key]: value }),
  setKeyDirection: (dir) => set({ keyDirection: dir }),
  toggleEffect: (key) => set((s) => ({ [key]: !s[key] })),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
  setActivePreset: (preset) => set({ activePreset: preset }),
  setExportScale: (scale) => set({ exportScale: scale }),
  setTransparentBg: (val) => set({ transparentBg: val }),
}));
