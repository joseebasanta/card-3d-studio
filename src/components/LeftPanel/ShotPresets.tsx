import { useCardStore } from '../../hooks/useCardStore';
import type { ShotPreset } from '../../hooks/useCardStore';

const presets: { id: ShotPreset; label: string; icon: string }[] = [
  { id: 'hero', label: 'Hero', icon: '◆' },
  { id: 'float', label: 'Float', icon: '◇' },
  { id: 'portrait', label: 'Portrait', icon: '▯' },
  { id: 'drama', label: 'Drama', icon: '◤' },
  { id: 'overhead', label: 'Overhead', icon: '◉' },
  { id: 'stack', label: 'Stack', icon: '▤' },
];

export function ShotPresets() {
  const { activePreset, setActivePreset } = useCardStore();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
        Shot Presets
      </h3>
      <div className="grid grid-cols-3 gap-1.5">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePreset(p.id)}
            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg text-[10px] uppercase tracking-wider font-medium transition-all duration-200 ${
              activePreset === p.id
                ? 'bg-white/[0.12] text-white border border-white/25'
                : 'bg-white/[0.03] text-white/45 border border-white/[0.06] hover:bg-white/[0.07] hover:text-white/70 hover:border-white/15'
            }`}
          >
            <span className="text-sm leading-none">{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
