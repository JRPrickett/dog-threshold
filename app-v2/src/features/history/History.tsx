import type { AppData } from "../../domain/types";
import { activeScenario } from "../../data/appData";
import { formatDuration } from "../../domain/trainingEngine";

export function History({ data }: { data: AppData }) {
  const scenario = activeScenario(data);
  const sessions = [...scenario.sessions].reverse();

  return (
    <div className="screen-stack">
      <section className="page-heading">
        <p className="kicker">History</p>
        <h1>Your training record.</h1>
        <p>Private on this device for now. Account backup comes later.</p>
      </section>

      <section className="history-list">
        {sessions.length === 0 ? (
          <div className="empty-state">Your first completed session will appear here.</div>
        ) : (
          sessions.map((session) => (
            <article className="history-row" key={session.id}>
              <div className={`outcome-dot outcome-${session.outcome}`} />
              <div className="history-main">
                <strong>{formatDuration(session.actualSeconds)}</strong>
                <span>
                  {session.outcome === "relaxed"
                    ? "Relaxed"
                    : session.outcome === "concern"
                      ? "Some concern"
                      : "Distressed"}
                </span>
              </div>
              <div className="history-meta">
                <span>{new Date(session.at).toLocaleDateString()}</span>
                <small>target {formatDuration(session.targetSeconds)}</small>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
