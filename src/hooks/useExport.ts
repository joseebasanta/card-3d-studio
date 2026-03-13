import { useCallback } from 'react';
import * as THREE from 'three';
import { useCardStore } from './useCardStore';

export function useExport() {
  const exportScale = useCardStore((s) => s.exportScale);
  const transparentBg = useCardStore((s) => s.transparentBg);

  const exportPNG = useCallback(
    (gl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => {
      const canvas = gl.domElement;
      const baseW = canvas.clientWidth;
      const baseH = canvas.clientHeight;
      const aspect = baseW / baseH;

      let w: number, h: number;

      switch (exportScale) {
        case '1x':
          w = baseW;
          h = baseH;
          break;
        case '2x':
          w = baseW * 2;
          h = baseH * 2;
          break;
        case '3x':
          w = baseW * 3;
          h = baseH * 3;
          break;
        case '4k':
          // Maintain aspect ratio at 4K width
          w = 3840;
          h = Math.round(3840 / aspect);
          break;
        default:
          w = baseW * 2;
          h = baseH * 2;
      }

      // Save current state
      const prevPixelRatio = gl.getPixelRatio();
      const prevClearAlpha = gl.getClearAlpha();
      const prevClearColor = new THREE.Color();
      gl.getClearColor(prevClearColor);
      const prevSize = gl.getSize(new THREE.Vector2());

      // Update camera aspect for the new resolution
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }

      // Set export size
      gl.setPixelRatio(1);
      gl.setSize(w, h, false);

      if (transparentBg) {
        const prevBg = scene.background;
        scene.background = null;
        gl.setClearAlpha(0);
        gl.setClearColor(new THREE.Color(0x000000), 0);
        gl.render(scene, camera);
        scene.background = prevBg;
      } else {
        gl.render(scene, camera);
      }

      const dataURL = gl.domElement.toDataURL('image/png');

      // Restore previous state
      gl.setPixelRatio(prevPixelRatio);
      gl.setSize(prevSize.x, prevSize.y, false);
      gl.setClearColor(prevClearColor, prevClearAlpha);

      // Restore camera
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = baseW / baseH;
        camera.updateProjectionMatrix();
      }

      // Re-render at original size
      gl.render(scene, camera);

      // Download
      const link = document.createElement('a');
      link.download = `card-studio-${w}x${h}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [exportScale, transparentBg]
  );

  return { exportPNG };
}
