import { useState } from "react";
import type { TrainingSession } from "../../domain/types";
import { formatDuration } from "../../domain/trainingEngine";

const OUTCOME_COLOR: Record<TrainingSession["outcome"], string> = {
  relaxed: "#5f8a72",
  concern: "#c08a49",
  distressed: "#b56860"
};

const OUTCOME_LABEL: Record<TrainingSession["outcome"], string> = {
  relaxed: "Relaxed",
  concern: "Some concern",
  distressed: "Distressed"
};

const WINDOW = 14;
const CHART_HEIGHT = 120;
const BAR_GAP = 4;

export function SessionTrendChart({ sessions }: { sessions: TrainingSession[] }) {
  const recent = sessions.slice(-WINDOW);
  const [selected, setSelected] = useState(recent.length - 1);
  const active = recent.length ? Math.min(selected, recent.length - 1) : -1;

  if (recent.length === 0) return null;

  const maxSeconds = Math.max(...recent.map((session) => session.actualSeconds), 1);
  const barWidth = 100 / recent.length;
  const activeSession = active >= 0 ? recent[active] : null;

  return (
    <section className="pattern-card">
      <div>
        <p className="kicker">Duration over time</p>
        <h2>Your last {recent.length} main departures.</h2>
        <p>
          Bar height is how long they actually stayed away for, not the target —
          colour is what happened while they were.
        </p>
      </div>

      <svg
        className="trend-chart"
        viewBox={`0 0 100 ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Duration of the last ${recent.length} main departures, coloured by outcome`}
      >
        {recent.map((session, index) => {
          const heightRatio = session.actualSeconds / maxSeconds;
          const barHeight = Math.max(3, heightRatio * (CHART_HEIGHT - 4));
          const x = index * barWidth + BAR_GAP / 2;
          const width = Math.max(1, barWidth - BAR_GAP);
          const y = CHART_HEIGHT - barHeight;

          return (
            <rect
              key={session.id}
              x={x}
              y={y}
              width={width}
              height={barHeight}
              rx={Math.min(2, width / 2)}
              fill={OUTCOME_COLOR[session.outcome]}
              opacity={index === active ? 1 : 0.55}
              onClick={() => setSelected(index)}
              tabIndex={0}
              role="button"
              aria-label={`${formatDuration(session.actualSeconds)}, ${OUTCOME_LABEL[session.outcome]}, ${new Date(session.at).toLocaleDateString()}`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") setSelected(index);
              }}
            >
              <title>
                {formatDuration(session.actualSeconds)} · {OUTCOME_LABEL[session.outcome]} ·{" "}
                {new Date(session.at).toLocaleDateString()}
              </title>
            </rect>
          );
        })}
      </svg>

      {activeSession && (
        <p className="trend-caption">
          <strong>{formatDuration(activeSession.actualSeconds)}</strong> ·{" "}
          {OUTCOME_LABEL[activeSession.outcome]} ·{" "}
          {new Date(activeSession.at).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short"
          })}
          {activeSession.stoppedEarly && " · stopped early"}
        </p>
      )}

      <div className="trend-legend">
        {(Object.keys(OUTCOME_LABEL) as Array<TrainingSession["outcome"]>).map((outcome) => (
          <span key={outcome}>
            <i style={{ background: OUTCOME_COLOR[outcome] }} />
            {OUTCOME_LABEL[outcome]}
          </span>
        ))}
      </div>
    </section>
  );
}
