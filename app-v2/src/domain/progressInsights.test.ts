import { describe, expect, it } from "vitest";
import { progressInsights } from "./progressInsights";
import type { TrainingSession } from "./types";

function session(
  actualSeconds: number,
  outcome: TrainingSession["outcome"],
  signals: TrainingSession["signals"] = []
): TrainingSession {
  return {
    id: crypto.randomUUID(),
    at: Date.now(),
    targetSeconds: actualSeconds,
    actualSeconds,
    outcome,
    stoppedEarly: false,
    signals,
    note: ""
  };
}

describe("progress insights", () => {
  it("treats longest relaxed duration separately from difficult sessions", () => {
    const result = progressInsights([
      session(20, "relaxed"),
      session(40, "distressed", ["pacing"]),
      session(30, "relaxed")
    ]);
    expect(result.longestRelaxedSeconds).toBe(30);
    expect(result.recentRelaxed).toBe(2);
    expect(result.concernOrDistress).toBe(1);
  });

  it("counts each observed signal once per recent session", () => {
    const result = progressInsights([
      session(20, "concern", ["pacing", "pacing", "whining"]),
      session(20, "concern", ["pacing"])
    ]);
    expect(result.signals).toEqual([
      { signal: "pacing", count: 2 },
      { signal: "whining", count: 1 }
    ]);
  });
});
