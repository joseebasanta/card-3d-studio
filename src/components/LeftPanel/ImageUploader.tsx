import { useCallback, useRef, useState } from 'react';
import { useCardStore } from '../../hooks/useCardStore';

interface DropZoneProps {
  label: string;
  image: string | null;
  onUpload: (dataUrl: string, aspect: number) => void;
  onClear: () => void;
}

function DropZone({ label, image, onUpload, onClear }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          onUpload(url, img.width / img.height);
        };
        img.src = url;
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith('image/')) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">
        {label}
      </span>
      {image ? (
        <div className="relative group rounded-lg overflow-hidden">
          <img
            src={image}
            alt={label}
            className="w-full h-[72px] object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200" />
          <button
            onClick={onClear}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white/60 hover:text-white hover:bg-black/90 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={`h-[72px] border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-white/50 bg-white/[0.06]'
              : 'border-white/15 hover:border-white/30 hover:bg-white/[0.03]'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30 mb-1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          <span className="text-[10px] text-white/35 font-medium">Drop image or click</span>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}

export function ImageUploader() {
  const { frontImage, backImage, setFrontImage, setBackImage } = useCardStore();

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
        Card Image
      </h3>
      <DropZone
        label="Front"
        image={frontImage}
        onUpload={(url, aspect) => setFrontImage(url, aspect)}
        onClear={() => setFrontImage(null)}
      />
      <DropZone
        label="Back"
        image={backImage}
        onUpload={(url) => setBackImage(url)}
        onClear={() => setBackImage(null)}
      />
    </div>
  );
}
