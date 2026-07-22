/**
 * Future home for runtime state transitions.
 *
 * Persistent data normalisation is already isolated in storage.js.
 * The next refactor will move session-phase state from app.js into this module.
 */
export const PHASES=Object.freeze({
  IDLE:"idle", RUNNING:"running", REST:"rest", CUE:"cue",
  DOOR_VERDICT:"doorVerdict", MAIN_VERDICT:"verdictMain"
});
