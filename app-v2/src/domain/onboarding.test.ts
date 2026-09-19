import { describe, expect, it } from "vitest";
import {
  MICRO_DEPARTURE_SECONDS,
  determineStartingPlan
} from "./onboarding";

describe("determineStartingPlan", () => {
  it("routes any meaningful pre-departure cue response to cue practice", () => {
    for (const cueResponse of ["watchful", "distressed", "unsure"] as const) {
      expect(
        determineStartingPlan({
          cueResponse,
          comfortableAbsence: null
        })
      ).toEqual({
        startingPath: "departure-cues",
        startSeconds: MICRO_DEPARTURE_SECONDS
      });
    }
  });

  it("uses an already observed comfortable duration when one is known", () => {
    expect(
      determineStartingPlan({
        cueResponse: "relaxed",
        comfortableAbsence: "yes",
        knownDurationSeconds: 45
      })
    ).toEqual({
      startingPath: "known-duration",
      startSeconds: 45
    });
  });

  it("uses the conservative micro-departure heuristic when comfort is unknown", () => {
    for (const comfortableAbsence of ["no", "unsure"] as const) {
      expect(
        determineStartingPlan({
          cueResponse: "relaxed",
          comfortableAbsence
        })
      ).toEqual({
        startingPath: "micro-departure",
        startSeconds: MICRO_DEPARTURE_SECONDS
      });
    }
  });

  it("does not accept an invalid claimed comfortable duration", () => {
    expect(
      determineStartingPlan({
        cueResponse: "relaxed",
        comfortableAbsence: "yes",
        knownDurationSeconds: 0
      })
    ).toEqual({
      startingPath: "micro-departure",
      startSeconds: MICRO_DEPARTURE_SECONDS
    });
  });
});
