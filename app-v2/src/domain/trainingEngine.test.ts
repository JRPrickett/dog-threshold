import { describe, expect, it } from "vitest";
import { buildPracticeDepartures, recommendNext, stepSize } from "./trainingEngine";
import type { TrainingSession } from "./types";

function session(overrides: Partial<TrainingSession> = {}): TrainingSession {
  return {
    id: crypto.randomUUID(),
    at: Date.now(),
    targetSeconds: 30,
    actualSeconds: 30,
    outcome: "relaxed",
    stoppedEarly: false,
    signals: [],
    note: "",
    ...overrides
  };
}

describe("recommendNext", () => {
  it("starts from a known comfortable duration", () => {
    expect(recommendNext([], 5)).toMatchObject({
      targetSeconds: 5,
      direction: "start"
    });
  });

  it("repeats after the first relaxed session", () => {
    expect(recommendNext([session()], 5)).toMatchObject({
      targetSeconds: 30,
      direction: "repeat"
    });
  });

  it("uses a small absolute increase after consecutive relaxed sessions", () => {
    expect(recommendNext([session(), session()], 5)).toMatchObject({
      targetSeconds: 33,
      direction: "increase"
    });
  });

  it("returns to the previous relaxed anchor after distress", () => {
    const result = recommendNext(
      [
        session({ targetSeconds: 24, actualSeconds: 24 }),
        session({
          targetSeconds: 30,
          actualSeconds: 18,
          outcome: "distressed",
          stoppedEarly: true
        })
      ],
      5
    );
    expect(result.targetSeconds).toBe(24);
    expect(result.direction).toBe("reduce");
  });

  it("returns to configured start if distress occurs before any relaxed anchor", () => {
    const result = recommendNext(
      [
        session({
          targetSeconds: 20,
          actualSeconds: 8,
          outcome: "distressed",
          stoppedEarly: true
        })
      ],
      4
    );
    expect(result.targetSeconds).toBe(4);
  });

  it("treats an early relaxed return as a comfortable anchor", () => {
    const result = recommendNext(
      [
        session({
          targetSeconds: 30,
          actualSeconds: 19,
          stoppedEarly: true
        })
      ],
      5
    );
    expect(result.targetSeconds).toBe(19);
    expect(result.direction).toBe("repeat");
  });

  it("flags repeated difficult sessions for support", () => {
    const result = recommendNext(
      [
        session({ outcome: "concern" }),
        session({ outcome: "distressed" }),
        session({ outcome: "concern" })
      ],
      5
    );
    expect(result.supportFlag).toBe(true);
  });
});

describe("stepSize", () => {
  it.each([
    [5, 1],
    [20, 2],
    [45, 3],
    [90, 5],
    [240, 10],
    [480, 15],
    [1200, 30],
    [2400, 60]
  ])("uses transparent tiered increments for %i seconds", (seconds, expected) => {
    expect(stepSize(seconds)).toBe(expected);
  });
});

describe("buildPracticeDepartures", () => {
  it("does not add practice departures for very short targets", () => {
    expect(buildPracticeDepartures(6)).toEqual([]);
  });

  it("keeps practice departures shorter than the main target", () => {
    const practice = buildPracticeDepartures(120);
    expect(practice.length).toBeGreaterThan(0);
    expect(practice.every((seconds) => seconds < 120)).toBe(true);
  });
});
