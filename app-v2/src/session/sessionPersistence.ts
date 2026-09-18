import type { LiveSessionState } from "./sessionMachine";

export interface PersistedLiveSession {
  targetSeconds: number;
  state: LiveSessionState;
  savedAt: number;
}

export function makePersistedLiveSession(
  targetSeconds: number,
  state: LiveSessionState,
  now = Date.now()
): PersistedLiveSession {
  return {
    targetSeconds: Math.max(1, Math.round(targetSeconds)),
    state,
    savedAt: now
  };
}

export function isRestorableLiveSession(
  value: PersistedLiveSession | null,
  now = Date.now()
): value is PersistedLiveSession {
  if (!value) return false;
  if (!Number.isFinite(value.targetSeconds) || value.targetSeconds < 1) return false;
  if (!value.state || !Array.isArray(value.state.steps) || !value.state.steps.length) {
    return false;
  }
  if (
    !["idle", "running", "between", "review"].includes(value.state.phase) ||
    value.state.stepIndex < 0 ||
    value.state.stepIndex >= value.state.steps.length
  ) {
    return false;
  }

  if (value.state.phase === "running" && !Number.isFinite(value.state.startedAt)) {
    return false;
  }

  return now - value.savedAt <= 12 * 60 * 60 * 1000;
}
