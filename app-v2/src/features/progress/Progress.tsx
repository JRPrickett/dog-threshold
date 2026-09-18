import type { AppData } from "../../domain/types";
import { activeScenario } from "../../data/appData";
import { progressInsights } from "../../domain/progressInsights";
import { formatDuration } from "../../domain/trainingEngine";
import { observedSignalOptions } from "../../domain/observedSignals";

export function Progress({ data }: { data: AppData }) {
  const scenario = activeScenario(data);
  const sessions = scenario.sessions;
  const insights = progressInsights(sessions);
  const signalLabel = new Map(
    observedSignalOptions.map(({ value, label }) => [value, label])
  );

  return (
    <div className="screen-stack">
      <section className="page-heading">
        <p className="kicker">Progress</p>
        <h1>Look for comfort, not just longer times.</h1>
        <p>
          A shorter relaxed departure can be better progress than a longer difficult one.
        </p>
      </section>

      <section className="stats-grid">
        <div className="stat-card">
          <span>Longest relaxed</span>
          <strong>
            {insights.longestRelaxedSeconds
              ? formatDuration(insights.longestRelaxedSeconds)
              : "—"}
          </strong>
          <small>Observed comfortable time</small>
        </div>
        <div className="stat-card">
          <span>Recent comfort</span>
          <strong>
            {insights.recentTotal
              ? `${insights.recentRelaxed}/${insights.recentTotal}`
              : "—"}
          </strong>
          <small>Relaxed sessions in the latest 10</small>
        </div>
      </section>

      {insights.signals.length > 0 && (
        <section className="pattern-card">
          <div>
            <p className="kicker">Recent observations</p>
            <h2>What you have actually seen.</h2>
            <p>
              These are patterns in your last {insights.recentTotal} logged sessions,
              not a diagnosis or proof that a particular context caused the behaviour.
            </p>
          </div>
          <div className="signal-summary">
            {insights.signals.map(({ signal, count }) => (
              <span key={signal}>
                <strong>{signalLabel.get(signal) ?? signal}</strong>
                <small>{count} {count === 1 ? "session" : "sessions"}</small>
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="quiet-card vertical">
        <p className="kicker">What counts as progress</p>
        <h2>Duration is only one signal.</h2>
        <p>
          Over time the production app will also surface changes in pacing,
          vocalisation, exit-watching and ability to settle, without pretending those
          correlations prove a cause.
        </p>
      </section>
    </div>
  );
}
