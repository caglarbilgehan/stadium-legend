import type { PointerEvent } from 'react';
import { DRUMS } from '../data/gameContent';
import type { DrumId } from '../types/game';

interface DrumKitPadProps {
  selectedDrum: DrumId | null;
  activeDrums: Record<DrumId, number>;
  disabled?: boolean;
  onHitDrum: (drum: DrumId, clientX: number, clientY: number) => void;
}

function DrumIllustration({ id, color }: { id: DrumId; color: string }) {
  switch (id) {
    case 'crash':
      return (
        <svg viewBox="0 0 88 58" className="w-16 h-11 sm:w-20 sm:h-12" aria-hidden="true">
          <line x1="44" y1="24" x2="44" y2="55" stroke="#a8a29e" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="44" cy="24" rx="34" ry="11" fill={color} opacity="0.28" stroke={color} strokeWidth="2.5" />
          <ellipse cx="44" cy="23" rx="22" ry="6" fill="none" stroke="#fef3c7" strokeWidth="1.2" opacity="0.7" />
          <ellipse cx="44" cy="22" rx="8" ry="3.5" fill={color} stroke="#1c1917" strokeWidth="1.5" />
        </svg>
      );
    case 'hihatOpen':
      return (
        <svg viewBox="0 0 88 58" className="w-16 h-11 sm:w-20 sm:h-12" aria-hidden="true">
          <line x1="44" y1="12" x2="44" y2="55" stroke="#a8a29e" strokeWidth="3.2" strokeLinecap="round" />
          {/* Separated top and bottom cymbals */}
          <ellipse cx="44" cy="30" rx="28" ry="7.5" fill={color} opacity="0.22" stroke={color} strokeWidth="2" />
          <ellipse cx="44" cy="20" rx="28" ry="7.5" fill={color} opacity="0.34" stroke={color} strokeWidth="2.4" />
          {/* Shimmer lines */}
          <path d="M12 24 L17 25 M71 25 L76 24" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'hihatClosed':
      return (
        <svg viewBox="0 0 88 58" className="w-16 h-11 sm:w-20 sm:h-12" aria-hidden="true">
          <line x1="44" y1="14" x2="44" y2="55" stroke="#a8a29e" strokeWidth="3.2" strokeLinecap="round" />
          {/* Tightly closed cymbals */}
          <ellipse cx="44" cy="27" rx="27" ry="7" fill={color} opacity="0.25" stroke={color} strokeWidth="2" />
          <ellipse cx="44" cy="24" rx="27" ry="7" fill={color} opacity="0.35" stroke={color} strokeWidth="2.4" />
          <circle cx="44" cy="23" r="3" fill="#e0f2fe" />
        </svg>
      );
    case 'tom':
      return (
        <svg viewBox="0 0 88 58" className="w-16 h-11 sm:w-20 sm:h-12" aria-hidden="true">
          <path d="M22 18 L22 42 C22 48, 66 48, 66 42 L66 18 Z" fill={color} opacity="0.28" stroke={color} strokeWidth="2.2" />
          <ellipse cx="44" cy="18" rx="22" ry="8" fill="#f5f5f4" fillOpacity="0.92" stroke={color} strokeWidth="2.5" />
          <line x1="31" y1="26" x2="31" y2="44" stroke="#e9d5ff" strokeWidth="1.5" opacity="0.7" />
          <line x1="57" y1="26" x2="57" y2="44" stroke="#e9d5ff" strokeWidth="1.5" opacity="0.7" />
        </svg>
      );
    case 'snare':
      return (
        <svg viewBox="0 0 88 58" className="w-16 h-11 sm:w-20 sm:h-12" aria-hidden="true">
          <path d="M18 22 L18 38 C18 44, 70 44, 70 38 L70 22 Z" fill={color} opacity="0.3" stroke={color} strokeWidth="2.3" />
          <ellipse cx="44" cy="22" rx="26" ry="9" fill="#fff1f2" fillOpacity="0.95" stroke={color} strokeWidth="2.6" />
          {/* Snare lugs */}
          <line x1="27" y1="29" x2="27" y2="40" stroke="#fecdd3" strokeWidth="2" />
          <line x1="44" y1="31" x2="44" y2="42" stroke="#fecdd3" strokeWidth="2" />
          <line x1="61" y1="29" x2="61" y2="40" stroke="#fecdd3" strokeWidth="2" />
          {/* Stand */}
          <line x1="44" y1="43" x2="44" y2="55" stroke="#a8a29e" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'kick':
      return (
        <svg viewBox="0 0 88 58" className="w-16 h-11 sm:w-20 sm:h-12" aria-hidden="true">
          <circle cx="44" cy="29" r="22" fill={color} opacity="0.28" stroke={color} strokeWidth="2.8" />
          <circle cx="44" cy="29" r="16" fill="#1c1917" stroke="#fed7aa" strokeWidth="2" />
          {/* Kick pedal beater */}
          <line x1="44" y1="53" x2="44" y2="33" stroke="#e7e5e4" strokeWidth="3" strokeLinecap="round" />
          <circle cx="44" cy="31" r="4.5" fill={color} stroke="#fff7ed" strokeWidth="1.5" />
        </svg>
      );
  }
}

export function DrumKitPad({
  selectedDrum,
  activeDrums,
  disabled = false,
  onHitDrum,
}: DrumKitPadProps) {
  const handlePointer = (drumId: DrumId) => (e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX || rect.left + rect.width / 2;
    const cy = e.clientY || rect.top + rect.height / 2;
    onHitDrum(drumId, cx, cy);
  };

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 w-full">
      {DRUMS.map((drum) => {
        const isSelected = selectedDrum === drum.id;
        const hitTick = activeDrums[drum.id] || 0;

        return (
          <button
            key={`${drum.id}-${hitTick}`}
            type="button"
            disabled={disabled}
            onPointerDown={handlePointer(drum.id)}
            aria-label={`${drum.name} — Kısayol ${drum.keyHint}`}
            className={`group relative flex flex-col items-center justify-between rounded-2xl px-2 py-2.5 sm:px-3 sm:py-3.5 min-h-[104px] sm:min-h-[126px] border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 ${
              hitTick > 0 ? 'animate-drum-hit' : ''
            } ${
              isSelected
                ? `bg-stone-800/95 border-stone-200 ring-2 ${drum.ringClass} shadow-lg`
                : 'bg-stone-900/85 border-stone-700/80 hover:bg-stone-800/90 hover:border-stone-500'
            } ${disabled ? 'opacity-65 cursor-not-allowed' : 'cursor-pointer active:scale-[0.96]'}`}
          >
            {/* Keycap hint (desktop keyboard play) */}
            <span className="absolute top-2 right-2 text-[10px] font-mono-num font-bold text-stone-400 bg-stone-950/80 border border-stone-700/80 rounded px-1.5 py-0.5 leading-none">
              {drum.keyHint}
            </span>

            {/* Drum custom SVG */}
            <div className="mt-1 mb-1">
              <DrumIllustration id={drum.id} color={drum.colorHex} />
            </div>

            {/* Drum label */}
            <div className="flex flex-col items-center text-center w-full">
              <span className="text-xs sm:text-sm font-bold text-stone-100 leading-tight whitespace-nowrap truncate max-w-full">
                {drum.shortName}
              </span>
              <span
                className="text-[10px] font-medium leading-tight mt-0.5 whitespace-nowrap"
                style={{ color: drum.colorHex }}
              >
                {isSelected ? 'Seçildi' : 'Dinle / Seç'}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
