export type Outcome = "relaxed" | "concern" | "distressed";

export type ObservedSignal =
  | "exit-watching"
  | "pacing"
  | "panting"
  | "whining"
  | "barking-howling"
  | "unable-to-settle";

export interface TrainingSession {
  id: string;
  at: number;
  targetSeconds: number;
  actualSeconds: number;
  outcome: Outcome;
  stoppedEarly: boolean;
  signals: ObservedSignal[];
  note: string;
}

export interface Scenario {
  id: string;
  label: string;
  startSeconds: number;
  sessions: TrainingSession[];
}

export interface Recommendation {
  targetSeconds: number;
  direction: "start" | "repeat" | "increase" | "reduce";
  reason: string;
  supportFlag: boolean;
}

export interface DepartureCueSession {
  id: string;
  at: number;
  cueIndex: number;
  relaxedReps: number;
  concernReps: number;
  outcome: Outcome;
}

export interface DepartureCuePractice {
  level: number;
  sessions: DepartureCueSession[];
}

export interface AppData {
  dogName: string;
  scenario: Scenario;
  cuePractice?: DepartureCuePractice;
}
