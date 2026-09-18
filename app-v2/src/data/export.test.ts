import { describe, expect, it } from "vitest";
import { makeBackup, makeSessionsCsv } from "./export";
import type { AppData } from "../domain/types";

const data: AppData = {
  dogName: "Mabel",
  activeScenarioId: "morning",
  scenarios: [
    {
      id: "morning",
      label: "Morning",
      startSeconds: 5,
      sessions: [
        {
          id: "one",
          at: Date.UTC(2026, 8, 18, 8, 0, 0),
          targetSeconds: 30,
          actualSeconds: 25,
          outcome: "concern",
          stoppedEarly: true,
          signals: ["pacing"],
          tags: ["after-a-walk"],
          stopReason: "Dog seemed unsettled",
          note: 'Watched the door, then "paced"'
        }
      ]
    },
    {
      id: "evening",
      label: "Evening",
      startSeconds: 8,
      sessions: []
    }
  ]
};

describe("data exports", () => {
  it("backs up the complete app data model", () => {
    expect(makeBackup(data).appData.scenarios).toHaveLength(2);
    expect(makeBackup(data).appData.dogName).toBe("Mabel");
  });

  it("creates a readable escaped CSV across scenarios", () => {
    const csv = makeSessionsCsv(data);
    expect(csv).toContain('"Morning"');
    expect(csv).toContain('"concern"');
    expect(csv).toContain('"pacing"');
    expect(csv).toContain('"After a walk"');
    expect(csv).toContain('"Dog seemed unsettled"');
    expect(csv).toContain('"Watched the door, then ""paced"""');
  });
});
