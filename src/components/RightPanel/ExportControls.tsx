import { useCardStore } from '../../hooks/useCardStore';
import type { ExportScale } from '../../hooks/useCardStore';
import { Toggle } from '../ui/Toggle';

const scales: { id: ExportScale; label: string }[] = [
  { id: '1x', label: '1×' },
  { id: '2x', label: '2×' },
  { id: '3x', label: '3×' },
  { id: '4k', label: '4K' },
];

export function ExportControls() {
  const { exportScale, setExportScale, transparentBg, setTransparentBg } =
    useCardStore();

  const handleDownload = () => {
    (window as any).__cardStudioExport?.();
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
        Export
      </h3>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-widest text-white/40">
          Resolution
        </span>
        <div className="flex gap-1.5">
          {scales.map((s) => (
            <button
              key={s.id}
              onClick={() => setExportScale(s.id)}
              className={`flex-1 py-1.5 rounded-md text-[11px] font-medium tracking-wide transition-all duration-200 ${
                exportScale === s.id
                  ? 'bg-white/[0.12] text-white border border-white/25'
                  : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-white/[0.07] hover:text-white/60'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <Toggle
        label="Transparent BG"
        checked={transparentBg}
        onChange={() => setTransparentBg(!transparentBg)}
      />

      <button
        onClick={handleDownload}
        className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-[11px] uppercase tracking-[0.12em] hover:bg-white/90 active:bg-white/80 transition-all duration-200 mt-1"
      >
        Download PNG
      </button>
    </div>
  );
}
