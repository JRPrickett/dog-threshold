import { describe, expect, it } from "vitest";
import { backupSummary, parseBackupText } from "./backup";

describe("backup restore", () => {
  it("accepts the production backup envelope", () => {
    const data = parseBackupText(JSON.stringify({
      schemaVersion: 1,
      exportedAt: "2026-09-18T00:00:00.000Z",
      appData: {
        dogName: "Mabel",
        activeScenarioId: "training",
        scenarios: [{
          id: "training",
          label: "Separation training",
          startSeconds: 5,
          sessions: [{
            id: "s1",
            at: 1,
            targetSeconds: 10,
            actualSeconds: 10,
            outcome: "relaxed",
            stoppedEarly: false,
            signals: ["pacing", "invalid"],
            tags: ["after-a-walk", "invalid-tag"],
            stopReason: "doorbell rang",
            note: "calm"
          }],
          warmupCount: 1,
          restSeconds: 45
        }],
        dailyCap: 3
      }
    }));

    expect(data.dogName).toBe("Mabel");
    expect(data.scenarios[0].sessions[0].signals).toEqual(["pacing"]);
    expect(data.scenarios[0].sessions[0].tags).toEqual(["after-a-walk"]);
    expect(data.scenarios[0].sessions[0].stopReason).toBe("doorbell rang");
    expect(data.scenarios[0].warmupCount).toBe(1);
    expect(data.scenarios[0].restSeconds).toBe(45);
    expect(data.dailyCap).toBe(3);
  });

  it("accepts a raw legacy Threshold backup", () => {
    const data = parseBackupText(JSON.stringify({
      version: 5,
      name: "Mabel",
      active: "evening",
      scenarios: [{
        id: "evening",
        label: "Evening",
        start: 8,
        sessions: [{
          id: "old",
          kind: "absence",
          at: 50,
          target: 12,
          actual: 9,
          stopped: true,
          outcome: "ok"
        }]
      }]
    }));

    expect(data.activeScenarioId).toBe("evening");
    expect(data.scenarios[0].sessions[0]).toMatchObject({
      targetSeconds: 12,
      actualSeconds: 9,
      outcome: "concern"
    });
  });

  it("rejects unrecognised JSON", () => {
    expect(() => parseBackupText('{"hello":"world"}')).toThrow(
      /not a recognised/i
    );
  });

  it("summarises everything that will be restored", () => {
    const data = parseBackupText(JSON.stringify({
      activeScenarioId: "a",
      dogName: "Mabel",
      scenarios: [
        {
          id: "a",
          label: "A",
          startSeconds: 5,
          sessions: [],
          cuePractice: {
            level: 0,
            sessions: [{
              id: "c",
              at: 1,
              cueIndex: 0,
              relaxedReps: 3,
              concernReps: 0,
              outcome: "relaxed"
            }]
          }
        },
        {
          id: "b",
          label: "B",
          startSeconds: 5,
          sessions: []
        }
      ]
    }));

    expect(backupSummary(data)).toEqual({
      dogName: "Mabel",
      scenarios: 2,
      sessions: 0,
      cueSets: 1
    });
  });
});
