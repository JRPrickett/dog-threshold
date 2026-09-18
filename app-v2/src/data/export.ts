import type { AppData } from "../domain/types";

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function makeBackup(data: AppData) {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    appData: data
  };
}

export function makeSessionsCsv(data: AppData): string {
  const rows = [
    [
      "scenario",
      "date",
      "target_seconds",
      "actual_seconds",
      "outcome",
      "stopped_early",
      "observed_signals",
      "note"
    ]
  ];

  for (const scenario of data.scenarios) {
    for (const session of scenario.sessions) {
      rows.push([
        scenario.label,
        new Date(session.at).toISOString(),
        String(session.targetSeconds),
        String(session.actualSeconds),
        session.outcome,
        session.stoppedEarly ? "yes" : "no",
        session.signals.join("; "),
        session.note
      ]);
    }
  }

  return rows.map((row) => row.map(csvCell).join(",")).join("\n");
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

export function downloadBackup(data: AppData) {
  downloadText(
    `settledsolo-backup-${dateStamp()}.json`,
    JSON.stringify(makeBackup(data), null, 2),
    "application/json"
  );
}

export function downloadSessionsCsv(data: AppData) {
  downloadText(
    `settledsolo-history-${dateStamp()}.csv`,
    makeSessionsCsv(data),
    "text/csv;charset=utf-8"
  );
}
