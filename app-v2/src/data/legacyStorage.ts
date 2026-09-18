import type {
  AppData,
  ObservedSignal,
  Outcome,
  Scenario,
  TrainingSession
} from "../domain/types";

const KEY = "threshold.v2";

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
  warmups?: number;
  warmDone?: number;
  warmTimes?: number[];
};

type LegacyScenario = {
  id: string;
  label: string;
  start: number;
  sessions: LegacySession[];
  warmups?: number;
  rest?: number;
  override?: number | null;
  mode?: string;
  doorLevel?: number;
};

type LegacyState = {
  version: number;
  name: string;
  active: string;
  setupDone: boolean;
  scenarios: LegacyScenario[];
  [key: string]: unknown;
};

function defaultState(): LegacyState {
  return {
    version: 5,
    name: "",
    active: "training",
    setupDone: false,
    scenarios: [
      {
        id: "training",
        label: "Separation training",
        start: 5,
        warmups: 2,
        rest: 60,
        sessions: [],
        override: null,
        mode: "absence",
        doorLevel: 0
      }
    ]
  };
}

function readRaw(): LegacyState {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as LegacyState | null;
    if (parsed?.scenarios?.length) return parsed;
  } catch {
    // A malformed legacy value should not make the modern shell unusable.
  }
  return defaultState();
}

function outcomeFromLegacy(value: LegacySession["outcome"]): Outcome {
  if (value === "success") return "relaxed";
  if (value === "ok") return "concern";
  return "distressed";
}

function outcomeToLegacy(value: Outcome): LegacySession["outcome"] {
  if (value === "relaxed") return "success";
  if (value === "concern") return "ok";
  return "bad";
}

const signalLabels: Record<ObservedSignal, string> = {
  "exit-watching": "Observed: watching the exit",
  pacing: "Observed: pacing",
  panting: "Observed: panting",
  whining: "Observed: whining",
  "barking-howling": "Observed: barking/howling",
  "unable-to-settle": "Observed: unable to settle"
};

function signalFromTag(tag: string): ObservedSignal | null {
  const match = Object.entries(signalLabels).find(([, label]) => label === tag);
  return (match?.[0] as ObservedSignal | undefined) ?? null;
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

function activeScenario(raw: LegacyState): LegacyScenario {
  return raw.scenarios.find((scenario) => scenario.id === raw.active) ?? raw.scenarios[0];
}

export function loadAppData(): AppData {
  const raw = readRaw();
  const legacyScenario = activeScenario(raw);
  const scenario: Scenario = {
    id: legacyScenario.id,
    label: legacyScenario.label || "Separation training",
    startSeconds: Math.max(1, Number(legacyScenario.start || 5)),
    sessions: legacyScenario.sessions
      .map(modernSession)
      .filter((session): session is TrainingSession => session !== null)
  };
  return {
    dogName: String(raw.name || ""),
    scenario
  };
}

export function saveSetup(dogName: string, startSeconds: number): AppData {
  const raw = readRaw();
  raw.name = dogName.trim().slice(0, 40);
  raw.setupDone = true;
  activeScenario(raw).start = Math.max(1, Math.round(startSeconds));
  localStorage.setItem(KEY, JSON.stringify(raw));
  return loadAppData();
}

export function appendSession(
  session: TrainingSession,
  practiceDepartures: number[]
): AppData {
  const raw = readRaw();
  const scenario = activeScenario(raw);
  scenario.sessions.push({
    id: session.id,
    kind: "absence",
    at: session.at,
    target: session.targetSeconds,
    actual: session.actualSeconds,
    base: session.targetSeconds,
    outcome: outcomeToLegacy(session.outcome),
    stopped: session.stoppedEarly,
    tags: session.signals.map((signal) => signalLabels[signal]),
    note: session.note,
    warmups: practiceDepartures.length,
    warmDone: practiceDepartures.length,
    warmTimes: practiceDepartures
  });
  raw.setupDone = true;
  localStorage.setItem(KEY, JSON.stringify(raw));
  return loadAppData();
}
