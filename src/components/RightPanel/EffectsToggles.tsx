import { useCardStore } from '../../hooks/useCardStore';
import { Toggle } from '../ui/Toggle';

export function EffectsToggles() {
  const {
    dropShadow,
    floatAnimation,
    shimmerSweep,
    lightParallax,
    metallicEdge,
    toggleEffect,
  } = useCardStore();

  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white mb-0.5">
        Effects
      </h3>
      <Toggle
        label="Drop Shadow"
        checked={dropShadow}
        onChange={() => toggleEffect('dropShadow')}
      />
      <Toggle
        label="Float Animation"
        checked={floatAnimation}
        onChange={() => toggleEffect('floatAnimation')}
      />
      <Toggle
        label="Shimmer Sweep"
        checked={shimmerSweep}
        onChange={() => toggleEffect('shimmerSweep')}
      />
      <Toggle
        label="Light Parallax"
        checked={lightParallax}
        onChange={() => toggleEffect('lightParallax')}
      />
      <Toggle
        label="Metallic Edge"
        checked={metallicEdge}
        onChange={() => toggleEffect('metallicEdge')}
      />
    </div>
  );
}
