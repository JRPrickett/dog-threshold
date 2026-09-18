import type {
  AppData,
  DepartureCuePractice,
  DepartureCueSession,
  Outcome,
  Scenario,
  SessionTag,
  TrainingSession
} from "../domain/types";
import { SESSION_TAG_OPTIONS } from "../domain/sessionTags";

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
  stopReason?: string;
  tags?: string[];
  note?: string;
  level?: number;
  steps?: number;
  planned?: number;
  wobbles?: number;
};

type LegacyScenario = {
  id?: string;
  label?: string;
  start?: number;
  sessions?: LegacySession[];
};

type LegacyState = {
  name?: string;
  active?: string;
  scenarios?: LegacyScenario[];
};

function outcomeFromLegacy(value: LegacySession["outcome"]): Outcome {
  if (value === "success") return "relaxed";
  if (value === "ok") return "concern";
  return "distressed";
}

/**
 * The legacy app had no structured observed-signal data, only a freeform
 * tags field suggested from a fixed chip list (Morning, After a walk, and
 * so on) that the modern app now models as SessionTag. Anything a legacy
 * user typed beyond those suggestions doesn't map onto a known tag and is
 * dropped rather than guessed at.
 */
function tagFromLegacyLabel(label: string): SessionTag | null {
  const normalised = label.trim().toLowerCase();
  const match = SESSION_TAG_OPTIONS.find(
    (option) => option.label.toLowerCase() === normalised
  );
  return match?.value ?? null;
}

function modernSession(session: LegacySession, index: number): TrainingSession | null {
  if (session.kind === "door") return null;

  const target = Math.max(1, Number(session.target ?? session.base ?? 1));
  const actual = Math.max(1, Number(session.actual ?? target));
  const stoppedEarly = Boolean(session.stopped || actual < target);

  return {
    id: session.id || `legacy-${index}-${session.at ?? Date.now()}`,
    at: Number(session.at ?? Date.now()),
    targetSeconds: target,
    actualSeconds: actual,
    outcome: outcomeFromLegacy(session.outcome),
    stoppedEarly,
    signals: [],
    tags: [
      ...new Set(
        (session.tags ?? [])
          .map(tagFromLegacyLabel)
          .filter((value): value is SessionTag => value !== null)
      )
    ],
    stopReason: stoppedEarly ? String(session.stopReason ?? "").slice(0, 80) : "",
    note: String(session.note ?? "")
  };
}

function modernCueSession(
  session: LegacySession,
  index: number
): DepartureCueSession | null {
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

function modernScenario(
  scenario: LegacyScenario,
  index: number
): Scenario {
  const sessions = Array.isArray(scenario.sessions) ? scenario.sessions : [];
  const timed = sessions
    .map(modernSession)
    .filter((session): session is TrainingSession => session !== null);
  const cueSessions = sessions
    .map(modernCueSession)
    .filter((session): session is DepartureCueSession => session !== null);

  const cuePractice: DepartureCuePractice | undefined = cueSessions.length
    ? {
        level: cueSessions.at(-1)?.cueIndex ?? 0,
        sessions: cueSessions
      }
    : undefined;

  return {
    id: String(scenario.id || `scenario-${index + 1}`),
    label: String(scenario.label || `Scenario ${index + 1}`),
    startSeconds: Math.max(1, Number(scenario.start || 5)),
    sessions: timed,
    cuePractice
  };
}

function fallback(): AppData {
  return {
    dogName: "",
    activeScenarioId: "training",
    scenarios: [
      {
        id: "training",
        label: "Separation training",
        startSeconds: 5,
        sessions: []
      }
    ]
  };
}

export function readLegacyAppData(
  storage: Pick<Storage, "getItem"> = localStorage
): AppData {
  try {
    const raw = storage.getItem(LEGACY_KEY);
    if (!raw) return fallback();

    const parsed = JSON.parse(raw) as LegacyState;
    if (!Array.isArray(parsed.scenarios) || !parsed.scenarios.length) {
      return fallback();
    }

    const scenarios = parsed.scenarios.map(modernScenario);
    const requestedActive = String(parsed.active || "");

    return {
      dogName: String(parsed.name || ""),
      activeScenarioId: scenarios.some(
        (scenario) => scenario.id === requestedActive
      )
        ? requestedActive
        : scenarios[0].id,
      scenarios
    };
  } catch {
    return fallback();
  }
}
