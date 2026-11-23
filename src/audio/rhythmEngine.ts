import type { DrumId, GenreId, MissionSpec } from '../types/game';

type StepPlaybackCallback = (step: number, triggeredDrums: DrumId[]) => void;

interface PlaybackOptions {
  mission: MissionSpec;
  genre: GenreId;
  mode: 'full' | 'gap' | 'verify';
  /** Candidate drums mapped by step index when mode === 'verify' */
  userSelections?: Record<number, DrumId | undefined>;
  /** Number of bars/loops to play */
  loops?: number;
  onStep?: StepPlaybackCallback;
  onComplete?: () => void;
}

const LOOKAHEAD_MS = 25;
const SCHEDULE_AHEAD_SEC = 0.11;

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Low-latency Web Audio API procedural drum kit & lookahead step sequencer.
 * Complies strictly with YouTube Playables & browser autoplay policies:
 * AudioContext is NEVER created or resumed until an explicit user gesture calls `unlock()`.
 */
class RhythmAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private audioEnabled = true;
  private isHostPaused = false;

  // Scheduler state
  private schedulerTimer: number | null = null;
  private visualTimers: number[] = [];
  private isPlaying = false;
  private currentStep = 0;
  private totalStepsToPlay = 0;
  private nextNoteTime = 0;
  private activeOptions: PlaybackOptions | null = null;

  /**
   * Must be called inside a user gesture (pointerdown / click / keydown).
   */
  public unlock(): void {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.audioEnabled ? 0.85 : 0;
      this.masterGain.connect(this.ctx.destination);
      this.noiseBuffer = this.createNoiseBuffer(this.ctx);
    }

    if (this.ctx.state === 'suspended' && !this.isHostPaused) {
      this.ctx.resume().catch(() => {});
    }
  }

  public setAudioEnabled(enabled: boolean): void {
    this.audioEnabled = enabled;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(enabled ? 0.85 : 0, now, 0.012);
    }
  }

  public isAudioEnabled(): boolean {
    return this.audioEnabled;
  }

  public handleHostPause(): void {
    this.isHostPaused = true;
    this.stopPattern();
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public handleHostResume(): void {
    this.isHostPaused = false;
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public stopPattern(): void {
    this.isPlaying = false;
    this.activeOptions = null;
    if (this.schedulerTimer !== null) {
      window.clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.visualTimers.forEach((id) => window.clearTimeout(id));
    this.visualTimers = [];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Immediately auditions a single drum piece with zero perceived latency.
   */
  public triggerDrum(drum: DrumId, genre: GenreId, velocity = 1.0): void {
    this.unlock();
    if (!this.ctx || !this.masterGain || !this.audioEnabled) return;
    this.scheduleDrumAt(drum, genre, this.ctx.currentTime + 0.005, velocity);
  }

  /**
   * Starts lookahead-scheduled rhythmic playback of a mission groove.
   */
  public startPattern(options: PlaybackOptions): void {
    this.unlock();
    this.stopPattern();
    if (!this.ctx) {
      options.onComplete?.();
      return;
    }

    const loops = options.loops ?? 1;
    this.activeOptions = options;
    this.isPlaying = true;
    this.currentStep = 0;
    this.totalStepsToPlay = options.mission.steps * loops;
    this.nextNoteTime = this.ctx.currentTime + 0.06;

    this.schedulerTick();
    this.schedulerTimer = window.setInterval(() => this.schedulerTick(), LOOKAHEAD_MS);
  }

  private schedulerTick(): void {
    if (!this.isPlaying || !this.ctx || !this.activeOptions) return;

    const { mission } = this.activeOptions;
    // Steps per beat: 8 steps = 8th notes (2 per quarter), 16 steps = 16th notes (4 per quarter)
    const stepsPerQuarter = mission.steps === 16 ? 4 : 2;
    const stepDuration = 60 / mission.bpm / stepsPerQuarter;

    while (
      this.currentStep < this.totalStepsToPlay &&
      this.nextNoteTime < this.ctx.currentTime + SCHEDULE_AHEAD_SEC
    ) {
      const stepInBar = this.currentStep % mission.steps;
      this.scheduleStep(stepInBar, this.nextNoteTime, this.activeOptions);
      this.nextNoteTime += stepDuration;
      this.currentStep += 1;
    }

    if (this.currentStep >= this.totalStepsToPlay) {
      const finishDelayMs = Math.max(
        40,
        (this.nextNoteTime - this.ctx.currentTime) * 1000 + 60
      );
      const completeCb = this.activeOptions.onComplete;
      if (this.schedulerTimer !== null) {
        window.clearInterval(this.schedulerTimer);
        this.schedulerTimer = null;
      }
      const endTimer = window.setTimeout(() => {
        this.isPlaying = false;
        this.activeOptions = null;
        completeCb?.();
      }, finishDelayMs);
      this.visualTimers.push(endTimer);
    }
  }

  private scheduleStep(stepIndex: number, time: number, options: PlaybackOptions): void {
    if (!this.ctx) return;
    const { mission, genre, mode, userSelections, onStep } = options;

    const missingMap = new Map<number, DrumId>();
    mission.missingSlots.forEach((slot) => missingMap.set(slot.step, slot.expectedDrum));

    const isMissingStep = missingMap.has(stepIndex);
    const missingExpected = missingMap.get(stepIndex);
    const triggeredDrums: DrumId[] = [];

    // Schedule backing bassline note so groove sounds musical and rich
    const bassMidi = mission.bassLine[stepIndex];
    if (typeof bassMidi === 'number') {
      this.scheduleBassNote(bassMidi, genre, time, mission.steps === 16 ? 0.16 : 0.24);
    }

    // Schedule each drum present at this step
    const drumIds: DrumId[] = ['kick', 'snare', 'hihatClosed', 'hihatOpen', 'tom', 'crash'];
    for (const drum of drumIds) {
      const hits = mission.pattern[drum];
      if (!hits || !hits.includes(stepIndex)) continue;

      if (isMissingStep && drum === missingExpected) {
        if (mode === 'full') {
          this.scheduleDrumAt(drum, genre, time, 1.0);
          triggeredDrums.push(drum);
        } else if (mode === 'gap') {
          // Intentionally omit the target drum! Play an ultra-subtle muted stick pulse
          // only if no other drum plays on this step so the empty rhythmic hole is palpable.
          this.scheduleGapCue(time);
        } else if (mode === 'verify') {
          const picked = userSelections?.[stepIndex];
          if (picked) {
            this.scheduleDrumAt(picked, genre, time, 1.05);
            triggeredDrums.push(picked);
          }
        }
      } else {
        // Non-target accompaniment drums play normally
        const velocity = drum === 'hihatClosed' ? 0.72 : 0.92;
        this.scheduleDrumAt(drum, genre, time, velocity);
        triggeredDrums.push(drum);
      }
    }

    // Schedule UI highlight callback aligned to exact Web Audio timestamp
    const delayMs = Math.max(0, (time - this.ctx.currentTime) * 1000);
    const visualId = window.setTimeout(() => {
      onStep?.(stepIndex, triggeredDrums);
    }, delayMs);
    this.visualTimers.push(visualId);
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const length = Math.floor(ctx.sampleRate * 1.4);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private scheduleGapCue(time: number): void {
    if (!this.ctx || !this.masterGain || !this.audioEnabled) return;
    // Ultra-quiet subtle rim click so the player feels the beat slot where the drum vanished
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(980, time);
    osc.frequency.exponentialRampToValueAtTime(520, time + 0.02);
    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.03);
  }

  private scheduleBassNote(midi: number, genre: GenreId, time: number, dur: number): void {
    if (!this.ctx || !this.masterGain || !this.audioEnabled) return;
    const freq = midiToFreq(midi);
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (genre === 'electronic') {
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, time);
      filter.frequency.exponentialRampToValueAtTime(220, time + dur);
      gain.gain.setValueAtTime(0.16, time);
    } else if (genre === 'popfunk') {
      osc.type = 'triangle';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, time);
      filter.frequency.exponentialRampToValueAtTime(340, time + dur * 0.75);
      gain.gain.setValueAtTime(0.22, time);
    } else if (genre === 'acoustic') {
      osc.type = 'sine';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, time);
      gain.gain.setValueAtTime(0.21, time);
    } else {
      // rock
      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(640, time);
      filter.frequency.exponentialRampToValueAtTime(210, time + dur);
      gain.gain.setValueAtTime(0.16, time);
    }

    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    osc.frequency.setValueAtTime(freq, time);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + dur + 0.02);
  }

  private scheduleDrumAt(drum: DrumId, genre: GenreId, time: number, velocity: number): void {
    if (!this.ctx || !this.masterGain || !this.audioEnabled) return;
    switch (drum) {
      case 'kick':
        this.synthKick(genre, time, velocity);
        break;
      case 'snare':
        this.synthSnare(genre, time, velocity);
        break;
      case 'hihatClosed':
        this.synthHiHat(genre, time, velocity, false);
        break;
      case 'hihatOpen':
        this.synthHiHat(genre, time, velocity, true);
        break;
      case 'tom':
        this.synthTom(genre, time, velocity);
        break;
      case 'crash':
        this.synthCrash(genre, time, velocity);
        break;
    }
  }

  private synthKick(genre: GenreId, time: number, vel: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = genre === 'acoustic' ? 'triangle' : 'sine';

    const startFreq =
      genre === 'electronic' ? 165 : genre === 'popfunk' ? 150 : genre === 'acoustic' ? 125 : 155;
    const endFreq =
      genre === 'electronic' ? 38 : genre === 'acoustic' ? 54 : 45;
    const decay =
      genre === 'electronic' ? 0.34 : genre === 'popfunk' ? 0.2 : genre === 'acoustic' ? 0.22 : 0.26;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.09);

    gain.gain.setValueAtTime(0.95 * vel, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + decay + 0.02);

    // Beater punch click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(genre === 'rock' ? 1100 : 800, time);
    clickOsc.frequency.exponentialRampToValueAtTime(120, time + 0.018);
    clickGain.gain.setValueAtTime(0.28 * vel, time);
    clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02);
    clickOsc.connect(clickGain);
    clickGain.connect(this.masterGain);
    clickOsc.start(time);
    clickOsc.stop(time + 0.025);
  }

  private synthSnare(genre: GenreId, time: number, vel: number): void {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    // Snare wire noise
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = genre === 'electronic' ? 'bandpass' : 'highpass';
    filter.frequency.setValueAtTime(
      genre === 'popfunk' ? 1750 : genre === 'acoustic' ? 1300 : genre === 'electronic' ? 1900 : 1200,
      time
    );
    if (genre === 'electronic') {
      filter.Q.setValueAtTime(1.1, time);
    }

    const noiseGain = this.ctx.createGain();
    const noiseDecay =
      genre === 'rock' ? 0.22 : genre === 'popfunk' ? 0.14 : genre === 'acoustic' ? 0.16 : 0.19;
    noiseGain.gain.setValueAtTime(0.68 * vel, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + noiseDecay);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + noiseDecay + 0.02);

    // Snare drum shell body
    const osc = this.ctx.createOscillator();
    const bodyGain = this.ctx.createGain();
    osc.type = 'triangle';
    const pitch = genre === 'popfunk' ? 245 : genre === 'electronic' ? 210 : 190;
    osc.frequency.setValueAtTime(pitch, time);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.58, time + 0.08);
    bodyGain.gain.setValueAtTime(0.45 * vel, time);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.11);
    osc.connect(bodyGain);
    bodyGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.12);
  }

  private synthHiHat(genre: GenreId, time: number, vel: number, isOpen: boolean): void {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(genre === 'electronic' ? 8200 : 7000, time);

    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(isOpen ? 9800 : 10500, time);
    bp.Q.setValueAtTime(isOpen ? 1.4 : 2.2, time);

    const gain = this.ctx.createGain();
    const decay = isOpen ? (genre === 'popfunk' ? 0.36 : 0.44) : 0.055;
    const amp = isOpen ? 0.44 * vel : 0.34 * vel;
    gain.gain.setValueAtTime(amp, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    noise.connect(hp);
    hp.connect(bp);
    bp.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + decay + 0.02);
  }

  private synthTom(genre: GenreId, time: number, vel: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = genre === 'electronic' ? 'triangle' : 'sine';

    const startFreq = genre === 'popfunk' ? 240 : genre === 'electronic' ? 260 : 210;
    const endFreq = genre === 'electronic' ? 115 : 92;
    const decay = genre === 'acoustic' ? 0.25 : 0.3;

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.16);

    gain.gain.setValueAtTime(0.75 * vel, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + decay + 0.02);
  }

  private synthCrash(genre: GenreId, time: number, vel: number): void {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const hp = this.ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.setValueAtTime(4200, time);

    const peak = this.ctx.createBiquadFilter();
    peak.type = 'peaking';
    peak.frequency.setValueAtTime(genre === 'electronic' ? 7600 : 6200, time);
    peak.gain.setValueAtTime(5, time);

    const gain = this.ctx.createGain();
    const decay = 0.85;
    gain.gain.setValueAtTime(0.54 * vel, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    noise.connect(hp);
    hp.connect(peak);
    peak.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + decay + 0.03);

    // Metallic bell shimmer
    const bell = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bell.type = 'square';
    bell.frequency.setValueAtTime(512, time);
    bellGain.gain.setValueAtTime(0.05 * vel, time);
    bellGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    bell.connect(bellGain);
    bellGain.connect(this.masterGain);
    bell.start(time);
    bell.stop(time + 0.28);
  }

  public playUiTap(): void {
    this.unlock();
    if (!this.ctx || !this.masterGain || !this.audioEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.045);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playSuccessFanfare(): void {
    this.unlock();
    if (!this.ctx || !this.masterGain || !this.audioEnabled) return;
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const t = now + idx * 0.075;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  public playErrorBoing(): void {
    this.unlock();
    if (!this.ctx || !this.masterGain || !this.audioEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(210, now);
    osc.frequency.linearRampToValueAtTime(135, now + 0.22);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(580, now);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.27);
  }
}

export const rhythmEngine = new RhythmAudioEngine();
