import { formatDuration } from "../domain/trainingEngine";

const RING_SIZE = 280;
const RING_RADIUS = 112;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function ProgressRing({
  elapsed,
  targetSeconds,
  over
}: {
  elapsed: number;
  targetSeconds: number;
  over: boolean;
}) {
  const progress = Math.min(
    1,
    Math.max(0, elapsed / Math.max(1, targetSeconds))
  );
  const clock = over
    ? `+${formatClock(elapsed - targetSeconds)}`
    : formatClock(targetSeconds - elapsed);
  const label = over
    ? `Target reached, ${formatDuration(elapsed - targetSeconds)} over`
    : `${formatDuration(targetSeconds - elapsed)} remaining of ${formatDuration(targetSeconds)}`;

  return (
    <div className={`progress-ring ${over ? "over" : ""}`} role="img" aria-label={label}>
      <svg
        className="progress-ring-svg"
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        aria-hidden="true"
      >
        <circle
          className="progress-ring-track"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
        />
        <circle
          className="progress-ring-value"
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress)}
          transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
        />
      </svg>
      <div className="progress-ring-content">
        <div className={`live-clock ${over ? "over" : ""}`}>{clock}</div>
        <span className="progress-ring-of">of {formatDuration(targetSeconds)}</span>
      </div>
    </div>
  );
}
