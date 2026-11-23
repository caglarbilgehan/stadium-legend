interface TitleLogoProps {
  compact?: boolean;
}

/**
 * Bespoke inline SVG title lockup for Ritim Garajı.
 */
export function TitleLogo({ compact = false }: TitleLogoProps) {
  return (
    <div className={`inline-flex flex-col items-center select-none ${compact ? 'scale-90' : ''}`}>
      <svg
        viewBox="0 0 460 148"
        className={compact ? 'w-64 sm:w-72 h-auto' : 'w-[300px] sm:w-[410px] md:w-[460px] h-auto'}
        role="img"
        aria-label="Ritim Garajı"
      >
        <defs>
          <linearGradient id="rg-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="52%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="rg-cream" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="100%" stopColor="#e7e5e4" />
          </linearGradient>
          <filter id="rg-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="5" stdDeviation="3" floodColor="#090a0f" floodOpacity="0.82" />
          </filter>
        </defs>

        {/* Crossed Drumsticks behind emblem */}
        <g stroke="#d97706" strokeWidth="6" strokeLinecap="round" opacity="0.9">
          <line x1="158" y1="20" x2="302" y2="62" />
          <line x1="302" y1="20" x2="158" y2="62" />
        </g>
        <circle cx="155" cy="19" r="6" fill="#fef3c7" stroke="#92400e" strokeWidth="2" />
        <circle cx="305" cy="19" r="6" fill="#fef3c7" stroke="#92400e" strokeWidth="2" />

        {/* Drum badge crest */}
        <ellipse cx="230" cy="36" rx="44" ry="18" fill="#1c1917" stroke="#fbbf24" strokeWidth="3" />
        <ellipse cx="230" cy="34" rx="34" ry="11" fill="#292524" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="230" cy="34" r="5" fill="#fbbf24" />

        {/* Main title words */}
        <g filter="url(#rg-shadow)">
          <text
            x="230"
            y="95"
            textAnchor="middle"
            fontFamily="Trebuchet MS, Avenir Next, Segoe UI, sans-serif"
            fontWeight="900"
            fontSize="56"
            letterSpacing="3"
            fill="url(#rg-gold)"
            stroke="#1c1917"
            strokeWidth="7"
            paintOrder="stroke"
          >
            RİTİM
          </text>
          <text
            x="230"
            y="136"
            textAnchor="middle"
            fontFamily="Trebuchet MS, Avenir Next, Segoe UI, sans-serif"
            fontWeight="900"
            fontSize="42"
            letterSpacing="6"
            fill="url(#rg-cream)"
            stroke="#1c1917"
            strokeWidth="6"
            paintOrder="stroke"
          >
            GARAJI
          </text>
        </g>
      </svg>
    </div>
  );
}
