import type {
  AppData,
  ObservedSignal,
  Outcome,
  DepartureCueSession,
  Scenario,
  TrainingSession
} from "../domain/types";

export const LEGACY_KEY = "threshold.v2";

type LegacySession = {
  id?: string;
  kind?: string;
  at?: number;
  target?: number;
  actual?: number;
  base?: number;
  outcome?: "success" | "ok" | "bad";
  stopped?: boolean;
  tags?: string[];
  note?: string;
  level?: number;
  steps?: number;
  planned?: number;
  wobbles?: number;
};

type LegacyScenario = {
  id: string;
  label: string;
  start: number;
  sessions: LegacySession[];
};

type LegacyState = {
  name?: string;
  active?: string;
  scenarios?: LegacyScenario[];
};

const signalLabels: Record<ObservedSignal, string> = {
  "exit-watching": "Observed: watching the exit",
  pacing: "Observed: pacing",
  panting: "Observed: panting",
  whining: "Observed: whining",
  "barking-howling": "Observed: barking/howling",
  "unable-to-settle": "Observed: unable to settle"
};

function outcomeFromLegacy(value: LegacySession["outcome"]): Outcome {
  if (value === "success") return "relaxed";
  if (value === "ok") return "concern";
  return "distressed";
}

function signalFromTag(tag: string): ObservedSignal | null {
  const match = Object.entries(signalLabels).find(([, label]) => label === tag);
  return (match?.[0] as ObservedSignal | undefined) ?? null;
}

function modernCueSession(session: LegacySession, index: number): DepartureCueSession | null {
  if (session.kind !== "door") return null;

  const concernReps = Math.max(0, Number(session.wobbles ?? 0));
  const planned = Math.max(1, Number(session.planned ?? 3));
  const relaxedReps = Math.max(0, planned - concernReps);

  return {
    id: session.id || `legacy-cue-${index}-${session.at ?? Date.now()}`,
    at: Number(session.at ?? Date.now()),
    cueIndex: Math.max(0, Math.min(7, Number(session.level ?? 0))),
    relaxedReps,
    concernReps,
    outcome: outcomeFromLegacy(session.outcome)
  };
}

function modernSession(session: LegacySession, index: number): TrainingSession | null {
  if (session.kind === "door") return null;

  const target = Math.max(1, Number(session.target ?? session.base ?? 1));
  const actual = Math.max(1, Number(session.actual ?? target));

  return {
    id: session.id || `legacy-${index}-${session.at ?? Date.now()}`,
    at: Number(session.at ?? Date.now()),
    targetSeconds: target,
    actualSeconds: actual,
    outcome: outcomeFromLegacy(session.outcome),
    stoppedEarly: Boolean(session.stopped || actual < target),
    signals: (session.tags ?? [])
      .map(signalFromTag)
      .filter((value): value is ObservedSignal => value !== null),
    note: String(session.note ?? "")
  };
}

function fallback(): AppData {
  return {
    dogName: "",
    scenario: {
      id: "training",
      label: "Separation training",
      startSeconds: 5,
      sessions: []
    }
  };
}

export function readLegacyAppData(storage: Pick<Storage, "getItem"> = localStorage): AppData {
  try {
    const raw = storage.getItem(LEGACY_KEY);
    if (!raw) return fallback();

    const parsed = JSON.parse(raw) as LegacyState;
    if (!Array.isArray(parsed.scenarios) || !parsed.scenarios.length) return fallback();

    const active =
      parsed.scenarios.find((scenario) => scenario.id === parsed.active) ??
      parsed.scenarios[0];

    const scenario: Scenario = {
      id: active.id || "training",
      label: active.label || "Separation training",
      startSeconds: Math.max(1, Number(active.start || 5)),
      sessions: Array.isArray(active.sessions)
        ? active.sessions
            .map(modernSession)
            .filter((session): session is TrainingSession => session !== null)
        : []
    };

    return {
      dogName: String(parsed.name || ""),
      scenario
    };
  } catch {
    return fallback();
  }
}
