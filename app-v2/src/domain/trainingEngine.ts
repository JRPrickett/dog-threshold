import type { Recommendation, TrainingSession } from "./types";

export function stepSize(seconds: number): number {
  if (seconds < 10) return 1;
  if (seconds < 30) return 2;
  if (seconds < 60) return 3;
  if (seconds < 120) return 5;
  if (seconds < 300) return 10;
  if (seconds < 600) return 15;
  if (seconds < 1800) return 30;
  return 60;
}

function comfortableDuration(session: TrainingSession): number {
  return Math.max(
    1,
    Math.min(
      session.targetSeconds,
      session.stoppedEarly ? session.actualSeconds : session.targetSeconds
    )
  );
}

function latestRelaxedBefore(
  sessions: TrainingSession[],
  endExclusive = sessions.length
): TrainingSession | undefined {
  for (let index = endExclusive - 1; index >= 0; index -= 1) {
    const session = sessions[index];
    if (session.outcome === "relaxed") return session;
  }
  return undefined;
}

function relaxedRun(sessions: TrainingSession[]): number {
  let count = 0;
  for (let index = sessions.length - 1; index >= 0; index -= 1) {
    const session = sessions[index];
    if (session.outcome === "relaxed" && !session.stoppedEarly) count += 1;
    else break;
  }
  return count;
}

function needsSupport(sessions: TrainingSession[]): boolean {
  const recent = sessions.slice(-5);
  const difficult = recent.filter((session) => session.outcome !== "relaxed").length;
  const distressed = recent.filter((session) => session.outcome === "distressed").length;
  return distressed >= 2 || difficult >= 3;
}

export function recommendNext(
  sessions: TrainingSession[],
  configuredStartSeconds: number
): Recommendation {
  const start = Math.max(1, Math.round(configuredStartSeconds || 1));

  if (!sessions.length) {
    return {
      targetSeconds: start,
      direction: "start",
      reason:
        "Start with a duration you have already seen your dog manage comfortably. This is a starting point, not a test of their limit.",
      supportFlag: false,
      restDayRecommended: false
    };
  }

  const last = sessions[sessions.length - 1];
  const supportFlag = needsSupport(sessions);
  /**
   * A single distressed session already softens the next target. When that
   * distress lands on top of a broader recent pattern of difficulty, the
   * better call is to skip training entirely today rather than just make it
   * easier — the pattern most separation-anxiety protocols call a setback.
   */
  const restDayRecommended = supportFlag && last.outcome === "distressed";

  if (last.outcome === "distressed") {
    const previousRelaxed = latestRelaxedBefore(sessions, sessions.length - 1);
    const previousComfort = previousRelaxed
      ? comfortableDuration(previousRelaxed)
      : null;
    const observedUpperBound = last.stoppedEarly
      ? Math.max(
          start,
          last.actualSeconds - stepSize(Math.max(1, last.actualSeconds))
        )
      : start;
    const target = previousComfort === null
      ? observedUpperBound
      : Math.max(start, Math.min(previousComfort, observedUpperBound));

    return {
      targetSeconds: target,
      direction: "reduce",
      reason: last.stoppedEarly
        ? "Clear distress appeared before the target, so the next plan stays below the point where difficulty was observed."
        : "The last session showed clear distress, so the next plan returns to a known comfortable starting point.",
      supportFlag,
      restDayRecommended
    };
  }

  if (last.outcome === "concern") {
    const previousRelaxed = latestRelaxedBefore(sessions, sessions.length - 1);
    const previousComfort = previousRelaxed
      ? comfortableDuration(previousRelaxed)
      : null;
    const reference = last.stoppedEarly
      ? Math.max(1, last.actualSeconds)
      : last.targetSeconds;
    const steppedDown = Math.max(start, reference - stepSize(reference));
    const target = previousComfort === null
      ? steppedDown
      : Math.max(start, Math.min(previousComfort, steppedDown));

    return {
      targetSeconds: target,
      direction: "reduce",
      reason: last.stoppedEarly
        ? "Concern appeared before the target, so the next plan stays below the point where it was observed."
        : "There was some concern last time, so the next plan is easier rather than asking for another increase.",
      supportFlag,
      restDayRecommended
    };
  }

  if (last.stoppedEarly) {
    return {
      targetSeconds: Math.max(start, comfortableDuration(last)),
      direction: "repeat",
      reason:
        "You returned early while things were still relaxed. That actual comfortable duration becomes the next anchor instead of being treated as a failure.",
      supportFlag,
      restDayRecommended
    };
  }

  const run = relaxedRun(sessions);
  if (run < 2) {
    return {
      targetSeconds: last.targetSeconds,
      direction: "repeat",
      reason:
        "One relaxed session is useful evidence. Repeat this duration once before making it harder.",
      supportFlag,
      restDayRecommended
    };
  }

  const increment = stepSize(last.targetSeconds);
  return {
    targetSeconds: last.targetSeconds + increment,
    direction: "increase",
    reason: `Recent sessions were relaxed, so the next plan adds a small ${increment}-second step.`,
    supportFlag,
    restDayRecommended
  };
}

export const DEFAULT_WARMUP_COUNT = 2;

/**
 * `variabilitySeed` (typically how many main departures have already been
 * logged) varies the practice order so a dog can't learn the shape of the
 * warm-up and anticipate what's coming next. `warmupCount` defaults to 2 —
 * the original two-value formula is kept exactly as it was for that default
 * so existing behaviour and tests are unaffected; other counts use a general
 * evenly-spaced formula with a seeded rotation for the same anti-pattern
 * reason.
 */
export function buildPracticeDepartures(
  targetSeconds: number,
  variabilitySeed = 0,
  warmupCount: number = DEFAULT_WARMUP_COUNT
): number[] {
  const target = Math.max(1, Math.round(targetSeconds));
  const count = Math.max(0, Math.min(4, Math.round(warmupCount)));
  if (target < 8 || count === 0) return [];

  if (count === 2) {
    const first = Math.max(2, Math.min(30, Math.round(target * 0.25)));
    const second = Math.max(first + 1, Math.min(60, Math.round(target * 0.5)));

    const values = [first, Math.min(target - 1, second)]
      .filter((value, index, values) => value > 0 && value < target && values.indexOf(value) === index);

    if (values.length === 2 && Math.abs(Math.round(variabilitySeed)) % 2 === 1) {
      values.reverse();
    }

    return values;
  }

  const low = 0.15;
  const high = 0.6;
  const values: number[] = [];
  for (let index = 0; index < count; index += 1) {
    const fraction = count === 1 ? (low + high) / 2 : low + (high - low) * (index / (count - 1));
    let seconds = Math.max(2, Math.min(target - 1, Math.round(target * fraction)));
    if (index > 0 && seconds <= values[index - 1]) {
      seconds = Math.min(target - 1, values[index - 1] + 1);
    }
    values.push(seconds);
  }

  const deduped = values.filter(
    (value, index, all) => value > 0 && value < target && all.indexOf(value) === index
  );
  if (deduped.length <= 1) return deduped;

  const rotation = Math.abs(Math.round(variabilitySeed)) % deduped.length;
  return [...deduped.slice(rotation), ...deduped.slice(0, rotation)];
}

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return minutes > 0
    ? `${minutes}:${String(remainder).padStart(2, "0")}`
    : `${remainder}s`;
}
