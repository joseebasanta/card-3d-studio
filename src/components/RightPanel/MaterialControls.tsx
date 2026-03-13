import { useCardStore } from '../../hooks/useCardStore';
import { Slider } from '../ui/Slider';

export function MaterialControls() {
  const { metalness, roughness, clearcoat, iridescence, setMaterial } =
    useCardStore();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
        Material
      </h3>
      <Slider
        label="Metalness"
        value={metalness}
        min={0}
        max={1}
        onChange={(v) => setMaterial('metalness', v)}
      />
      <Slider
        label="Roughness"
        value={roughness}
        min={0}
        max={1}
        onChange={(v) => setMaterial('roughness', v)}
      />
      <Slider
        label="Clearcoat"
        value={clearcoat}
        min={0}
        max={1}
        onChange={(v) => setMaterial('clearcoat', v)}
      />
      <Slider
        label="Iridescence"
        value={iridescence}
        min={0}
        max={1}
        onChange={(v) => setMaterial('iridescence', v)}
      />
    </div>
  );
}
