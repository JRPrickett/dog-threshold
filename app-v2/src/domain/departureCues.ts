import type {
  DepartureCuePractice,
  DepartureCueSession,
  Outcome
} from "./types";

export const DEPARTURE_CUES = [
  "Walk toward the exit, then turn away",
  "Stand near the exit for a moment, then move away",
  "Touch the door handle, then let go",
  "Move the handle, then release it",
  "Open the door a little, then close it",
  "Open the door fully, then close it",
  "Step through the doorway, then come straight back",
  "Step through, close the door briefly, then reopen it"
] as const;

export const CUE_REPETITIONS = 3;

export interface CueRecommendation {
  cueIndex: number;
  reason: string;
  supportFlag: boolean;
}

function recentAtLevel(
  sessions: DepartureCueSession[],
  level: number
): DepartureCueSession[] {
  return sessions.filter((session) => session.cueIndex === level).slice(-3);
}

export function cuePracticeReadyForDeparture(
  practice: DepartureCuePractice | undefined
): boolean {
  const finalLevel = DEPARTURE_CUES.length - 1;
  const sessions = recentAtLevel(practice?.sessions ?? [], finalLevel);

  let consecutiveRelaxed = 0;
  for (const session of [...sessions].reverse()) {
    if (session.outcome !== "relaxed") break;
    consecutiveRelaxed += 1;
  }

  return consecutiveRelaxed >= 2;
}

export function recommendCueLevel(
  practice: DepartureCuePractice | undefined
): CueRecommendation {
  const level = Math.max(
    0,
    Math.min(DEPARTURE_CUES.length - 1, practice?.level ?? 0)
  );
  const sessions = practice?.sessions ?? [];
  const latest = sessions.at(-1);

  if (!latest) {
    return {
      cueIndex: level,
      reason:
        "Start with a cue mild enough that your dog can notice it without becoming worried.",
      supportFlag: false
    };
  }

  if (latest.outcome === "distressed") {
    return {
      cueIndex: Math.max(0, latest.cueIndex - 1),
      reason:
        "That cue was too difficult. Stop for now and return to an easier cue next time.",
      supportFlag: true
    };
  }

  if (latest.outcome === "concern") {
    return {
      cueIndex: latest.cueIndex,
      reason:
        "There was some concern, so keep this cue at the same level rather than making it more departure-like.",
      supportFlag: false
    };
  }

  const sameLevel = recentAtLevel(sessions, latest.cueIndex);
  const calmRun = [...sameLevel]
    .reverse()
    .findIndex((session) => session.outcome !== "relaxed");
  const consecutiveRelaxed = calmRun === -1 ? sameLevel.length : calmRun;

  if (
    consecutiveRelaxed >= 2 &&
    latest.cueIndex < DEPARTURE_CUES.length - 1
  ) {
    return {
      cueIndex: latest.cueIndex + 1,
      reason:
        "Two calm practice sets suggest this cue has become ordinary enough to try one small step closer to a real departure.",
      supportFlag: false
    };
  }

  return {
    cueIndex: latest.cueIndex,
    reason:
      "Repeat this cue calmly. There is no need to progress after a single good set.",
    supportFlag: false
  };
}

export function cueOutcome(relaxedReps: number, concernReps: number): Outcome {
  if (concernReps >= 2) return "distressed";
  if (concernReps === 1) return "concern";
  return relaxedReps > 0 ? "relaxed" : "concern";
}
