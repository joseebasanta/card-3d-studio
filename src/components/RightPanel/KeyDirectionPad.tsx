import { useRef, useCallback, useState } from 'react';
import { useCardStore } from '../../hooks/useCardStore';

export function KeyDirectionPad() {
  const { keyDirection, setKeyDirection } = useCardStore();
  const padRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!padRef.current) return;
      const rect = padRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
      setKeyDirection({ x, y });
    },
    [setKeyDirection]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      updatePosition(e.clientX, e.clientY);
    },
    [updatePosition]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      updatePosition(e.clientX, e.clientY);
    },
    [isDragging, updatePosition]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const dotX = keyDirection.x * 100;
  const dotY = (1 - keyDirection.y) * 100;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
        Key Direction
      </h3>
      <div
        ref={padRef}
        className="relative w-full aspect-square rounded-full cursor-crosshair overflow-hidden select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          maxWidth: 130,
          margin: '0 auto',
          background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Crosshair */}
        <div className="absolute top-1/2 left-2 right-2 h-px bg-white/[0.06]" />
        <div className="absolute left-1/2 top-2 bottom-2 w-px bg-white/[0.06]" />

        {/* Outer ring hint */}
        <div className="absolute inset-2 rounded-full border border-white/[0.04]" />

        {/* Glow behind dot */}
        <div
          className="absolute w-10 h-10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-200"
          style={{
            left: `${dotX}%`,
            top: `${dotY}%`,
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            opacity: isDragging ? 1 : 0.6,
          }}
        />

        {/* Dot */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full -translate-x-1/2 -translate-y-1/2 bg-white transition-all duration-150"
          style={{
            left: `${dotX}%`,
            top: `${dotY}%`,
            boxShadow: isDragging
              ? '0 0 12px rgba(255,255,255,0.4), 0 0 4px rgba(255,255,255,0.6)'
              : '0 1px 4px rgba(0,0,0,0.5)',
            transform: `translate(-50%, -50%) scale(${isDragging ? 1.2 : 1})`,
          }}
        />
      </div>
    </div>
  );
}
