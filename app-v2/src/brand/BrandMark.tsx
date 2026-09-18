import { useId } from "react";

/**
 * The brand deck ("Direction A — the doorway glow") specifies exactly two
 * treatments, not one mark reused everywhere:
 *
 * - "mark" (the default): an arch outline with the glow clipped inside the
 *   doorway opening, no separate floor line. This is the deck's horizontal
 *   lockup — used for headers and the marketing site, and anywhere else in
 *   the product shell.
 * - "badge": a dark rounded-square with the whole doorway filled by the
 *   glow, plus the stroked outline. The deck reserves this for the app icon
 *   specifically (it's what public/icon.svg renders) — it is not a generic
 *   "logo on a dark chip" treatment.
 *
 * Geometry and colour values are taken directly from the deck rather than
 * approximated, including its square (120x120) proportions.
 */
export function BrandMark({
  compact = false,
  light = false,
  variant = "mark"
}: {
  compact?: boolean;
  light?: boolean;
  variant?: "mark" | "badge" | "photo";
}) {
  const gradientId = useId();
  const clipId = useId();

  if (variant === "photo") {
    return (
      <span
        className={`settled-photo ${compact ? "settled-photo-compact" : ""}`}
        aria-hidden="true"
      >
        <img src="/brand/doorway-dog.jpg" alt="" />
      </span>
    );
  }

  if (variant === "badge") {
    return (
      <span
        className={`settled-badge ${compact ? "settled-badge-compact" : ""}`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 120 120" role="img">
          <defs>
            <radialGradient id={gradientId} cx="50%" cy="100%" r="70%">
              <stop offset="0%" stopColor="#F6C989" />
              <stop offset="55%" stopColor="#F2A65A" stopOpacity=".7" />
              <stop offset="100%" stopColor="#F2A65A" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="6" y="6" width="108" height="108" rx="26" fill="#15242C" />
          <path d="M34 96 L34 56 A26 26 0 0 1 86 56 L86 96 Z" fill={`url(#${gradientId})`} />
          <path
            d="M34 96 L34 56 A26 26 0 0 1 86 56 L86 96"
            fill="none"
            stroke="#F1E7D6"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`settled-mark ${compact ? "settled-mark-compact" : ""} ${light ? "settled-mark-light" : ""}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" role="img">
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="100%" r="70%">
            <stop offset="0%" stopColor="#F6C989" />
            <stop offset="55%" stopColor="#F2A65A" stopOpacity=".65" />
            <stop offset="100%" stopColor="#F2A65A" stopOpacity="0" />
          </radialGradient>
          <clipPath id={clipId}>
            <path d="M22 108 L22 56 A38 38 0 0 1 98 56 L98 108 Z" />
          </clipPath>
        </defs>
        <rect
          x="34"
          y="70"
          width="52"
          height="38"
          fill={`url(#${gradientId})`}
          clipPath={`url(#${clipId})`}
        />
        <path
          className="settled-mark-arch"
          d="M22 108 L22 56 A38 38 0 0 1 98 56 L98 108"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function BrandWordmark({
  compact = false,
  light = false,
  variant = "mark"
}: {
  compact?: boolean;
  light?: boolean;
  variant?: "mark" | "badge" | "photo";
}) {
  return (
    <span className={`brand-lockup ${compact ? "brand-lockup-compact" : ""}`}>
      <BrandMark compact={compact} light={light} variant={variant} />
      <span className="brand-lockup-copy">
        <strong>SettledSolo</strong>
        {!compact && <small>Calm starts with small steps.</small>}
      </span>
    </span>
  );
}
