import { describe, expect, it } from "vitest";
import {
  CUE_REPETITIONS,
  cueOutcome,
  cuePracticeReadyForDeparture,
  recommendCueLevel
} from "./departureCues";
import type { DepartureCuePractice, DepartureCueSession } from "./types";

function cueSession(
  overrides: Partial<DepartureCueSession> = {}
): DepartureCueSession {
  return {
    id: crypto.randomUUID(),
    at: Date.now(),
    cueIndex: 0,
    relaxedReps: CUE_REPETITIONS,
    concernReps: 0,
    outcome: "relaxed",
    ...overrides
  };
}

describe("departure cue practice", () => {
  it("does not advance after one calm set", () => {
    expect(
      recommendCueLevel({ level: 0, sessions: [cueSession()] })
    ).toMatchObject({ cueIndex: 0 });
  });

  it("advances one level after two calm sets", () => {
    expect(
      recommendCueLevel({
        level: 0,
        sessions: [cueSession(), cueSession()]
      })
    ).toMatchObject({ cueIndex: 1 });
  });

  it("holds after mild concern", () => {
    expect(
      recommendCueLevel({
        level: 2,
        sessions: [
          cueSession({
            cueIndex: 2,
            relaxedReps: 2,
            concernReps: 1,
            outcome: "concern"
          })
        ]
      })
    ).toMatchObject({ cueIndex: 2 });
  });

  it("steps back and flags support after a distressed set", () => {
    expect(
      recommendCueLevel({
        level: 3,
        sessions: [
          cueSession({
            cueIndex: 3,
            relaxedReps: 1,
            concernReps: 2,
            outcome: "distressed"
          })
        ]
      })
    ).toMatchObject({ cueIndex: 2, supportFlag: true });
  });

  it("only opens the timed-departure path after repeated calm final-doorway practice", () => {
    const finalLevel = 7;
    const practice: DepartureCuePractice = {
      level: finalLevel,
      sessions: [
        cueSession({ cueIndex: finalLevel }),
        cueSession({ cueIndex: finalLevel })
      ]
    };

    expect(cuePracticeReadyForDeparture(practice)).toBe(true);
    expect(
      cuePracticeReadyForDeparture({
        ...practice,
        sessions: [cueSession({ cueIndex: finalLevel })]
      })
    ).toBe(false);
    expect(
      cuePracticeReadyForDeparture({
        ...practice,
        sessions: [
          cueSession({ cueIndex: finalLevel }),
          cueSession({
            cueIndex: finalLevel,
            relaxedReps: 2,
            concernReps: 1,
            outcome: "concern"
          })
        ]
      })
    ).toBe(false);
  });

  it("classifies a three-rep set conservatively", () => {
    expect(cueOutcome(3, 0)).toBe("relaxed");
    expect(cueOutcome(2, 1)).toBe("concern");
    expect(cueOutcome(1, 2)).toBe("distressed");
  });
});
