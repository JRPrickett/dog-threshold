import {
  useEffect,
  useMemo,
  useReducer,
  useState
} from "react";
import { progressInsights } from "./domain/progressInsights";
import {
  buildPracticeDepartures,
  formatDuration,
  recommendNext
} from "./domain/trainingEngine";
import {
  CUE_REPETITIONS,
  DEPARTURE_CUES,
  cueOutcome,
  recommendCueLevel
} from "./domain/departureCues";
import type {
  AppData,
  DepartureCueSession,
  ObservedSignal,
  Outcome,
  TrainingSession
} from "./domain/types";
import { activeScenario } from "./data/appData";
import {
  downloadBackup,
  downloadSessionsCsv
} from "./data/export";
import {
  createAppRepository,
  type StorageMode
} from "./data/repository";
import {
  isRestorableLiveSession,
  makePersistedLiveSession,
  type PersistedLiveSession
} from "./session/sessionPersistence";
import { PwaUpdateNotice } from "./pwa/PwaUpdateNotice";
import {
  elapsedSeconds,
  initialLiveSession,
  liveSessionReducer,
  type SessionStep
} from "./session/sessionMachine";

type Screen = "today" | "progress" | "history" | "more";

const signalOptions: Array<{ value: ObservedSignal; label: string }> = [
  { value: "exit-watching", label: "Watching the exit" },
  { value: "pacing", label: "Pacing" },
  { value: "panting", label: "Panting" },
  { value: "whining", label: "Whining" },
  { value: "barking-howling", label: "Barking / howling" },
  { value: "unable-to-settle", label: "Unable to settle" }
];

function Setup({
  onSaved
}: {
  onSaved: (dogName: string, startSeconds: number) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [seconds, setSeconds] = useState(5);

  return (
    <main className="setup-shell">
      <section className="setup-card">
        <div className="brand-orbit" aria-hidden="true">
          <span />
        </div>
        <p className="kicker">A calmer starting point</p>
        <h1>Build comfortable alone time, one small step at a time.</h1>
        <p className="lead">
          Start below the first sign of worry. Use a camera whenever you can and come
          back early if your dog needs you.
        </p>

        <label>
          Your dog's name
          <input
            autoComplete="off"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Mabel"
            maxLength={40}
          />
        </label>

        <label>
          A duration you already know feels comfortable
          <div className="duration-input">
            <input
              type="number"
              min={1}
              max={7200}
              value={seconds}
              onChange={(event) => setSeconds(Number(event.target.value))}
            />
            <span>seconds</span>
          </div>
        </label>

        <p className="field-help">
          This is not a test of the longest your dog can tolerate. Pick something
          you have already seen them manage calmly.
        </p>

        <button
          className="primary-button"
          disabled={!name.trim() || !Number.isFinite(seconds) || seconds < 1}
          onClick={() => void onSaved(name, seconds)}
        >
          Set up today's training
        </button>

        <p className="disclaimer">
          This app supports gradual training and record keeping. It does not diagnose
          separation anxiety or replace veterinary or qualified behavioural care.
        </p>
      </section>
    </main>
  );
}

function AccountNotice({ storageMode }: { storageMode: StorageMode }) {
  if (storageMode === "memory") {
    return (
      <aside className="account-notice storage-danger" role="status">
        <div>
          <strong>This browser cannot save progress reliably.</strong>
          <span>
            Keep this page open for this session and try a normal browser window before
            relying on the training history.
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="account-notice">
      <div>
        <strong>Your progress is saved on this device.</strong>
        <span>
          {storageMode === "localstorage"
            ? "Using compatibility storage. Create a free account later for safer backup across devices."
            : "Create a free account later to back it up and use it on other devices."}
        </span>
      </div>
      <button type="button" disabled title="Account sync is the next production phase">
        Soon
      </button>
    </aside>
  );
}

function Today({
  data,
  storageMode,
  onStart,
  onOpenCuePractice
}: {
  data: AppData;
  storageMode: StorageMode;
  onStart: (target: number) => void;
  onOpenCuePractice: () => void;
}) {
  const scenario = activeScenario(data);
  const recommendation = useMemo(
    () => recommendNext(scenario.sessions, scenario.startSeconds),
    [scenario]
  );
  const practice = buildPracticeDepartures(recommendation.targetSeconds);

  return (
    <div className="screen-stack">
      <AccountNotice storageMode={storageMode} />

      <section className="today-card">
        <p className="kicker">Today's plan</p>
        <div className="target-row">
          <div>
            <h1>{formatDuration(recommendation.targetSeconds)}</h1>
            <p>main departure</p>
          </div>
          <span className={`direction direction-${recommendation.direction}`}>
            {recommendation.direction === "increase"
              ? "Small step up"
              : recommendation.direction === "reduce"
                ? "Easier today"
                : recommendation.direction === "start"
                  ? "Starting point"
                  : "Repeat"}
          </span>
        </div>

        {practice.length > 0 && (
          <div className="practice-preview">
            <span>Before the main departure</span>
            <strong>
              {practice.map((seconds) => formatDuration(seconds)).join(" · ")}
            </strong>
            <small>Short practice departures with calm settle time between them.</small>
          </div>
        )}

        <div className="why-card">
          <span>Why this plan?</span>
          <p>{recommendation.reason}</p>
        </div>

        {recommendation.supportFlag && (
          <div className="support-card">
            Several recent sessions showed concern. Make things easier and consider
            checking in with a qualified behaviour professional before pushing duration.
          </div>
        )}

        <button
          className="primary-button start-button"
          onClick={() => onStart(recommendation.targetSeconds)}
        >
          Start session
        </button>
        <p className="ceiling-note">
          The target is a ceiling, not a quota. Returning early is always okay.
        </p>
      </section>

      <section className="quiet-card">
        <div>
          <p className="kicker">Current track</p>
          <h2>{scenario.label}</h2>
        </div>
        <div className="mini-stat">
          <strong>{scenario.sessions.length}</strong>
          <span>sessions logged</span>
        </div>
      </section>

      <section className="cue-entry-card">
        <div>
          <p className="kicker">Before you can leave</p>
          <h2>Does getting ready to go already cause worry?</h2>
          <p>
            Practise departure cues without actually leaving, so keys, shoes and the
            door become less predictive.
          </p>
        </div>
        <button className="secondary-button" onClick={onOpenCuePractice}>
          Departure cue practice
        </button>
      </section>
    </div>
  );
}

function Progress({ data }: { data: AppData }) {
  const scenario = activeScenario(data);
  const sessions = scenario.sessions;
  const insights = progressInsights(sessions);
  const signalLabel = new Map(
    signalOptions.map(({ value, label }) => [value, label])
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

function History({ data }: { data: AppData }) {
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

function More({
  data,
  onSelectScenario
}: {
  data: AppData;
  onSelectScenario: (id: string) => Promise<void>;
}) {
  const scenario = activeScenario(data);
  return (
    <div className="screen-stack">
      <section className="page-heading">
        <p className="kicker">More</p>
        <h1>{data.dogName}'s training settings.</h1>
      </section>

      <section className="menu-card">
        <div>
          <strong>Account & backup</strong>
          <span>Optional cloud backup and cross-device sync</span>
        </div>
        <span className="soon-pill">Coming next</span>
      </section>

      {data.scenarios.length > 1 && (
        <section className="menu-card scenario-switch-card">
          <div>
            <strong>Training track</strong>
            <span>Keep different routines on separate progress histories.</span>
          </div>
          <select
            aria-label="Training track"
            value={scenario.id}
            onChange={(event) => void onSelectScenario(event.target.value)}
          >
            {data.scenarios.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </section>
      )}

      <section className="menu-card">
        <div>
          <strong>Starting comfort</strong>
          <span>{formatDuration(scenario.startSeconds)} known comfortable duration</span>
        </div>
      </section>

      <section className="data-tools-card">
        <div>
          <p className="kicker">Your data</p>
          <h2>Keep a copy whenever you want.</h2>
          <p>
            Export a complete backup or a spreadsheet-friendly session history. These
            exports stay free even if paid features are added later.
          </p>
        </div>
        <div className="data-tools-actions">
          <button onClick={() => downloadBackup(data)}>Download backup</button>
          <button onClick={() => downloadSessionsCsv(data)}>Export CSV</button>
        </div>
      </section>

      <section className="quiet-card vertical">
        <p className="kicker">Evidence-aware, not algorithm worship</p>
        <h2>Every recommendation should be explainable.</h2>
        <p>
          The new engine is based on gradual systematic desensitisation and observed
          behaviour. Its exact software step sizes are conservative product heuristics,
          not a claim that science has discovered the perfect percentage increase.
        </p>
      </section>
    </div>
  );
}

function DepartureCuePracticeView({
  data,
  onClose,
  onSaved
}: {
  data: AppData;
  onClose: () => void;
  onSaved: (session: DepartureCueSession, nextLevel: number) => Promise<void>;
}) {
  const scenario = activeScenario(data);
  const recommendation = useMemo(
    () => recommendCueLevel(scenario.cuePractice),
    [scenario.cuePractice]
  );
  const [rep, setRep] = useState(0);
  const [relaxedReps, setRelaxedReps] = useState(0);
  const [concernReps, setConcernReps] = useState(0);
  const complete = rep >= CUE_REPETITIONS;

  function record(relaxed: boolean) {
    if (complete) return;
    setRep((value) => value + 1);
    if (relaxed) setRelaxedReps((value) => value + 1);
    else setConcernReps((value) => value + 1);
  }

  async function save() {
    const outcome = cueOutcome(relaxedReps, concernReps);
    const session: DepartureCueSession = {
      id: `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      at: Date.now(),
      cueIndex: recommendation.cueIndex,
      relaxedReps,
      concernReps,
      outcome
    };

    const previewPractice = {
      level: recommendation.cueIndex,
      sessions: [...(scenario.cuePractice?.sessions ?? []), session]
    };
    const next = recommendCueLevel(previewPractice);
    await onSaved(session, next.cueIndex);
  }

  return (
    <div className="cue-shell">
      <header className="live-header cue-header">
        <button className="text-button" onClick={onClose}>Close</button>
        <span>Departure cue practice</span>
        <span />
      </header>

      <main className="cue-content">
        <p className="kicker">Current cue</p>
        <h1>{DEPARTURE_CUES[recommendation.cueIndex]}</h1>
        <p className="cue-reason">{recommendation.reason}</p>

        {recommendation.supportFlag && (
          <div className="support-card">
            The last set was too difficult. Stop if your dog is already distressed and
            consider getting professional behavioural support before making the cue harder.
          </div>
        )}

        {!complete ? (
          <>
            <div className="rep-counter">
              <span>Rep {rep + 1} of {CUE_REPETITIONS}</span>
              <div>
                {Array.from({ length: CUE_REPETITIONS }, (_, index) => (
                  <i key={index} className={index < rep ? "done" : ""} />
                ))}
              </div>
            </div>

            <p className="cue-instruction">
              Present the cue once, then return to normal. Do not leave. Give your dog time
              to settle before the next repetition.
            </p>

            <div className="cue-actions">
              <button onClick={() => record(true)}>
                <strong>Relaxed</strong>
                <span>No meaningful worry</span>
              </button>
              <button onClick={() => record(false)}>
                <strong>Concerned</strong>
                <span>Pause and make it easier</span>
              </button>
            </div>
          </>
        ) : (
          <section className="cue-summary">
            <p className="kicker">Set complete</p>
            <h2>
              {concernReps === 0
                ? "All three repetitions stayed calm."
                : concernReps === 1
                  ? "There was some concern."
                  : "This cue was too difficult today."}
            </h2>
            <p>
              {concernReps === 0
                ? "Save the set. The app will only move on after repeated calm practice."
                : "Save the set and keep the next practice easier. There is no benefit in pushing through worry."}
            </p>
            <button className="primary-button" onClick={() => void save()}>
              Save cue practice
            </button>
          </section>
        )}
      </main>
    </div>
  );
}

function LiveSession({
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
                {signalOptions.map(({ value, label }) => (
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

export default function App() {
  const repository = useMemo(() => createAppRepository(), []);
  const [data, setData] = useState<AppData | null>(null);
  const [storageMode, setStorageMode] = useState<StorageMode>("indexeddb");
  const [screen, setScreen] = useState<Screen>("today");
  const [liveTarget, setLiveTarget] = useState<number | null>(null);
  const [cuePracticeOpen, setCuePracticeOpen] = useState(false);
  const [restoredState, setRestoredState] =
    useState<PersistedLiveSession["state"] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    void Promise.all([
      repository.loadAppData(),
      repository.loadActiveSession()
    ]).then(([loadedData, active]) => {
      if (cancelled) return;
      setData(loadedData);
      setStorageMode(repository.storageMode());

      if (
        isRestorableLiveSession(active) &&
        loadedData.scenarios.some((scenario) => scenario.id === active.scenarioId)
      ) {
        setData({ ...loadedData, activeScenarioId: active.scenarioId });
        setLiveTarget(active.targetSeconds);
        setRestoredState(active.state);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [repository]);

  if (!data) {
    return (
      <main className="setup-shell">
        <section className="setup-card loading-card" aria-live="polite">
          <div className="brand-orbit" aria-hidden="true"><span /></div>
          <p className="kicker">Opening your training log</p>
          <h1>Getting things ready.</h1>
        </section>
      </main>
    );
  }

  if (!data.dogName) {
    return (
      <Setup
        onSaved={async (dogName, startSeconds) => {
          setData(await repository.saveSetup(dogName, startSeconds));
          setStorageMode(repository.storageMode());
        }}
      />
    );
  }

  if (cuePracticeOpen) {
    return (
      <DepartureCuePracticeView
        data={data}
        onClose={() => setCuePracticeOpen(false)}
        onSaved={async (session, nextLevel) => {
          setData(await repository.appendDepartureCueSession(session, nextLevel));
          setStorageMode(repository.storageMode());
          setCuePracticeOpen(false);
          setScreen("today");
        }}
      />
    );
  }

  if (liveTarget !== null) {
    return (
      <LiveSession
        scenarioId={activeScenario(data).id}
        targetSeconds={liveTarget}
        dogName={data.dogName}
        initialState={restoredState}
        onPersist={(snapshot) => repository.saveActiveSession(snapshot)}
        onClose={async () => {
          await repository.clearActiveSession();
          setLiveTarget(null);
          setRestoredState(undefined);
        }}
        onSaved={async (session) => {
          setData(
            await repository.appendSession(session, activeScenario(data).id)
          );
          setStorageMode(repository.storageMode());
          await repository.clearActiveSession();
          setLiveTarget(null);
          setRestoredState(undefined);
          setScreen("today");
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <span className="wordmark">Threshold</span>
          <small>working name</small>
        </div>
        <div className="dog-chip">{data.dogName}</div>
      </header>

      <main className="app-content">
        {screen === "today" && (
          <Today
            data={data}
            storageMode={storageMode}
            onStart={(target) => {
              setRestoredState(undefined);
              setLiveTarget(target);
            }}
            onOpenCuePractice={() => setCuePracticeOpen(true)}
          />
        )}
        {screen === "progress" && <Progress data={data} />}
        {screen === "history" && <History data={data} />}
        {screen === "more" && (
          <More
            data={data}
            onSelectScenario={async (id) => {
              setData(await repository.setActiveScenario(id));
              setStorageMode(repository.storageMode());
              setScreen("today");
            }}
          />
        )}
      </main>

      <PwaUpdateNotice />

      <nav className="bottom-nav" aria-label="Main navigation">
        {([
          ["today", "Today"],
          ["progress", "Progress"],
          ["history", "History"],
          ["more", "More"]
        ] as const).map(([value, label]) => (
          <button
            key={value}
            aria-current={screen === value ? "page" : undefined}
            onClick={() => setScreen(value)}
          >
            <span className="nav-mark" aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
