export function BrandMark({
  compact = false,
  light = false
}: {
  compact?: boolean;
  light?: boolean;
}) {
  return (
    <span
      className={`settled-mark ${compact ? "settled-mark-compact" : ""} ${light ? "settled-mark-light" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 96 112" role="img">
        <defs>
          <radialGradient id="settledGlow" cx="50%" cy="100%" r="72%">
            <stop offset="0%" stopColor="#F2A65A" stopOpacity="1" />
            <stop offset="44%" stopColor="#F2A65A" stopOpacity=".45" />
            <stop offset="100%" stopColor="#F2A65A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path
          className="settled-mark-arch"
          d="M18 92V48C18 27.01 31.43 12 48 12s30 15.01 30 36v44"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="48" cy="91" rx="31" ry="17" fill="url(#settledGlow)" />
        <path
          className="settled-mark-floor"
          d="M18 92h60"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function BrandWordmark({
  compact = false
}: {
  compact?: boolean;
}) {
  return (
    <span className={`brand-lockup ${compact ? "brand-lockup-compact" : ""}`}>
      <BrandMark compact={compact} />
      <span className="brand-lockup-copy">
        <strong>SettledSolo</strong>
        {!compact && <small>Calm starts with small steps.</small>}
      </span>
    </span>
  );
}
