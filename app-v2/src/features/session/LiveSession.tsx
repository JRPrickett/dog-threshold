import { useEffect, useMemo, useReducer, useState } from "react";
import type {
  ObservedSignal,
  Outcome,
  TrainingSession
} from "../../domain/types";
import { observedSignalOptions } from "../../domain/observedSignals";
import {
  buildPracticeDepartures,
  formatDuration
} from "../../domain/trainingEngine";
import {
  makePersistedLiveSession,
  type PersistedLiveSession
} from "../../session/sessionPersistence";
import {
  elapsedSeconds,
  initialLiveSession,
  liveSessionReducer,
  type SessionStep
} from "../../session/sessionMachine";

export function LiveSession({
  scenarioId,
  targetSeconds,
  dogName,
  initialState,
  onClose,
  onSaved,
  onPersist
}: {
  scenarioId: string;
  targetSeconds: number;
  dogName: string;
  initialState?: PersistedLiveSession["state"];
  onClose: () => Promise<void>;
  onSaved: (session: TrainingSession) => Promise<void>;
  onPersist: (snapshot: PersistedLiveSession) => Promise<void>;
}) {
  const practice = useMemo(
    () => buildPracticeDepartures(targetSeconds),
    [targetSeconds]
  );
  const steps = useMemo<SessionStep[]>(
    () => [
      ...practice.map((target) => ({ kind: "practice" as const, targetSeconds: target })),
      { kind: "main" as const, targetSeconds }
    ],
    [practice, targetSeconds]
  );
  const [state, dispatch] = useReducer(
    liveSessionReducer,
    initialState ?? steps,
    (seed) =>
      Array.isArray(seed)
        ? initialLiveSession(seed as SessionStep[])
        : seed as PersistedLiveSession["state"]
  );
  const [now, setNow] = useState(Date.now());
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [signals, setSignals] = useState<ObservedSignal[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    void onPersist(makePersistedLiveSession(scenarioId, targetSeconds, state));
  }, [onPersist, scenarioId, state, targetSeconds]);

  useEffect(() => {
    if (state.phase !== "running") return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [state.phase]);

  const step = state.steps[state.stepIndex];
  const elapsed = elapsedSeconds(state, now);
  const remaining = Math.max(0, step.targetSeconds - elapsed);
  const over = elapsed > step.targetSeconds;

  function toggleSignal(signal: ObservedSignal) {
    setSignals((current) =>
      current.includes(signal)
        ? current.filter((value) => value !== signal)
        : [...current, signal]
    );
  }

  function saveReview() {
    if (!outcome || state.mainActualSeconds === null) return;
    void onSaved({
      id: `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      at: Date.now(),
      targetSeconds,
      actualSeconds: state.mainActualSeconds,
      outcome,
      stoppedEarly: state.mainActualSeconds < targetSeconds,
      signals,
      note: note.trim()
    });
  }

  if (state.phase === "review") {
    return (
      <div className="live-shell review-shell">
        <header className="live-header">
          <button className="text-button" onClick={() => void onClose()}>Close</button>
          <span>Session review</span>
          <span />
        </header>
        <main className="review-content">
          <p className="kicker light">You came back at</p>
          <div className="review-time">{formatDuration(state.mainActualSeconds ?? 0)}</div>
          <h1>How was {dogName} while you were away?</h1>
          <div className="outcome-grid">
            {([
              ["relaxed", "Relaxed", "No meaningful signs of concern"],
              ["concern", "Some concern", "Mild or transient signs"],
              ["distressed", "Distressed", "Clear or escalating difficulty"]
            ] as const).map(([value, label, detail]) => (
              <button
                key={value}
                className={`outcome-button ${outcome === value ? "selected" : ""}`}
                onClick={() => setOutcome(value)}
              >
                <strong>{label}</strong>
                <span>{detail}</span>
              </button>
            ))}
          </div>

          {outcome && outcome !== "relaxed" && (
            <div className="signals-section">
              <span>What did you notice? <small>Optional</small></span>
              <div className="signal-grid">
                {observedSignalOptions.map(({ value, label }) => (
                  <button
                    className={signals.includes(value) ? "selected" : ""}
                    key={value}
                    onClick={() => toggleSignal(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="note-field">
            Note <small>Optional</small>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={280}
              placeholder="Anything worth remembering about today?"
            />
          </label>

          <button
            className="primary-button live-save"
            disabled={!outcome}
            onClick={saveReview}
          >
            Save session
          </button>
        </main>
      </div>
    );
  }

  if (state.phase === "between") {
    return (
      <div className="live-shell">
        <header className="live-header">
          <button className="text-button" onClick={() => void onClose()}>End session</button>
          <span>Settle break</span>
          <span />
        </header>
        <main className="live-centre">
          <p className="kicker light">Back together</p>
          <h1 className="settle-title">Let things feel ordinary again.</h1>
          <p className="live-copy">
            There is no countdown here. Continue only when {dogName} is comfortably settled.
          </p>
          <button
            className="live-primary"
            onClick={() => dispatch({ type: "NEXT_STEP" })}
          >
            Ready for the next departure
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="live-shell">
      <header className="live-header">
        <button className="text-button" onClick={() => void onClose()}>End session</button>
        <span>
          {step.kind === "practice"
            ? `Practice ${state.stepIndex + 1} of ${practice.length}`
            : "Main departure"}
        </span>
        <span />
      </header>

      <main className="live-centre">
        {state.phase === "idle" ? (
          <>
            <p className="kicker light">
              {step.kind === "practice" ? "Short practice departure" : "Today's main departure"}
            </p>
            <div className="live-target">{formatDuration(step.targetSeconds)}</div>
            <p className="live-copy">
              Watch {dogName} on your camera. Come back at the first meaningful sign
              of concern — you never need to finish the clock.
            </p>
            <button
              className="live-primary"
              onClick={() => {
                setNow(Date.now());
                dispatch({ type: "START_STEP", now: Date.now() });
              }}
            >
              I'm leaving now
            </button>
          </>
        ) : (
          <>
            <p className="kicker light">{over ? "Target reached" : "Time remaining"}</p>
            <div className={`live-clock ${over ? "over" : ""}`}>
              {over ? `+${formatDuration(elapsed - step.targetSeconds)}` : formatDuration(remaining)}
            </div>
            <p className="live-elapsed">
              {formatDuration(elapsed)} away · target {formatDuration(step.targetSeconds)}
            </p>
            <button
              className="return-button"
              onClick={() => dispatch({ type: "RETURN", now: Date.now() })}
            >
              I'm back
            </button>
          </>
        )}
      </main>
    </div>
  );
}
