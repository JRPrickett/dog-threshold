import type { AppData } from "./types";

/**
 * Two main departures is a ceiling, not a target. Separation-anxiety work
 * consolidates in the gaps between sessions, and cramming more attempts
 * into one day reliably sets a dog back rather than speeding things up.
 * Counted across every training track, because it's the same dog doing
 * all of them. Departure-cue practice doesn't count — it never leaves the
 * dog alone, so it doesn't carry the same recovery cost.
 */
export const DEFAULT_DAILY_CAP = 2;

function startOfDay(now: number): number {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function sessionsToday(data: AppData, now: number = Date.now()): number {
  const from = startOfDay(now);
  return data.scenarios.reduce(
    (count, scenario) =>
      count + scenario.sessions.filter((session) => session.at >= from).length,
    0
  );
}

export function isDailyCapReached(
  data: AppData,
  cap: number = DEFAULT_DAILY_CAP,
  now: number = Date.now()
): boolean {
  return sessionsToday(data, now) >= cap;
}
