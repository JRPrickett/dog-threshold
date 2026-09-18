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
        <path
          className="settled-mark-arch"
          d="M18 92V48C18 27.01 31.43 12 48 12s30 15.01 30 36v44"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <ellipse cx="48" cy="91" rx="33" ry="18" fill="#F2A65A" opacity=".12" />
        <ellipse cx="48" cy="92" rx="22" ry="11" fill="#F2A65A" opacity=".34" />
        <ellipse cx="48" cy="94" rx="12" ry="5" fill="#F2A65A" opacity=".72" />
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
