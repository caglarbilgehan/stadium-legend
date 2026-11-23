import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  Ear,
  Heart,
  HelpCircle,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { rhythmEngine } from './audio/rhythmEngine';
import { BandAvatar } from './components/BandAvatars';
import { CanvasFxOverlay, type CanvasFxHandle } from './components/CanvasFxOverlay';
import { DrumKitPad } from './components/DrumKitPad';
import {
  EnergyOutModal,
  PauseModal,
  StageClearModal,
  VictoryScreen,
} from './components/Modals';
import { RhythmTimeline } from './components/RhythmTimeline';
import { StoryOverlay } from './components/StoryOverlay';
import { TitleLogo } from './components/TitleLogo';
import {
  DRUMS,
  DRUM_BY_ID,
  GENRE_LIST,
  GENRE_THEMES,
  STAGE_BACKDROPS,
  getMissionsForGenre,
  getWrongAnswerHint,
} from './data/gameContent';
import { ytPlayables } from './sdk/ytPlayables';
import type {
  CharacterMood,
  DrumId,
  GameScreen,
  GenreId,
  PlayPhase,
  SavedProgress,
} from './types/game';

const MAX_ENERGY = 3;

const INITIAL_DRUM_TICKS: Record<DrumId, number> = {
  kick: 0,
  snare: 0,
  hihatClosed: 0,
  hihatOpen: 0,
  tom: 0,
  crash: 0,
};

export default function App() {
  // Core Game State Machine
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [selectedGenre, setSelectedGenre] = useState<GenreId>('rock');
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [dialogueIdx, setDialogueIdx] = useState<number>(0);

  // Active Mission State
  const [playPhase, setPlayPhase] = useState<PlayPhase>('READY');
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [selections, setSelections] = useState<Record<number, DrumId | undefined>>({});
  const [focusedMissingStep, setFocusedMissingStep] = useState<number | null>(null);
  const [activeDrumTicks, setActiveDrumTicks] = useState<Record<DrumId, number>>(INITIAL_DRUM_TICKS);
  const [lastAuditionedDrum, setLastAuditionedDrum] = useState<DrumId | null>(null);

  // Scoring, Energy & Feedback
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(MAX_ENERGY);
  const [lastStageEarned, setLastStageEarned] = useState<{ base: number; bonus: number }>({
    base: 0,
    bonus: 0,
  });
  const [feedbackBanner, setFeedbackBanner] = useState<{
    kind: 'info' | 'hint' | 'error';
    text: string;
    mood: CharacterMood;
  } | null>(null);
  const [shakeTick, setShakeTick] = useState<number>(0);

  // Overlays & System State
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isEnergyOut, setIsEnergyOut] = useState<boolean>(false);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => ytPlayables.isAudioEnabled());
  const [backdropFailed, setBackdropFailed] = useState<Record<string, boolean>>({});
  const [savedProgress, setSavedProgress] = useState<SavedProgress>({
    highScore: 0,
    unlockedBadges: [],
    completedGenres: [],
  });

  const fxRef = useRef<CanvasFxHandle | null>(null);
  const phaseTimeoutRef = useRef<number | null>(null);

  const genreTheme = GENRE_THEMES[selectedGenre];
  const missions = useMemo(() => getMissionsForGenre(selectedGenre), [selectedGenre]);
  const currentMission = missions[stageIdx] ?? missions[0];

  const clearPhaseTimeout = useCallback(() => {
    if (phaseTimeoutRef.current !== null) {
      window.clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
  }, []);

  // YouTube Playables SDK lifecycle & persistence bootstrap
  useEffect(() => {
    // Signal first frame ready right after initial paint
    const rafId = window.requestAnimationFrame(() => {
      ytPlayables.signalFirstFrameReady();
    });

    // Apply initial host audio preference (never starts AudioContext prematurely)
    const initialAudio = ytPlayables.isAudioEnabled();
    setAudioEnabled(initialAudio);
    rhythmEngine.setAudioEnabled(initialAudio);

    // Load saved progress asynchronously, then signal gameReady
    let mounted = true;
    ytPlayables
      .loadProgress()
      .then((data) => {
        if (!mounted) return;
        setSavedProgress(data);
        if (data.lastGenre) {
          setSelectedGenre(data.lastGenre);
        }
      })
      .finally(() => {
        ytPlayables.signalGameReady();
      });

    // Subscribe to YouTube Playables audio toggle & pause/resume lifecycle
    const unsubAudio = ytPlayables.subscribeAudioChange((enabled) => {
      setAudioEnabled(enabled);
      rhythmEngine.setAudioEnabled(enabled);
    });

    const unsubLifecycle = ytPlayables.subscribeLifecycle(
      () => {
        clearPhaseTimeout();
        rhythmEngine.handleHostPause();
        setActiveStep(null);
        setIsPaused((prev) => prev || true);
      },
      () => {
        rhythmEngine.handleHostResume();
      }
    );

    const handleBlur = () => {
      // Stop any ongoing sequencer cleanly if tab loses focus
      if (rhythmEngine.getIsPlaying()) {
        clearPhaseTimeout();
        rhythmEngine.stopPattern();
        setActiveStep(null);
        setPlayPhase((cur) => (cur === 'LISTENING_FULL' || cur === 'LISTENING_GAP' ? 'SOLVING' : cur));
      }
    };
    window.addEventListener('blur', handleBlur);

    return () => {
      mounted = false;
      window.cancelAnimationFrame(rafId);
      clearPhaseTimeout();
      rhythmEngine.stopPattern();
      unsubAudio();
      unsubLifecycle();
      window.removeEventListener('blur', handleBlur);
    };
  }, [clearPhaseTimeout]);

  const toggleAudio = useCallback(() => {
    rhythmEngine.unlock();
    setAudioEnabled((prev) => {
      const next = !prev;
      rhythmEngine.setAudioEnabled(next);
      if (next) {
        rhythmEngine.playUiTap();
      }
      return next;
    });
  }, []);

  const pulseDrumsVisual = useCallback((drums: DrumId[]) => {
    if (drums.length === 0) return;
    setActiveDrumTicks((prev) => {
      const next = { ...prev };
      drums.forEach((d) => {
        next[d] = (next[d] || 0) + 1;
      });
      return next;
    });
  }, []);

  // Plays full pattern, then automatically plays gap pattern for seamless ear-training flow
  const runFullThenGapDemo = useCallback(
    (missionToPlay = currentMission, genreToPlay = selectedGenre) => {
      clearPhaseTimeout();
      rhythmEngine.stopPattern();
      rhythmEngine.unlock();

      setPlayPhase('LISTENING_FULL');
      setFeedbackBanner({
        kind: 'info',
        text: '1. Adım: Önce tam ritim kalıbını dikkatle dinle...',
        mood: 'grooving',
      });

      rhythmEngine.startPattern({
        mission: missionToPlay,
        genre: genreToPlay,
        mode: 'full',
        loops: 1,
        onStep: (step, triggered) => {
          setActiveStep(step);
          pulseDrumsVisual(triggered);
        },
        onComplete: () => {
          setActiveStep(null);
          phaseTimeoutRef.current = window.setTimeout(() => {
            setPlayPhase('LISTENING_GAP');
            setFeedbackBanner({
              kind: 'info',
              text: '2. Adım: Şimdi eksik vuruşlu hali geliyor — hangi davul kayıp?',
              mood: 'shocked',
            });

            rhythmEngine.startPattern({
              mission: missionToPlay,
              genre: genreToPlay,
              mode: 'gap',
              loops: 1,
              onStep: (step, triggered) => {
                setActiveStep(step);
                pulseDrumsVisual(triggered);
              },
              onComplete: () => {
                setActiveStep(null);
                setPlayPhase('SOLVING');
                setFeedbackBanner({
                  kind: 'info',
                  text:
                    missionToPlay.missingSlots.length > 1
                      ? 'Davullara dokunarak seslerini test et, iki ? kutusunu doldurup onayla!'
                      : 'Davullara dokunarak seslerini test et ve eksik vuruşu seçip onayla!',
                  mood: 'idle',
                });
              },
            });
          }, 360);
        },
      });
    },
    [clearPhaseTimeout, currentMission, pulseDrumsVisual, selectedGenre]
  );

  const playSingleReference = useCallback(
    (mode: 'full' | 'gap') => {
      clearPhaseTimeout();
      rhythmEngine.stopPattern();
      rhythmEngine.unlock();

      setPlayPhase(mode === 'full' ? 'LISTENING_FULL' : 'LISTENING_GAP');
      rhythmEngine.startPattern({
        mission: currentMission,
        genre: selectedGenre,
        mode,
        loops: 1,
        onStep: (step, triggered) => {
          setActiveStep(step);
          pulseDrumsVisual(triggered);
        },
        onComplete: () => {
          setActiveStep(null);
          setPlayPhase('SOLVING');
        },
      });
    },
    [clearPhaseTimeout, currentMission, pulseDrumsVisual, selectedGenre]
  );

  const enterMission = useCallback(
    (idx: number, genreId: GenreId) => {
      const targetMission = getMissionsForGenre(genreId)[idx];
      clearPhaseTimeout();
      rhythmEngine.stopPattern();
      setStageIdx(idx);
      setSelections({});
      setFocusedMissingStep(targetMission.missingSlots[0]?.step ?? null);
      setLastAuditionedDrum(null);
      setActiveStep(null);
      setEnergy(MAX_ENERGY);
      setIsEnergyOut(false);
      setIsPaused(false);
      setPlayPhase('READY');
      setFeedbackBanner(null);
      setScreen('PLAYING');

      // Because enterMission is invoked directly from a user tap/click, Web Audio is unlocked!
      phaseTimeoutRef.current = window.setTimeout(() => {
        runFullThenGapDemo(targetMission, genreId);
      }, 220);
    },
    [clearPhaseTimeout, runFullThenGapDemo]
  );

  const startCareerWithGenre = useCallback(
    (genreId: GenreId) => {
      rhythmEngine.unlock();
      rhythmEngine.playUiTap();
      setSelectedGenre(genreId);
      setStageIdx(0);
      setScore(0);
      setStreak(0);
      setEnergy(MAX_ENERGY);
      setDialogueIdx(0);
      setScreen('STORY_INTRO');
    },
    []
  );

  // Auditions a quick genre preview beat when clicking a genre card
  const previewGenreSound = useCallback((genreId: GenreId) => {
    rhythmEngine.unlock();
    setSelectedGenre(genreId);
    rhythmEngine.triggerDrum('kick', genreId, 0.95);
    window.setTimeout(() => rhythmEngine.triggerDrum('hihatClosed', genreId, 0.7), 130);
    window.setTimeout(() => rhythmEngine.triggerDrum('snare', genreId, 0.95), 260);
  }, []);

  // Player taps/clicks or presses 1-6 on a drum pad
  const handleHitDrum = useCallback(
    (drum: DrumId, clientX?: number, clientY?: number) => {
      if (isPaused || isEnergyOut || screen !== 'PLAYING') return;
      rhythmEngine.unlock();
      rhythmEngine.triggerDrum(drum, selectedGenre, 1.0);
      pulseDrumsVisual([drum]);
      setLastAuditionedDrum(drum);

      const meta = DRUM_BY_ID[drum];
      if (typeof clientX === 'number' && typeof clientY === 'number') {
        fxRef.current?.spawnHitBurst(clientX, clientY, meta.colorHex);
      }

      // Only populate the focused ? slot when in SOLVING or READY phase
      if (playPhase === 'SOLVING' || playPhase === 'READY') {
        const targetStep =
          focusedMissingStep ?? currentMission.missingSlots[0]?.step ?? null;
        if (targetStep !== null) {
          setSelections((prev) => {
            const next = { ...prev, [targetStep]: drum };
            // If multi-missing mission, smoothly guide focus to next unfilled slot
            const nextEmpty = currentMission.missingSlots.find(
              (s) => s.step !== targetStep && !next[s.step]
            );
            if (nextEmpty) {
              setFocusedMissingStep(nextEmpty.step);
            }
            return next;
          });
        }
      }
    },
    [
      currentMission.missingSlots,
      focusedMissingStep,
      isEnergyOut,
      isPaused,
      playPhase,
      pulseDrumsVisual,
      screen,
      selectedGenre,
    ]
  );

  const allSlotsFilled = useMemo(
    () => currentMission.missingSlots.every((slot) => Boolean(selections[slot.step])),
    [currentMission.missingSlots, selections]
  );

  // Confirm & verify the player's selected drum(s) by playing back the completed groove!
  const handleVerifyAnswer = useCallback(() => {
    if (!allSlotsFilled || playPhase !== 'SOLVING') return;

    clearPhaseTimeout();
    rhythmEngine.stopPattern();
    rhythmEngine.unlock();
    setPlayPhase('VERIFYING');
    setFeedbackBanner({
      kind: 'info',
      text: 'Seçiminle birlikte çalıyoruz — bakalım oturuyor mu!',
      mood: 'grooving',
    });

    const wrongSlot = currentMission.missingSlots.find(
      (slot) => selections[slot.step] !== slot.expectedDrum
    );

    rhythmEngine.startPattern({
      mission: currentMission,
      genre: selectedGenre,
      mode: 'verify',
      userSelections: selections,
      loops: 1,
      onStep: (step, triggered) => {
        setActiveStep(step);
        pulseDrumsVisual(triggered);
      },
      onComplete: () => {
        setActiveStep(null);

        if (!wrongSlot) {
          // Correct!
          rhythmEngine.playSuccessFanfare();
          fxRef.current?.spawnCelebration();

          const basePoints = 200 + currentMission.stageNumber * 50;
          const bonus = streak * 50 + (energy === MAX_ENERGY ? 75 : 0);
          const newTotalScore = score + basePoints + bonus;
          const nextStreak = streak + 1;

          setLastStageEarned({ base: basePoints, bonus });
          setScore(newTotalScore);
          setStreak(nextStreak);

          // Persist high score & badge unlock
          setSavedProgress((prev) => {
            const nextBadges = prev.unlockedBadges.includes(currentMission.badge.id)
              ? prev.unlockedBadges
              : [...prev.unlockedBadges, currentMission.badge.id];
            const isFinalStage = stageIdx >= missions.length - 1;
            const nextCompletedGenres =
              isFinalStage && !prev.completedGenres.includes(selectedGenre)
                ? [...prev.completedGenres, selectedGenre]
                : prev.completedGenres;
            const updated: SavedProgress = {
              highScore: Math.max(prev.highScore, newTotalScore),
              unlockedBadges: nextBadges,
              completedGenres: nextCompletedGenres,
              lastGenre: selectedGenre,
            };
            void ytPlayables.saveProgress(updated);
            void ytPlayables.submitScore(updated.highScore);
            return updated;
          });

          setScreen('STAGE_CLEAR');
        } else {
          // Incorrect — drop energy, give educational ear hint, allow immediate retry
          rhythmEngine.playErrorBoing();
          setStreak(0);
          setShakeTick((t) => t + 1);

          const chosen = selections[wrongSlot.step]!;
          const hint = getWrongAnswerHint(wrongSlot.expectedDrum, chosen);

          setEnergy((prevEnergy) => {
            const nextEnergy = Math.max(0, prevEnergy - 1);
            if (nextEnergy === 0) {
              setIsEnergyOut(true);
            }
            return nextEnergy;
          });

          // Focus the wrong slot so the player can immediately fix it
          setFocusedMissingStep(wrongSlot.step);
          setPlayPhase('SOLVING');
          setFeedbackBanner({
            kind: 'error',
            text: hint,
            mood: 'shocked',
          });
        }
      },
    });
  }, [
    allSlotsFilled,
    clearPhaseTimeout,
    currentMission,
    energy,
    missions.length,
    playPhase,
    pulseDrumsVisual,
    score,
    selectedGenre,
    selections,
    stageIdx,
    streak,
  ]);

  // Global keyboard shortcuts (Desktop accessibility + fast arcade feel)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.key === 'm' || e.key === 'M') {
        toggleAudio();
        return;
      }

      if (e.key === 'Escape') {
        if (screen === 'PLAYING' && !isEnergyOut) {
          setIsPaused((prev) => {
            const next = !prev;
            if (next) {
              clearPhaseTimeout();
              rhythmEngine.stopPattern();
              setActiveStep(null);
              if (playPhase === 'LISTENING_FULL' || playPhase === 'LISTENING_GAP') {
                setPlayPhase('SOLVING');
              }
            }
            return next;
          });
        }
        return;
      }

      if (isPaused || isEnergyOut) return;

      if (screen === 'TITLE' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        rhythmEngine.unlock();
        rhythmEngine.playUiTap();
        setScreen('GENRE_SELECT');
        return;
      }

      if (screen === 'PLAYING') {
        // 1-6 map directly to drum pieces
        const idx = Number(e.key) - 1;
        if (idx >= 0 && idx < DRUMS.length) {
          e.preventDefault();
          handleHitDrum(DRUMS[idx].id, window.innerWidth * 0.5, window.innerHeight * 0.72);
          return;
        }
        if (e.key === ' ') {
          e.preventDefault();
          if (playPhase === 'SOLVING' || playPhase === 'READY') {
            playSingleReference('gap');
          }
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (playPhase === 'SOLVING' && allSlotsFilled) {
            handleVerifyAnswer();
          } else if (playPhase === 'READY') {
            runFullThenGapDemo();
          }
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    allSlotsFilled,
    clearPhaseTimeout,
    handleHitDrum,
    handleVerifyAnswer,
    isEnergyOut,
    isPaused,
    playPhase,
    playSingleReference,
    runFullThenGapDemo,
    screen,
    toggleAudio,
  ]);

  // Determine current stage backdrop image
  const activeBackdropKey: 'garage' | 'club' | 'arena' =
    screen === 'TITLE' || screen === 'GENRE_SELECT'
      ? 'garage'
      : screen === 'VICTORY'
        ? 'arena'
        : currentMission.backdropKey;

  const backdropSrc = STAGE_BACKDROPS[activeBackdropKey];
  const activeBackdropBroken = Boolean(backdropFailed[activeBackdropKey]);

  const handleAdvanceStoryIntro = () => {
    rhythmEngine.unlock();
    rhythmEngine.playUiTap();
    if (dialogueIdx < currentMission.introDialogue.length - 1) {
      setDialogueIdx((d) => d + 1);
    } else {
      enterMission(stageIdx, selectedGenre);
    }
  };

  const handleAdvanceStoryOutro = () => {
    rhythmEngine.unlock();
    rhythmEngine.playUiTap();
    if (dialogueIdx < currentMission.outroDialogue.length - 1) {
      setDialogueIdx((d) => d + 1);
    } else if (stageIdx < missions.length - 1) {
      const nextStage = stageIdx + 1;
      setStageIdx(nextStage);
      setDialogueIdx(0);
      setScreen('STORY_INTRO');
    } else {
      fxRef.current?.spawnCelebration();
      rhythmEngine.playSuccessFanfare();
      setScreen('VICTORY');
    }
  };

  const focusedDrumMeta = lastAuditionedDrum ? DRUM_BY_ID[lastAuditionedDrum] : null;
  const isBusyListening =
    playPhase === 'LISTENING_FULL' || playPhase === 'LISTENING_GAP' || playPhase === 'VERIFYING';

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-stone-950 text-stone-100 flex flex-col">
      {/* Stage Key-Art Backdrop with CSS fallback */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-black">
        {!activeBackdropBroken && (
          <img
            src={backdropSrc}
            alt="Konser sahnesi arka planı"
            referrerPolicy="no-referrer"
            onError={() =>
              setBackdropFailed((prev) => ({ ...prev, [activeBackdropKey]: true }))
            }
            className="h-full w-full object-cover object-center scale-[1.02] transition-opacity duration-500 opacity-75"
          />
        )}
        {/* Measured atmospheric scrim for crisp WCAG contrast */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${
            screen === 'TITLE'
              ? 'from-stone-950/65 via-stone-950/45 to-stone-950/92'
              : genreTheme.stageTint
          }`}
        />
      </div>

      {/* Isolated 60fps Canvas FX Overlay */}
      <CanvasFxOverlay ref={fxRef} />

      {/* ================================================================
          SCREEN 1: TITLE SCREEN
         ================================================================ */}
      {screen === 'TITLE' && (
        <main className="relative z-20 flex flex-col items-center justify-between h-full w-full px-5 py-6 sm:py-9">
          {/* Top minimal utility bar (Sound toggle only) */}
          <div className="w-full max-w-5xl flex items-center justify-between">
            <div className="text-xs sm:text-sm text-stone-300 font-medium">
              {savedProgress.highScore > 0 ? (
                <span className="font-mono-num">
                  En Yüksek: {savedProgress.highScore} · {savedProgress.unlockedBadges.length} Rozet
                </span>
              ) : (
                <span>Garajdan Dünya Sahnesine</span>
              )}
            </div>

            <button
              type="button"
              onClick={toggleAudio}
              aria-label={audioEnabled ? 'Sesi kapat' : 'Sesi aç'}
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-stone-950/75 border border-stone-700/80 text-stone-100 hover:border-amber-400 transition-colors cursor-pointer"
            >
              {audioEnabled ? <Volume2 className="w-5 h-5 text-amber-300" /> : <VolumeX className="w-5 h-5 text-stone-400" />}
            </button>
          </div>

          {/* Center Hero Lockup over calm upper-middle negative space */}
          <div className="flex flex-col items-center text-center max-w-xl my-auto">
            <div className="animate-gentle-float">
              <TitleLogo />
            </div>

            <p className="mt-3 text-sm sm:text-base text-stone-200 max-w-md leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Eksik davul vuruşunu kulağınla yakala, garaj provasını kurtar ve grubunu dünya stadyumuna taşı!
            </p>

            <button
              type="button"
              onClick={() => {
                rhythmEngine.unlock();
                rhythmEngine.playUiTap();
                setScreen('GENRE_SELECT');
              }}
              className="mt-6 inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-display font-black text-lg tracking-wide shadow-[0_10px_30px_rgba(245,158,11,0.35)] transition-transform duration-150 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Sahneye Çık</span>
            </button>
          </div>

          {/* Single flat control hint line */}
          <footer className="text-center text-xs text-stone-400">
            Dokun / Tıkla veya 1-6 Davullar · Boşluk Tekrar Dinle · Enter Onayla · Esc Mola
          </footer>
        </main>
      )}

      {/* ================================================================
          SCREEN 2: BAND GENRE SELECTION
         ================================================================ */}
      {screen === 'GENRE_SELECT' && (
        <main className="relative z-20 flex flex-col items-center justify-between h-full w-full px-4 py-5 sm:px-6 sm:py-8 overflow-y-auto">
          <div className="w-full max-w-4xl flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                rhythmEngine.playUiTap();
                setScreen('TITLE');
              }}
              className="px-3.5 py-2 rounded-xl bg-stone-900/80 border border-stone-700 text-xs sm:text-sm font-semibold text-stone-200 hover:bg-stone-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Geri
            </button>

            <button
              type="button"
              onClick={toggleAudio}
              aria-label={audioEnabled ? 'Sesi kapat' : 'Sesi aç'}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-stone-900/80 border border-stone-700 text-stone-100 hover:border-amber-400 transition-colors cursor-pointer"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            </button>
          </div>

          <div className="w-full max-w-4xl my-auto py-4">
            <div className="text-center mb-5 sm:mb-6">
              <p className="text-xs sm:text-sm font-medium text-amber-300">
                1. Adım · Grup Tarzını Belirle
              </p>
              <h1 className="mt-1 font-display text-2xl sm:text-4xl font-black text-stone-50 text-balance">
                Grubunuz Hangi Tarzda Çalacak?
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-stone-300">
                Tarz seçimi davul tınılarını, sahne atmosferini ve kulis şakalarını değiştirir. Bir karta dokunarak sesi test et!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {GENRE_LIST.map((genre) => {
                const isSelected = selectedGenre === genre.id;
                const isCompleted = savedProgress.completedGenres.includes(genre.id);

                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => previewGenreSound(genre.id)}
                    className={`text-left rounded-2xl p-4 sm:p-5 border transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? `bg-stone-900/95 ${genre.accentBorder} ring-2 ring-offset-0 shadow-xl`
                        : 'bg-stone-950/80 border-stone-800 hover:border-stone-600 hover:bg-stone-900/85'
                    }`}
                    style={
                      isSelected
                        ? { boxShadow: `0 0 0 2px ${genre.accentHex}` }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-lg sm:text-xl font-black text-stone-50">
                        {genre.name}
                      </span>
                      <span
                        className="text-xs font-bold whitespace-nowrap"
                        style={{ color: genre.accentHex }}
                      >
                        {isCompleted ? 'Tamamlandı' : isSelected ? 'Seçili' : 'Sesi Dinle'}
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-semibold text-stone-400">
                      Grup Adı: {genre.bandName}
                    </p>
                    <p className="mt-2 text-sm text-stone-200 leading-snug">
                      {genre.tagline}
                    </p>
                    <p className="mt-1.5 text-xs text-stone-400">
                      {genre.soundDescription}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => startCareerWithGenre(selectedGenre)}
                className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-display font-black text-base sm:text-lg shadow-lg transition-transform active:scale-[0.98] cursor-pointer whitespace-nowrap ${genreTheme.accentBg}`}
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{genreTheme.bandName} ile Turneye Başla</span>
              </button>
            </div>
          </div>

          <div className="h-2" />
        </main>
      )}

      {/* ================================================================
          SCREEN 3: STORY INTRO / OUTRO INTERSTITIALS
         ================================================================ */}
      {screen === 'STORY_INTRO' && (
        <StoryOverlay
          venueName={currentMission.venueName}
          stageNumber={currentMission.stageNumber}
          totalStages={missions.length}
          genreTheme={genreTheme}
          lines={currentMission.introDialogue}
          lineIndex={dialogueIdx}
          onNext={handleAdvanceStoryIntro}
          onSkip={() => enterMission(stageIdx, selectedGenre)}
        />
      )}

      {screen === 'STORY_OUTRO' && (
        <StoryOverlay
          venueName={currentMission.venueName}
          stageNumber={currentMission.stageNumber}
          totalStages={missions.length}
          genreTheme={genreTheme}
          lines={currentMission.outroDialogue}
          lineIndex={dialogueIdx}
          isOutro
          onNext={handleAdvanceStoryOutro}
          onSkip={() => {
            if (stageIdx < missions.length - 1) {
              setStageIdx((s) => s + 1);
              setDialogueIdx(0);
              setScreen('STORY_INTRO');
            } else {
              setScreen('VICTORY');
            }
          }}
        />
      )}

      {/* ================================================================
          SCREEN 4: ACTIVE RHYTHM GAMEPLAY VIEW
         ================================================================ */}
      {(screen === 'PLAYING' || screen === 'STAGE_CLEAR') && (
        <div
          key={`stage-wrap-${shakeTick}`}
          className={`relative z-20 flex flex-col justify-between h-full w-full max-w-5xl mx-auto px-3 py-3 sm:px-5 sm:py-4 gap-2.5 sm:gap-3.5 ${
            shakeTick > 0 ? 'animate-stage-shake' : ''
          }`}
        >
          {/* Low-occlusion Top HUD Bar */}
          <header className="flex items-center justify-between gap-2 rounded-2xl bg-stone-950/82 border border-stone-800/90 px-3 py-2 sm:px-4 sm:py-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-400 truncate">
                <span className="font-semibold" style={{ color: genreTheme.accentHex }}>
                  Sahne {currentMission.stageNumber}/{missions.length}
                </span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{currentMission.venueName}</span>
                <span aria-hidden="true" className="hidden sm:inline">·</span>
                <span className="hidden sm:inline truncate">{genreTheme.name}</span>
              </div>
              <h1 className="font-display text-sm sm:text-lg font-black text-stone-50 truncate leading-tight">
                {currentMission.missionTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
              {/* Energy meter (icon + numeric text for color-blind clarity) */}
              <div
                className="flex items-center gap-1 text-xs sm:text-sm font-mono-num font-bold"
                aria-label={`Enerji ${energy} / ${MAX_ENERGY}`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    energy <= 1 ? 'text-rose-500 fill-rose-500' : 'text-rose-400 fill-rose-400'
                  }`}
                />
                <span className="text-stone-100">
                  {energy}/{MAX_ENERGY}
                </span>
              </div>

              {/* Score */}
              <div className="text-right leading-tight">
                <span className="block text-[10px] text-stone-400">Puan</span>
                <span className="font-mono-num text-sm sm:text-base font-black text-amber-300">
                  {score}
                </span>
              </div>

              {/* Audio & Pause Buttons (>=40px touch targets) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleAudio}
                  aria-label={audioEnabled ? 'Sesi kapat' : 'Sesi aç'}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-stone-900 border border-stone-700/80 text-stone-100 hover:border-amber-400 transition-colors cursor-pointer"
                >
                  {audioEnabled ? (
                    <Volume2 className="w-4 h-4 text-amber-300" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-stone-400" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearPhaseTimeout();
                    rhythmEngine.stopPattern();
                    setActiveStep(null);
                    if (playPhase === 'LISTENING_FULL' || playPhase === 'LISTENING_GAP') {
                      setPlayPhase('SOLVING');
                    }
                    setIsPaused(true);
                  }}
                  aria-label="Oyunu duraklat"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-stone-900 border border-stone-700/80 text-stone-100 hover:border-amber-400 transition-colors cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Visual Rhythm Timeline */}
          <RhythmTimeline
            mission={currentMission}
            playPhase={playPhase}
            activeStep={activeStep}
            selections={selections}
            focusedMissingStep={focusedMissingStep}
            onFocusMissingStep={(step) => {
              rhythmEngine.playUiTap();
              setFocusedMissingStep(step);
            }}
          />

          {/* Middle Band Feedback & Playback Control Strip */}
          <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3 rounded-2xl bg-stone-950/78 border border-stone-800/85 px-3.5 py-2.5 sm:px-4 sm:py-3">
            {/* Band coach feedback */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <BandAvatar
                speaker="batu"
                mood={feedbackBanner?.mood ?? 'idle'}
                size={48}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`text-xs sm:text-sm font-medium leading-snug ${
                    feedbackBanner?.kind === 'error'
                      ? 'text-rose-200'
                      : 'text-stone-100'
                  }`}
                >
                  {feedbackBanner?.text ??
                    'Tam kalıbı dinle, ardından eksik vuruşu davul setinden seç!'}
                </p>
                {focusedDrumMeta && (
                  <p className="mt-0.5 text-[11px] sm:text-xs text-stone-400 truncate">
                    <span className="font-semibold" style={{ color: focusedDrumMeta.colorHex }}>
                      {focusedDrumMeta.name}:
                    </span>{' '}
                    {focusedDrumMeta.roleTip}
                  </p>
                )}
              </div>
            </div>

            {/* Listen & Confirm Actions */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                disabled={isBusyListening}
                onClick={() => playSingleReference('full')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <Ear className="w-4 h-4 text-amber-300" />
                <span>Tam Kalıp</span>
              </button>

              <button
                type="button"
                disabled={isBusyListening}
                onClick={() => playSingleReference('gap')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-stone-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                <HelpCircle className="w-4 h-4 text-sky-300" />
                <span>Eksik Kalıp</span>
              </button>

              <button
                type="button"
                disabled={!allSlotsFilled || playPhase !== 'SOLVING'}
                onClick={handleVerifyAnswer}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  allSlotsFilled && playPhase === 'SOLVING'
                    ? `${genreTheme.accentBg} cursor-pointer shadow-md`
                    : 'bg-stone-800/70 text-stone-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Vuruşu Tamamla</span>
              </button>
            </div>
          </section>

          {/* Interactive 6-Piece Tactile Drum Kit */}
          <section aria-label="İnteraktif Davul Seti" className="mt-auto pb-1">
            <DrumKitPad
              selectedDrum={
                focusedMissingStep !== null ? (selections[focusedMissingStep] ?? null) : null
              }
              activeDrums={activeDrumTicks}
              disabled={playPhase === 'VERIFYING'}
              onHitDrum={(drum, x, y) => handleHitDrum(drum, x, y)}
            />
          </section>
        </div>
      )}

      {/* ================================================================
          SCREEN 5: VICTORY SCREEN
         ================================================================ */}
      {screen === 'VICTORY' && (
        <VictoryScreen
          genreTheme={genreTheme}
          score={score}
          highScore={Math.max(score, savedProgress.highScore)}
          badgesCount={savedProgress.unlockedBadges.length}
          onPlayAnotherGenre={() => {
            rhythmEngine.playUiTap();
            setScreen('GENRE_SELECT');
          }}
          onReplayCareer={() => startCareerWithGenre(selectedGenre)}
        />
      )}

      {/* ================================================================
          MODALS (Pause, Stage Clear, Energy Out)
         ================================================================ */}
      {isPaused && screen === 'PLAYING' && (
        <PauseModal
          audioEnabled={audioEnabled}
          onToggleAudio={toggleAudio}
          onResume={() => {
            rhythmEngine.unlock();
            rhythmEngine.playUiTap();
            setIsPaused(false);
          }}
          onRestartStage={() => enterMission(stageIdx, selectedGenre)}
          onBackToTitle={() => {
            clearPhaseTimeout();
            rhythmEngine.stopPattern();
            setIsPaused(false);
            setScreen('TITLE');
          }}
        />
      )}

      {screen === 'STAGE_CLEAR' && (
        <StageClearModal
          mission={currentMission}
          genreTheme={genreTheme}
          earnedPoints={lastStageEarned.base}
          streakBonus={lastStageEarned.bonus}
          onReplayGroove={() => {
            rhythmEngine.unlock();
            rhythmEngine.startPattern({
              mission: currentMission,
              genre: selectedGenre,
              mode: 'full',
              loops: 1,
            });
          }}
          onContinue={() => {
            rhythmEngine.stopPattern();
            rhythmEngine.playUiTap();
            setDialogueIdx(0);
            setScreen('STORY_OUTRO');
          }}
        />
      )}

      {isEnergyOut && screen === 'PLAYING' && (
        <EnergyOutModal
          mission={currentMission}
          onRetry={() => enterMission(stageIdx, selectedGenre)}
          onBackToTitle={() => {
            clearPhaseTimeout();
            rhythmEngine.stopPattern();
            setIsEnergyOut(false);
            setScreen('TITLE');
          }}
        />
      )}
    </div>
  );
}
