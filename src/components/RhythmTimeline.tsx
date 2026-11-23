import { DRUM_BY_ID } from '../data/gameContent';
import type { DrumId, MissionSpec, PlayPhase } from '../types/game';

interface RhythmTimelineProps {
  mission: MissionSpec;
  playPhase: PlayPhase;
  activeStep: number | null;
  selections: Record<number, DrumId | undefined>;
  focusedMissingStep: number | null;
  onFocusMissingStep: (step: number) => void;
}

function getStepLabel(step: number, totalSteps: 8 | 16): string {
  if (totalSteps === 8) {
    return step % 2 === 0 ? String(step / 2 + 1) : '&';
  }
  const sub = step % 4;
  if (sub === 0) return String(step / 4 + 1);
  if (sub === 2) return '&';
  return '·';
}

const DRUM_ORDER: DrumId[] = [
  'crash',
  'hihatOpen',
  'hihatClosed',
  'tom',
  'snare',
  'kick',
];

export function RhythmTimeline({
  mission,
  playPhase,
  activeStep,
  selections,
  focusedMissingStep,
  onFocusMissingStep,
}: RhythmTimelineProps) {
  const missingMap = new Map<number, DrumId>();
  mission.missingSlots.forEach((slot) => missingMap.set(slot.step, slot.expectedDrum));

  const showExpectedInMissing = playPhase === 'LISTENING_FULL';

  return (
    <div className="w-full rounded-2xl bg-stone-950/80 border border-stone-700/70 px-3 py-3 sm:px-4 sm:py-3.5 shadow-lg">
      {/* Timeline header row */}
      <div className="flex items-center justify-between gap-2 mb-2.5 text-xs">
        <div className="flex items-center gap-2 text-stone-300 font-medium">
          <span>Ritim Şeridi</span>
          <span aria-hidden="true" className="text-stone-600">·</span>
          <span className="font-mono-num text-stone-400">{mission.bpm} BPM</span>
          <span aria-hidden="true" className="text-stone-600">·</span>
          <span className="font-mono-num text-stone-400">{mission.steps} Adım</span>
        </div>

        <div className="text-xs font-semibold text-amber-300 truncate">
          {playPhase === 'LISTENING_FULL' && 'Tam kalıp çalınıyor — dikkatle dinle'}
          {playPhase === 'LISTENING_GAP' && 'Eksik vuruşlu kalıp çalınıyor...'}
          {playPhase === 'VERIFYING' && 'Seçimin kontrol ediliyor...'}
          {playPhase === 'READY' && 'Başlamak için Tam Kalıbı Dinle'}
          {playPhase === 'SOLVING' &&
            (mission.missingSlots.length > 1
              ? 'Eksik ? kutularını sırayla doldur'
              : 'Eksik ? vuruşuna uygun davulu seç')}
        </div>
      </div>

      {/* Beat steps grid */}
      <div
        className={`grid gap-1.5 sm:gap-2 ${
          mission.steps === 16 ? 'grid-cols-8 lg:grid-cols-16' : 'grid-cols-8'
        }`}
      >
        {Array.from({ length: mission.steps }, (_, stepIdx) => {
          const isCurrent = activeStep === stepIdx;
          const isDownbeat = mission.steps === 16 ? stepIdx % 4 === 0 : stepIdx % 2 === 0;
          const isMissing = missingMap.has(stepIdx);
          const expectedDrum = missingMap.get(stepIdx);
          const pickedDrum = selections[stepIdx];
          const isFocusedTarget = isMissing && focusedMissingStep === stepIdx;

          // Collect visible non-missing drums on this step
          const activeDrums: DrumId[] = [];
          for (const d of DRUM_ORDER) {
            const hits = mission.pattern[d];
            if (!hits || !hits.includes(stepIdx)) continue;
            if (isMissing && d === expectedDrum && !showExpectedInMissing) {
              continue;
            }
            activeDrums.push(d);
          }

          const pickedMeta = pickedDrum ? DRUM_BY_ID[pickedDrum] : null;

          return (
            <button
              key={stepIdx}
              type="button"
              disabled={!isMissing}
              onClick={() => isMissing && onFocusMissingStep(stepIdx)}
              aria-label={
                isMissing
                  ? `Adım ${stepIdx + 1}: Eksik vuruş${pickedMeta ? `, seçilen: ${pickedMeta.name}` : ''}`
                  : `Adım ${stepIdx + 1}`
              }
              className={`relative flex flex-col items-center justify-between rounded-xl p-1.5 min-h-[68px] sm:min-h-[78px] transition-transform duration-150 border ${
                isCurrent
                  ? 'border-amber-300 bg-amber-500/20 animate-step-pop shadow-[0_0_16px_rgba(251,191,36,0.28)]'
                  : isMissing
                    ? isFocusedTarget
                      ? 'border-amber-400 bg-amber-500/15 ring-2 ring-amber-400/70 cursor-pointer'
                      : 'border-amber-500/50 bg-stone-900/90 hover:border-amber-400 cursor-pointer'
                    : isDownbeat
                      ? 'border-stone-700/80 bg-stone-900/75'
                      : 'border-stone-800/70 bg-stone-950/60'
              }`}
            >
              {/* Beat count header */}
              <span
                className={`text-[11px] font-mono-num leading-none ${
                  isCurrent
                    ? 'text-amber-200 font-bold'
                    : isDownbeat
                      ? 'text-stone-200 font-semibold'
                      : 'text-stone-500'
                }`}
              >
                {getStepLabel(stepIdx, mission.steps)}
              </span>

              {/* Center slot content */}
              <div className="flex flex-col items-center justify-center gap-1 my-auto w-full">
                {isMissing && !showExpectedInMissing ? (
                  pickedMeta ? (
                    <div
                      className="flex flex-col items-center justify-center w-full py-0.5 rounded-lg"
                      style={{
                        backgroundColor: `${pickedMeta.colorHex}26`,
                        border: `1px solid ${pickedMeta.colorHex}99`,
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full mb-0.5"
                        style={{ backgroundColor: pickedMeta.colorHex }}
                      />
                      <span className="text-[10px] font-bold text-stone-100 truncate max-w-full px-0.5">
                        {pickedMeta.shortName}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/20 border border-dashed border-amber-400 text-amber-300 font-display font-black text-base animate-missing-pulse">
                      ?
                    </div>
                  )
                ) : activeDrums.length > 0 ? (
                  <div className="flex flex-wrap items-center justify-center gap-1">
                    {activeDrums.map((drumId) => {
                      const meta = DRUM_BY_ID[drumId];
                      const isTargetReveal = isMissing && drumId === expectedDrum && showExpectedInMissing;
                      return (
                        <span
                          key={drumId}
                          title={meta.name}
                          className={`inline-flex items-center justify-center rounded-md px-1 py-0.5 text-[9px] font-bold leading-none ${
                            isTargetReveal ? 'ring-1 ring-white scale-105' : ''
                          }`}
                          style={{
                            backgroundColor: `${meta.colorHex}30`,
                            color: meta.colorHex,
                            border: `1px solid ${meta.colorHex}70`,
                          }}
                        >
                          {meta.shortName.slice(0, 2).toUpperCase()}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-800" />
                )}
              </div>

              {/* Missing indicator underline */}
              {isMissing ? (
                <span className="text-[9px] font-bold tracking-wide text-amber-300 leading-none">
                  {showExpectedInMissing ? 'DİNLE' : pickedMeta ? 'SEÇİLDİ' : 'EKSİK'}
                </span>
              ) : (
                <span className="h-2" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
