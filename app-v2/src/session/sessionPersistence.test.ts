import { describe, expect, it } from "vitest";
import { initialLiveSession, liveSessionReducer } from "./sessionMachine";
import {
  isRestorableLiveSession,
  makePersistedLiveSession
} from "./sessionPersistence";

describe("active-session persistence", () => {
  it("restores a running session using the original timestamp", () => {
    let state = initialLiveSession([{ kind: "main", targetSeconds: 30 }]);
    state = liveSessionReducer(state, { type: "START_STEP", now: 1_000 });

    const saved = makePersistedLiveSession("training", 30, state, 5_000);
    expect(isRestorableLiveSession(saved, 10_000)).toBe(true);
    expect(saved.state.startedAt).toBe(1_000);
  });

  it("rejects stale active sessions", () => {
    const state = initialLiveSession([{ kind: "main", targetSeconds: 30 }]);
    const saved = makePersistedLiveSession("training", 30, state, 1_000);
    expect(isRestorableLiveSession(saved, 13 * 60 * 60 * 1000)).toBe(false);
  });
});
