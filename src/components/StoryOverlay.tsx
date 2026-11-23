import { ChevronRight, FastForward } from 'lucide-react';
import { SPEAKERS } from '../data/gameContent';
import type { DialogueLine, GenreTheme } from '../types/game';
import { BandAvatar } from './BandAvatars';

interface StoryOverlayProps {
  venueName: string;
  stageNumber: number;
  totalStages: number;
  genreTheme: GenreTheme;
  lines: DialogueLine[];
  lineIndex: number;
  isOutro?: boolean;
  onNext: () => void;
  onSkip: () => void;
}

export function StoryOverlay({
  venueName,
  stageNumber,
  totalStages,
  genreTheme,
  lines,
  lineIndex,
  isOutro = false,
  onNext,
  onSkip,
}: StoryOverlayProps) {
  const current = lines[Math.min(lineIndex, lines.length - 1)];
  const speakerInfo = SPEAKERS[current.speaker];
  const isLast = lineIndex >= lines.length - 1;

  return (
    <div
      className="relative z-20 flex flex-col justify-end items-center h-full w-full px-4 pb-6 pt-16 sm:px-6 sm:pb-10"
      onClick={onNext}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNext();
        }
      }}
      aria-label="Diyaloğu ilerlet"
    >
      {/* Center stage announcement */}
      <div className="my-auto text-center max-w-xl px-4">
        <p className="text-xs sm:text-sm font-medium text-stone-300 tracking-wide">
          Sahne {stageNumber}/{totalStages} · {genreTheme.bandName}
        </p>
        <h2 className="mt-1.5 font-display text-3xl sm:text-5xl font-black text-stone-50 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] text-balance">
          {venueName}
        </h2>
        <p className="mt-2 text-sm text-amber-200/90 font-medium">
          {isOutro ? 'Sahne Tamamlandı!' : 'Sahne Öncesi Kulis'}
        </p>
      </div>

      {/* Single-tap comic dialogue box */}
      <div
        className="w-full max-w-2xl rounded-2xl bg-stone-950/92 border border-stone-700/90 p-4 sm:p-5 shadow-2xl"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
      >
        <div className="flex items-start gap-3.5 sm:gap-4">
          <BandAvatar speaker={current.speaker} mood={current.mood} size={68} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="font-bold text-stone-100">{speakerInfo.name}</span>
                <span aria-hidden="true" className="text-stone-600">·</span>
                <span className="text-stone-400">{speakerInfo.role}</span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSkip();
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-stone-300 hover:text-white rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Geç</span>
              </button>
            </div>

            <p className="mt-2 text-sm sm:text-base text-stone-100 leading-relaxed">
              “{current.text}”
            </p>

            <div className="mt-3.5 flex items-center justify-between gap-3">
              <span className="text-xs text-stone-400 font-mono-num">
                {lineIndex + 1} / {lines.length}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${genreTheme.accentBg}`}
              >
                <span>
                  {isLast ? (isOutro ? 'Sonraki Sahneye Geç' : 'Görevi Başlat') : 'Devam Et'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
