interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={onChange}
      className="flex items-center justify-between w-full py-2 group"
    >
      <span className="text-[11px] uppercase tracking-wider text-white/70 font-medium group-hover:text-white transition-colors duration-200">
        {label}
      </span>
      <div
        className={`w-9 h-[20px] rounded-full relative transition-all duration-300 ease-out ${
          checked
            ? 'bg-white/90'
            : 'bg-white/10'
        }`}
      >
        <div
          className={`absolute top-[3px] w-[14px] h-[14px] rounded-full transition-all duration-300 ease-out ${
            checked
              ? 'left-[19px] bg-black'
              : 'left-[3px] bg-white/40'
          }`}
        />
      </div>
    </button>
  );
}
