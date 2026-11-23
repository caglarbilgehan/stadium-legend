export type GenreId = 'rock' | 'popfunk' | 'electronic' | 'acoustic';

export type DrumId =
  | 'kick'
  | 'snare'
  | 'hihatClosed'
  | 'hihatOpen'
  | 'tom'
  | 'crash';

export type GameScreen =
  | 'TITLE'
  | 'GENRE_SELECT'
  | 'STORY_INTRO'
  | 'PLAYING'
  | 'STAGE_CLEAR'
  | 'STORY_OUTRO'
  | 'VICTORY';

export type PlayPhase =
  | 'READY'
  | 'LISTENING_FULL'
  | 'LISTENING_GAP'
  | 'SOLVING'
  | 'VERIFYING';

export type SpeakerId = 'batu' | 'ece' | 'kaan' | 'turgut';

export type CharacterMood = 'idle' | 'happy' | 'shocked' | 'grooving';

export interface DialogueLine {
  speaker: SpeakerId;
  mood: CharacterMood;
  text: string;
}

export interface MissingSlot {
  /** 0-indexed step in the pattern */
  step: number;
  /** The exact drum removed from this step */
  expectedDrum: DrumId;
}

export interface BadgeSpec {
  id: string;
  title: string;
  subtitle: string;
  icon: 'snare' | 'groove' | 'sync' | 'fill' | 'crown';
}

export interface MissionSpec {
  id: string;
  stageNumber: number;
  venueName: string;
  missionTitle: string;
  difficultyLabel: string;
  backdropKey: 'garage' | 'club' | 'arena';
  bpm: number;
  /** 8 for 8th-note single bar, 16 for 16th-note single bar */
  steps: 8 | 16;
  /** Drum hits per step index */
  pattern: Partial<Record<DrumId, number[]>>;
  /** Bass note MIDI numbers per step (optional backing groove) */
  bassLine: Array<number | null>;
  /** One or more missing beats to identify */
  missingSlots: MissingSlot[];
  /** Educational musical explanation shown upon success */
  musicalLesson: string;
  /** Humorous crowd/band reaction upon success */
  successQuip: string;
  /** Stage badge unlocked on completion */
  badge: BadgeSpec;
  /** Short comic intro lines before mission */
  introDialogue: DialogueLine[];
  /** Short comic outro lines after mission */
  outroDialogue: DialogueLine[];
}

export interface GenreTheme {
  id: GenreId;
  name: string;
  bandName: string;
  tagline: string;
  soundDescription: string;
  accentHex: string;
  accentSoft: string;
  accentText: string;
  accentBorder: string;
  accentBg: string;
  stageTint: string;
}

export interface DrumMeta {
  id: DrumId;
  name: string;
  shortName: string;
  keyHint: string;
  roleTip: string;
  colorHex: string;
  ringClass: string;
  badgeTextClass: string;
}

export interface SavedProgress {
  highScore: number;
  unlockedBadges: string[];
  completedGenres: GenreId[];
  lastGenre?: GenreId;
}
