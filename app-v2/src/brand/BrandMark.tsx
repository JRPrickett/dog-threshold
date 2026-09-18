import { useId } from "react";

/**
 * Same warm radial gradient as the installed app icon (public/icon.svg),
 * rather than three flat-opacity rings. A gradient stays smooth and rich at
 * every size the mark is used at, from a 32px nav icon up to the marketing
 * hero — the rings looked thin and banded once scaled up.
 */
export function BrandMark({
  compact = false,
  light = false
}: {
  compact?: boolean;
  light?: boolean;
}) {
  const gradientId = useId();

  return (
    <span
      className={`settled-mark ${compact ? "settled-mark-compact" : ""} ${light ? "settled-mark-light" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 96 112" role="img">
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="100%" r="72%">
            <stop offset="0%" stopColor="#F2A65A" stopOpacity="1" />
            <stop offset="46%" stopColor="#F2A65A" stopOpacity=".48" />
            <stop offset="100%" stopColor="#F2A65A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse
          className="settled-mark-glow"
          cx="48"
          cy="89"
          rx="40"
          ry="27"
          fill={`url(#${gradientId})`}
        />
        <path
          className="settled-mark-arch"
          d="M18 92V48C18 27.01 31.43 12 48 12s30 15.01 30 36v44"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
