import type { BadgeSpec, CharacterMood, SpeakerId } from '../types/game';

interface BandAvatarProps {
  speaker: SpeakerId;
  mood?: CharacterMood;
  size?: number;
}

/**
 * Hand-crafted expressive SVG character portraits for the band members & manager.
 */
export function BandAvatar({ speaker, mood = 'idle', size = 64 }: BandAvatarProps) {
  const isHappy = mood === 'happy' || mood === 'grooving';
  const isShocked = mood === 'shocked';

  const bgColors: Record<SpeakerId, string> = {
    batu: '#451a03',
    ece: '#064e3b',
    kaan: '#0c4a6e',
    turgut: '#4c0519',
  };

  const ringColors: Record<SpeakerId, string> = {
    batu: '#f59e0b',
    ece: '#10b981',
    kaan: '#38bdf8',
    turgut: '#fb7185',
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      className="shrink-0 rounded-xl shadow-md"
      role="img"
      aria-label={speaker}
    >
      <rect width="80" height="80" rx="14" fill={bgColors[speaker]} />
      <rect
        x="2"
        y="2"
        width="76"
        height="76"
        rx="12"
        fill="none"
        stroke={ringColors[speaker]}
        strokeWidth="2.5"
        opacity="0.85"
      />

      {/* Shoulders */}
      <path
        d="M14 80 C16 62, 64 62, 66 80 Z"
        fill={
          speaker === 'batu'
            ? '#d97706'
            : speaker === 'ece'
              ? '#059669'
              : speaker === 'kaan'
                ? '#0284c7'
                : '#be123c'
        }
      />

      {/* Head */}
      <circle cx="40" cy="40" r="19" fill="#fed7aa" stroke="#1c1917" strokeWidth="2.2" />

      {/* Character-specific hair & accessories */}
      {speaker === 'batu' && (
        <>
          {/* Backwards drummer cap */}
          <path d="M21 34 C22 19, 58 19, 59 34 Z" fill="#f59e0b" stroke="#1c1917" strokeWidth="2" />
          <path d="M55 29 L68 32 L66 36 L55 34 Z" fill="#b45309" stroke="#1c1917" strokeWidth="1.8" />
          {/* Studio headphones around neck/ears */}
          <rect x="17" y="34" width="6" height="14" rx="3" fill="#292524" stroke="#fbbf24" strokeWidth="1.5" />
          <rect x="57" y="34" width="6" height="14" rx="3" fill="#292524" stroke="#fbbf24" strokeWidth="1.5" />
        </>
      )}

      {speaker === 'ece' && (
        <>
          {/* Stylish bob hair */}
          <path
            d="M19 42 C18 18, 62 18, 61 42 L57 48 L56 32 C49 27, 31 27, 24 32 L23 48 Z"
            fill="#1c1917"
            stroke="#10b981"
            strokeWidth="1.2"
          />
          {/* Cool bassist shades */}
          <rect x="26" y="34" width="12" height="8" rx="2.5" fill="#0f172a" stroke="#34d399" strokeWidth="1.5" />
          <rect x="42" y="34" width="12" height="8" rx="2.5" fill="#0f172a" stroke="#34d399" strokeWidth="1.5" />
          <line x1="38" y1="38" x2="42" y2="38" stroke="#34d399" strokeWidth="1.5" />
        </>
      )}

      {speaker === 'kaan' && (
        <>
          {/* Spiky indie guitarist hair */}
          <path
            d="M20 36 L24 20 L33 25 L41 16 L49 24 L57 20 L60 36 C52 29, 28 29, 20 36 Z"
            fill="#292524"
            stroke="#1c1917"
            strokeWidth="1.8"
          />
        </>
      )}

      {speaker === 'turgut' && (
        <>
          {/* Manager slicked hair & mic boom */}
          <path d="M22 33 C24 19, 56 19, 58 33 C50 27, 30 27, 22 33 Z" fill="#44403c" stroke="#1c1917" strokeWidth="1.8" />
          <path d="M58 41 C63 45, 58 53, 47 52" fill="none" stroke="#1c1917" strokeWidth="2.2" />
          <circle cx="46" cy="52" r="2.6" fill="#fb7185" />
        </>
      )}

      {/* Eyes (skip for Ece with shades) */}
      {speaker !== 'ece' && (
        <g>
          {isShocked ? (
            <>
              <circle cx="33" cy="39" r="3.4" fill="#ffffff" stroke="#1c1917" strokeWidth="1.6" />
              <circle cx="47" cy="39" r="3.4" fill="#ffffff" stroke="#1c1917" strokeWidth="1.6" />
              <circle cx="33" cy="39" r="1.4" fill="#1c1917" />
              <circle cx="47" cy="39" r="1.4" fill="#1c1917" />
            </>
          ) : (
            <>
              <circle cx="33" cy="39" r="2.3" fill="#1c1917" />
              <circle cx="47" cy="39" r="2.3" fill="#1c1917" />
            </>
          )}
        </g>
      )}

      {/* Mouth */}
      {isShocked ? (
        <ellipse cx="40" cy="49" rx="4.2" ry="5" fill="#7f1d1d" stroke="#1c1917" strokeWidth="1.8" />
      ) : isHappy ? (
        <path d="M32 46 Q40 55 48 46 Z" fill="#ffffff" stroke="#1c1917" strokeWidth="1.8" />
      ) : (
        <path d="M34 48 Q40 51 46 48" fill="none" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
      )}
    </svg>
  );
}

interface BadgeIconProps {
  type: BadgeSpec['icon'];
  size?: number;
}

export function BadgeIcon({ type, size = 40 }: BadgeIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="shrink-0">
      <polygon
        points="24,3 30,13 42,15 34,24 36,36 24,31 12,36 14,24 6,15 18,13"
        fill="#f59e0b"
        stroke="#fef3c7"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {type === 'snare' && (
        <circle cx="24" cy="22" r="6" fill="#1c1917" stroke="#fef3c7" strokeWidth="2" />
      )}
      {type === 'groove' && (
        <path d="M18 26 L21 16 L27 24 L30 16" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {type === 'sync' && (
        <path d="M25 14 L19 23 L25 23 L22 31 L30 21 L24 21 Z" fill="#1c1917" />
      )}
      {type === 'fill' && (
        <g fill="#1c1917">
          <circle cx="19" cy="22" r="2.6" />
          <circle cx="24" cy="22" r="2.6" />
          <circle cx="29" cy="22" r="2.6" />
        </g>
      )}
      {type === 'crown' && (
        <path d="M16 26 L18 18 L24 22 L30 18 L32 26 Z" fill="#1c1917" stroke="#fef3c7" strokeWidth="1.2" strokeLinejoin="round" />
      )}
    </svg>
  );
}
