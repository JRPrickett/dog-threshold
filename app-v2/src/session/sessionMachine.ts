export type SessionPhase = "idle" | "running" | "between" | "review";

export interface SessionStep {
  kind: "practice" | "main";
  targetSeconds: number;
}

export interface LiveSessionState {
  phase: SessionPhase;
  steps: SessionStep[];
  stepIndex: number;
  startedAt: number | null;
  returnedAt: number | null;
  mainActualSeconds: number | null;
  warningIssued: boolean;
  targetIssued: boolean;
}

export type LiveSessionAction =
  | { type: "START_STEP"; now: number }
  | { type: "RETURN"; now: number }
  | { type: "NEXT_STEP" }
  | { type: "MARK_WARNING_ISSUED" }
  | { type: "MARK_TARGET_ISSUED" }
  | { type: "RESET" };

export function initialLiveSession(steps: SessionStep[]): LiveSessionState {
  return {
    phase: "idle",
    steps,
    stepIndex: 0,
    startedAt: null,
    returnedAt: null,
    mainActualSeconds: null,
    warningIssued: false,
    targetIssued: false
  };
}

export function elapsedSeconds(state: LiveSessionState, now: number): number {
  if (state.startedAt === null) return 0;
  const end = state.returnedAt ?? now;
  return Math.max(0, Math.floor((end - state.startedAt) / 1000));
}

export function liveSessionReducer(
  state: LiveSessionState,
  action: LiveSessionAction
): LiveSessionState {
  switch (action.type) {
    case "START_STEP":
      if (state.phase !== "idle") return state;
      return {
        ...state,
        phase: "running",
        startedAt: action.now,
        returnedAt: null,
        warningIssued: false,
        targetIssued: false
      };

    case "RETURN": {
      if (state.phase !== "running" || state.startedAt === null) return state;
      const actual = Math.max(1, Math.floor((action.now - state.startedAt) / 1000));
      const current = state.steps[state.stepIndex];
      const isMain = current?.kind === "main";
      return {
        ...state,
        phase: isMain ? "review" : "between",
        returnedAt: action.now,
        mainActualSeconds: isMain ? actual : state.mainActualSeconds
      };
    }

    case "NEXT_STEP":
      if (state.phase !== "between") return state;
      return {
        ...state,
        phase: "idle",
        stepIndex: Math.min(state.stepIndex + 1, state.steps.length - 1),
        startedAt: null,
        returnedAt: null,
        warningIssued: false,
        targetIssued: false
      };

    case "MARK_WARNING_ISSUED":
      return state.warningIssued
        ? state
        : { ...state, warningIssued: true };

    case "MARK_TARGET_ISSUED":
      return state.targetIssued
        ? state
        : { ...state, targetIssued: true };

    case "RESET":
      return initialLiveSession(state.steps);

    default:
      return state;
  }
}
