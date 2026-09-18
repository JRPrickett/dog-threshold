import type { SessionTag } from "./types";

export const SESSION_TAG_OPTIONS: Array<{ value: SessionTag; label: string }> = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "not-walked-yet", label: "Not walked yet" },
  { value: "after-a-walk", label: "After a walk" },
  { value: "before-food", label: "Before food" },
  { value: "after-food", label: "After food" },
  { value: "radio-or-tv-on", label: "Radio or TV on" },
  { value: "crated-confined", label: "Crated / confined" },
  { value: "free-roam", label: "Free-roam" }
];

export const SESSION_TAG_VALUES: SessionTag[] = SESSION_TAG_OPTIONS.map(
  (option) => option.value
);
