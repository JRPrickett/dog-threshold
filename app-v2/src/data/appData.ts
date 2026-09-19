import type { AppData, Scenario } from "../domain/types";

export function activeScenario(data: AppData): Scenario {
  return (
    data.scenarios.find((scenario) => scenario.id === data.activeScenarioId) ??
    data.scenarios[0]
  );
}

export function replaceScenario(data: AppData, scenario: Scenario): AppData {
  return {
    ...data,
    activeScenarioId: scenario.id,
    scenarios: data.scenarios.map((item) =>
      item.id === scenario.id ? scenario : item
    )
  };
}


export function freshAppData(): AppData {
  return {
    dogName: "",
    activeScenarioId: "training",
    scenarios: [
      {
        id: "training",
        label: "Separation training",
        startSeconds: 5,
        sessions: []
      }
    ]
  };
}
