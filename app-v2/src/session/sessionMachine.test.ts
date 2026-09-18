import { describe, expect, it } from "vitest";
import {
  elapsedSeconds,
  initialLiveSession,
  liveSessionReducer
} from "./sessionMachine";

describe("live session state machine", () => {
  it("derives elapsed time from timestamps rather than interval ticks", () => {
    let state = initialLiveSession([{ kind: "main", targetSeconds: 30 }]);
    state = liveSessionReducer(state, { type: "START_STEP", now: 1_000 });
    expect(elapsedSeconds(state, 16_750)).toBe(15);
  });

  it("moves practice departure into a settle break", () => {
    let state = initialLiveSession([
      { kind: "practice", targetSeconds: 5 },
      { kind: "main", targetSeconds: 20 }
    ]);
    state = liveSessionReducer(state, { type: "START_STEP", now: 1_000 });
    state = liveSessionReducer(state, { type: "RETURN", now: 6_000 });
    expect(state.phase).toBe("between");
    state = liveSessionReducer(state, { type: "NEXT_STEP" });
    expect(state.stepIndex).toBe(1);
    expect(state.phase).toBe("idle");
  });

  it("moves the main departure to review and records actual duration", () => {
    let state = initialLiveSession([{ kind: "main", targetSeconds: 20 }]);
    state = liveSessionReducer(state, { type: "START_STEP", now: 1_000 });
    state = liveSessionReducer(state, { type: "RETURN", now: 18_500 });
    expect(state.phase).toBe("review");
    expect(state.mainActualSeconds).toBe(17);
  });
});
