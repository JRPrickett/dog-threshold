import type { StartingPath } from "./types";

export type DepartureCueResponse =
  | "relaxed"
  | "watchful"
  | "distressed"
  | "unsure";

export type ComfortableAbsenceAnswer = "yes" | "no" | "unsure";

export interface OnboardingAnswers {
  cueResponse: DepartureCueResponse;
  comfortableAbsence: ComfortableAbsenceAnswer | null;
  knownDurationSeconds?: number;
}

export interface StartingPlan {
  startingPath: StartingPath;
  startSeconds: number;
}

export const ONBOARDING_VERSION = 2 as const;

/**
 * Published guidance supports beginning with a departure brief enough not to
 * evoke anxiety, but does not establish a universal number of seconds.
 *
 * One second is therefore a deliberately conservative SettledSolo product
 * heuristic for owners who have never observed a known-comfortable absence.
 */
export const MICRO_DEPARTURE_SECONDS = 1;

export function determineStartingPlan(
  answers: OnboardingAnswers
): StartingPlan {
  if (answers.cueResponse !== "relaxed") {
    return {
      startingPath: "departure-cues",
      startSeconds: MICRO_DEPARTURE_SECONDS
    };
  }

  const knownDuration = Math.round(Number(answers.knownDurationSeconds));
  if (
    answers.comfortableAbsence === "yes" &&
    Number.isFinite(knownDuration) &&
    knownDuration >= 1 &&
    knownDuration <= 7200
  ) {
    return {
      startingPath: "known-duration",
      startSeconds: knownDuration
    };
  }

  return {
    startingPath: "micro-departure",
    startSeconds: MICRO_DEPARTURE_SECONDS
  };
}
