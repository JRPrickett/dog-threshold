import type { ObservedSignal } from "./types";

export const observedSignalOptions: Array<{
  value: ObservedSignal;
  label: string;
}> = [
  { value: "exit-watching", label: "Watching the exit" },
  { value: "pacing", label: "Pacing" },
  { value: "panting", label: "Panting" },
  { value: "whining", label: "Whining" },
  { value: "barking-howling", label: "Barking / howling" },
  { value: "unable-to-settle", label: "Unable to settle" }
];
