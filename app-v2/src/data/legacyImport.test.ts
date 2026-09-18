import { describe, expect, it } from "vitest";
import { LEGACY_KEY, readLegacyAppData } from "./legacyImport";

function storageFor(value: unknown): Pick<Storage, "getItem"> {
  return {
    getItem(key: string) {
      return key === LEGACY_KEY ? JSON.stringify(value) : null;
    }
  };
}

describe("legacy Threshold import", () => {
  it("preserves every scenario and the active scenario", () => {
    const data = readLegacyAppData(
      storageFor({
        name: "Mabel",
        active: "evening",
        scenarios: [
          {
            id: "morning",
            label: "Morning",
            start: 5,
            sessions: [
              {
                id: "a",
                kind: "absence",
                at: 100,
                target: 10,
                actual: 10,
                outcome: "success"
              }
            ]
          },
          {
            id: "evening",
            label: "Evening",
            start: 8,
            sessions: [
              {
                id: "b",
                kind: "absence",
                at: 200,
                target: 12,
                actual: 8,
                stopped: true,
                outcome: "ok"
              }
            ]
          }
        ]
      })
    );

    expect(data.dogName).toBe("Mabel");
    expect(data.activeScenarioId).toBe("evening");
    expect(data.scenarios).toHaveLength(2);
    expect(data.scenarios[0].sessions[0].outcome).toBe("relaxed");
    expect(data.scenarios[1].sessions[0]).toMatchObject({
      targetSeconds: 12,
      actualSeconds: 8,
      stoppedEarly: true,
      outcome: "concern"
    });
  });

  it("maps legacy freeform tags onto known context tags and keeps stop reason", () => {
    const data = readLegacyAppData(
      storageFor({
        name: "Mabel",
        active: "training",
        scenarios: [
          {
            id: "training",
            label: "Separation training",
            start: 5,
            sessions: [
              {
                id: "a",
                kind: "absence",
                at: 100,
                target: 20,
                actual: 12,
                stopped: true,
                stopReason: "Doorbell rang",
                outcome: "ok",
                tags: ["After a walk", "Radio or TV on", "something unrecognised"]
              }
            ]
          }
        ]
      })
    );

    const session = data.scenarios[0].sessions[0];
    expect(session.tags).toEqual(["after-a-walk", "radio-or-tv-on"]);
    expect(session.stopReason).toBe("Doorbell rang");
  });

  it("maps legacy door-practice history without losing the timed log", () => {
    const data = readLegacyAppData(
      storageFor({
        name: "Mabel",
        active: "training",
        scenarios: [
          {
            id: "training",
            label: "Separation training",
            start: 5,
            sessions: [
              {
                id: "door-1",
                kind: "door",
                at: 100,
                level: 2,
                planned: 3,
                wobbles: 1,
                outcome: "ok"
              },
              {
                id: "absence-1",
                kind: "absence",
                at: 200,
                target: 15,
                actual: 15,
                outcome: "success"
              }
            ]
          }
        ]
      })
    );

    const scenario = data.scenarios[0];
    expect(scenario.sessions).toHaveLength(1);
    expect(scenario.cuePractice?.sessions).toHaveLength(1);
    expect(scenario.cuePractice?.sessions[0]).toMatchObject({
      cueIndex: 2,
      relaxedReps: 2,
      concernReps: 1,
      outcome: "concern"
    });
  });
});
