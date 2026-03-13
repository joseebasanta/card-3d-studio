import { useRef } from 'react';
import { useCardStore } from '../../hooks/useCardStore';

const swatches = [
  { color: '#ffffff', label: 'White' },
  { color: '#1a1a1a', label: 'Charcoal' },
  { color: '#333333', label: 'Dark' },
  { color: '#000000', label: 'Black' },
  { color: '#87CEEB', label: 'Sky' },
  { color: 'checker', label: 'Checker' },
];

export function BackgroundPicker() {
  const { backgroundColor, setBackgroundColor } = useCardStore();
  const colorRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
        Background
      </h3>
      <div className="flex gap-2 flex-wrap">
        {swatches.map((s) => (
          <button
            key={s.color}
            onClick={() => setBackgroundColor(s.color)}
            className={`w-7 h-7 rounded-lg transition-all duration-200 ${
              backgroundColor === s.color
                ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-black scale-110'
                : 'ring-1 ring-white/10 hover:ring-white/30'
            }`}
            style={{
              background:
                s.color === 'checker'
                  ? 'repeating-conic-gradient(#808080 0% 25%, #c0c0c0 0% 50%) 50% / 8px 8px'
                  : s.color,
            }}
            title={s.label}
          />
        ))}
        <button
          onClick={() => {
            setTimeout(() => colorRef.current?.click(), 50);
          }}
          className={`w-7 h-7 rounded-lg transition-all duration-200 flex items-center justify-center text-[10px] ${
            !swatches.some((s) => s.color === backgroundColor)
              ? 'ring-2 ring-white/70 ring-offset-1 ring-offset-black scale-110'
              : 'ring-1 ring-white/10 hover:ring-white/30'
          }`}
          style={{
            background: !swatches.some((s) => s.color === backgroundColor)
              ? backgroundColor
              : 'conic-gradient(#ff4444, #44ff44, #4444ff, #ff4444)',
          }}
          title="Custom"
        >
          {swatches.some((s) => s.color === backgroundColor) && (
            <span className="text-white font-bold text-[9px] drop-shadow-md">+</span>
          )}
        </button>
        <input
          ref={colorRef}
          type="color"
          className="hidden"
          value={backgroundColor === 'checker' ? '#808080' : backgroundColor}
          onChange={(e) => setBackgroundColor(e.target.value)}
        />
      </div>
    </div>
  );
}
