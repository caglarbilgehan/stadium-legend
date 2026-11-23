import { Award, Play, RotateCcw, Sparkles, Trophy, Volume2, VolumeX } from 'lucide-react';
import type { GenreTheme, MissionSpec } from '../types/game';
import { BadgeIcon, BandAvatar } from './BandAvatars';

interface PauseModalProps {
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onResume: () => void;
  onRestartStage: () => void;
  onBackToTitle: () => void;
}

export function PauseModal({
  audioEnabled,
  onToggleAudio,
  onResume,
  onRestartStage,
  onBackToTitle,
}: PauseModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/82 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-stone-900 border border-stone-700 p-6 shadow-2xl">
        <h2 className="font-display text-2xl font-black text-stone-100 text-center">
          Mola Verildi
        </h2>
        <p className="mt-1 text-sm text-stone-400 text-center">
          Seyirciler seni bekliyor — hazır olunca devam et.
        </p>

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Devam Et</span>
          </button>

          <button
            type="button"
            onClick={onToggleAudio}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
            <span>Ses: {audioEnabled ? 'Açık' : 'Kapalı'}</span>
          </button>

          <button
            type="button"
            onClick={onRestartStage}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sahneyi Yeniden Başlat</span>
          </button>

          <button
            type="button"
            onClick={onBackToTitle}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 font-medium text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Ana Menüye Dön
          </button>
        </div>
      </div>
    </div>
  );
}

interface StageClearModalProps {
  mission: MissionSpec;
  genreTheme: GenreTheme;
  earnedPoints: number;
  streakBonus: number;
  onContinue: () => void;
  onReplayGroove: () => void;
}

export function StageClearModal({
  mission,
  genreTheme,
  earnedPoints,
  streakBonus,
  onContinue,
  onReplayGroove,
}: StageClearModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/82 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-stone-900 border border-amber-500/50 p-5 sm:p-6 shadow-2xl">
        <div className="flex items-start gap-3.5">
          <BandAvatar speaker="batu" mood="happy" size={60} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-emerald-400">
              Tam İsabet! · {mission.venueName}
            </p>
            <h2 className="font-display text-2xl font-black text-stone-50 leading-tight mt-0.5">
              {mission.successQuip}
            </h2>
          </div>
        </div>

        {/* Educational Musical Feedback */}
        <div className="mt-4 rounded-xl bg-stone-950/85 border border-stone-700/80 p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Neden Doğru Oldu?</span>
          </div>
          <p className="text-sm text-stone-200 leading-relaxed">{mission.musicalLesson}</p>
        </div>

        {/* Badge & Score summary */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5">
          <div className="flex items-center gap-3">
            <BadgeIcon type={mission.badge.icon} size={42} />
            <div>
              <p className="text-xs text-amber-300 font-semibold">Rozet Kazanıldı</p>
              <p className="text-sm font-bold text-stone-100">{mission.badge.title}</p>
              <p className="text-xs text-stone-400">{mission.badge.subtitle}</p>
            </div>
          </div>

          <div className="flex sm:flex-col items-baseline sm:items-end justify-between border-t sm:border-t-0 border-amber-500/20 pt-2 sm:pt-0">
            <span className="text-xs text-stone-400">Sahne Puanı</span>
            <span className="font-mono-num text-xl font-black text-amber-300">
              +{earnedPoints + streakBonus}
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onReplayGroove}
            className="w-full sm:w-auto px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Tam Kalıbı Dinle
          </button>
          <button
            type="button"
            onClick={onContinue}
            className={`w-full sm:flex-1 px-5 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${genreTheme.accentBg}`}
          >
            Kulise Geç
          </button>
        </div>
      </div>
    </div>
  );
}

interface EnergyOutModalProps {
  mission: MissionSpec;
  onRetry: () => void;
  onBackToTitle: () => void;
}

export function EnergyOutModal({ mission, onRetry, onBackToTitle }: EnergyOutModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/85 p-4">
      <div className="w-full max-w-md rounded-2xl bg-stone-900 border border-rose-500/50 p-6 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <BandAvatar speaker="turgut" mood="shocked" size={62} />
          <div>
            <p className="text-xs font-semibold text-rose-400">Enerji Bitti</p>
            <h2 className="font-display text-2xl font-black text-stone-100">
              Sahne Işıkları Söndü!
            </h2>
          </div>
        </div>
        <p className="mt-3 text-sm text-stone-300 leading-relaxed">
          Merak etme, en büyük gruplar bile ilk provada tökezler. {mission.venueName} sahnesine taze enerjiyle anında geri dön!
        </p>

        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tekrar Dene</span>
          </button>
          <button
            type="button"
            onClick={onBackToTitle}
            className="px-4 py-3 rounded-xl border border-stone-700 hover:bg-stone-800 text-stone-300 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Ana Menü
          </button>
        </div>
      </div>
    </div>
  );
}

interface VictoryScreenProps {
  genreTheme: GenreTheme;
  score: number;
  highScore: number;
  badgesCount: number;
  onPlayAnotherGenre: () => void;
  onReplayCareer: () => void;
}

export function VictoryScreen({
  genreTheme,
  score,
  highScore,
  badgesCount,
  onPlayAnotherGenre,
  onReplayCareer,
}: VictoryScreenProps) {
  return (
    <div className="relative z-20 flex flex-col items-center justify-center h-full w-full px-4 py-6">
      <div className="w-full max-w-lg rounded-2xl bg-stone-950/90 border border-amber-400/50 p-6 sm:p-7 text-center shadow-2xl">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300">
          <Trophy className="w-8 h-8" />
        </div>

        <p className="mt-3 text-xs font-semibold text-amber-300 tracking-wide">
          {genreTheme.bandName} · {genreTheme.name}
        </p>
        <h2 className="mt-1 font-display text-3xl sm:text-4xl font-black text-stone-50 text-balance">
          Dünya Yıldızı Oldun!
        </h2>
        <p className="mt-2 text-sm text-stone-300 leading-relaxed">
          Garajdaki ilk backbeat’ten 50 bin kişilik stadyum finaline kadar tüm eksik vuruşları kulağınla yakaladın.
        </p>

        {/* Clean tabular stats */}
        <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-stone-900/90 border border-stone-800 p-3.5">
          <div>
            <p className="text-xs text-stone-400">Turne Puanı</p>
            <p className="mt-0.5 font-mono-num text-xl font-black text-amber-300">{score}</p>
          </div>
          <div className="border-x border-stone-800">
            <p className="text-xs text-stone-400">En Yüksek</p>
            <p className="mt-0.5 font-mono-num text-xl font-black text-stone-100">{highScore}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400">Rozetler</p>
            <p className="mt-0.5 font-mono-num text-xl font-black text-emerald-400 inline-flex items-center gap-1">
              <Award className="w-4 h-4" />
              {badgesCount}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onPlayAnotherGenre}
            className={`flex-1 px-5 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${genreTheme.accentBg}`}
          >
            Başka Tarzla Grup Kur
          </button>
          <button
            type="button"
            onClick={onReplayCareer}
            className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Tekrar Oyna
          </button>
        </div>
      </div>
    </div>
  );
}
