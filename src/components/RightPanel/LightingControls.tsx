import { useCardStore } from '../../hooks/useCardStore';
import { Slider } from '../ui/Slider';

export function LightingControls() {
  const { keyLightIntensity, fillLightIntensity, rimLightIntensity, setLighting } =
    useCardStore();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
        Lighting
      </h3>
      <Slider
        label="Key Light"
        value={keyLightIntensity}
        min={0}
        max={3}
        onChange={(v) => setLighting('keyLightIntensity', v)}
      />
      <Slider
        label="Fill Light"
        value={fillLightIntensity}
        min={0}
        max={2}
        onChange={(v) => setLighting('fillLightIntensity', v)}
      />
      <Slider
        label="Rim Light"
        value={rimLightIntensity}
        min={0}
        max={2}
        onChange={(v) => setLighting('rimLightIntensity', v)}
      />
    </div>
  );
}
