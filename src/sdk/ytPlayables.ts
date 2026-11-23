import type { SavedProgress } from '../types/game';

/**
 * Ambient typing for the official YouTube Playables SDK (`window.ytgame`),
 * which is injected prior to game execution in the YouTube Playables environment.
 */
interface YTGameSDK {
  SDK_VERSION?: string;
  IN_PLAYABLES_ENV?: boolean;
  game?: {
    firstFrameReady?: () => void;
    gameReady?: () => void;
    saveData?: (data: string) => Promise<void>;
    loadData?: () => Promise<string>;
  };
  engagement?: {
    sendScore?: (score: { value: number }) => Promise<void>;
  };
  system?: {
    isAudioEnabled?: () => boolean;
    onAudioEnabledChange?: (callback: (isAudioEnabled: boolean) => void) => () => void;
    onPause?: (callback: () => void) => () => void;
    onResume?: (callback: () => void) => () => void;
  };
}

declare global {
  interface Window {
    ytgame?: YTGameSDK;
  }
}

const LOCAL_STORAGE_KEY = 'ritim_garaji_save_v1';

const DEFAULT_PROGRESS: SavedProgress = {
  highScore: 0,
  unlockedBadges: [],
  completedGenres: [],
};

class YouTubePlayablesBridge {
  private firstFrameSent = false;
  private gameReadySent = false;

  private get sdk(): YTGameSDK | undefined {
    return typeof window !== 'undefined' ? window.ytgame : undefined;
  }

  public isInsidePlayables(): boolean {
    return Boolean(this.sdk?.IN_PLAYABLES_ENV);
  }

  /**
   * Must be invoked as soon as the first visual frame has painted.
   */
  public signalFirstFrameReady(): void {
    if (this.firstFrameSent) return;
    this.firstFrameSent = true;
    try {
      this.sdk?.game?.firstFrameReady?.();
    } catch {
      // Safely ignore in standalone environments
    }
  }

  /**
   * Must be invoked once core assets & interactive handlers are ready.
   */
  public signalGameReady(): void {
    if (this.gameReadySent) return;
    this.gameReadySent = true;
    try {
      this.sdk?.game?.gameReady?.();
    } catch {
      // Safely ignore in standalone environments
    }
  }

  /**
   * Reads initial audio preference from YouTube Playables host if available.
   */
  public isAudioEnabled(): boolean {
    try {
      if (typeof this.sdk?.system?.isAudioEnabled === 'function') {
        return this.sdk.system.isAudioEnabled();
      }
    } catch {
      // Fallback to enabled
    }
    return true;
  }

  /**
   * Subscribes to YouTube Playables audio toggle events.
   */
  public subscribeAudioChange(handler: (enabled: boolean) => void): () => void {
    try {
      if (typeof this.sdk?.system?.onAudioEnabledChange === 'function') {
        return this.sdk.system.onAudioEnabledChange(handler);
      }
    } catch {
      // Fallback no-op
    }
    return () => {};
  }

  /**
   * Subscribes to YouTube Playables pause/resume lifecycle AND browser visibility changes.
   */
  public subscribeLifecycle(onPause: () => void, onResume: () => void): () => void {
    const cleanups: Array<() => void> = [];

    try {
      if (typeof this.sdk?.system?.onPause === 'function') {
        cleanups.push(this.sdk.system.onPause(onPause));
      }
      if (typeof this.sdk?.system?.onResume === 'function') {
        cleanups.push(this.sdk.system.onResume(onResume));
      }
    } catch {
      // Ignore host subscription failures outside Playables
    }

    if (typeof document !== 'undefined') {
      const handleVisibility = () => {
        if (document.hidden) {
          onPause();
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);
      cleanups.push(() => document.removeEventListener('visibilitychange', handleVisibility));
    }

    return () => {
      cleanups.forEach((fn) => {
        try {
          fn();
        } catch {
          // Ignore cleanup errors
        }
      });
    };
  }

  /**
   * Reports high score to YouTube Playables engagement API.
   */
  public async submitScore(score: number): Promise<void> {
    const safeScore = Math.max(0, Math.floor(score));
    try {
      if (typeof this.sdk?.engagement?.sendScore === 'function') {
        await this.sdk.engagement.sendScore({ value: safeScore });
      }
    } catch {
      // Ignore outside Playables
    }
  }

  /**
   * Persists compact progress via YouTube Playables cloud save or localStorage fallback.
   */
  public async saveProgress(progress: SavedProgress): Promise<void> {
    const payload = JSON.stringify(progress);
    try {
      if (typeof this.sdk?.game?.saveData === 'function') {
        await this.sdk.game.saveData(payload);
        return;
      }
    } catch {
      // Fall back to localStorage
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, payload);
    } catch {
      // Storage may be unavailable in restricted iframes
    }
  }

  /**
   * Loads saved progress from YouTube Playables or localStorage fallback.
   */
  public async loadProgress(): Promise<SavedProgress> {
    let raw = '';
    try {
      if (typeof this.sdk?.game?.loadData === 'function') {
        raw = (await this.sdk.game.loadData()) || '';
      }
    } catch {
      raw = '';
    }

    if (!raw) {
      try {
        raw = localStorage.getItem(LOCAL_STORAGE_KEY) || '';
      } catch {
        raw = '';
      }
    }

    if (!raw) {
      return { ...DEFAULT_PROGRESS };
    }

    try {
      const parsed = JSON.parse(raw) as Partial<SavedProgress>;
      return {
        highScore: typeof parsed.highScore === 'number' ? parsed.highScore : 0,
        unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
        completedGenres: Array.isArray(parsed.completedGenres) ? parsed.completedGenres : [],
        lastGenre: parsed.lastGenre,
      };
    } catch {
      return { ...DEFAULT_PROGRESS };
    }
  }
}

export const ytPlayables = new YouTubePlayablesBridge();
