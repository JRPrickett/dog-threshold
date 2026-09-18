import { useRef, useState } from "react";
import type { AppData } from "../../domain/types";
import { activeScenario } from "../../data/appData";
import {
  downloadBackup,
  downloadSessionsCsv
} from "../../data/export";
import {
  backupSummary,
  parseBackupText
} from "../../data/backup";
import { formatDuration } from "../../domain/trainingEngine";

export function More({
  data,
  onSelectScenario,
  onRestoreBackup
}: {
  data: AppData;
  onSelectScenario: (id: string) => Promise<void>;
  onRestoreBackup: (data: AppData) => Promise<void>;
}) {
  const scenario = activeScenario(data);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingRestore, setPendingRestore] = useState<AppData | null>(null);
  const [restoreError, setRestoreError] = useState("");

  async function chooseBackup(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      setPendingRestore(parseBackupText(text));
      setRestoreError("");
    } catch (error) {
      setPendingRestore(null);
      setRestoreError(
        error instanceof Error ? error.message : "Could not read this backup."
      );
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const pendingSummary = pendingRestore
    ? backupSummary(pendingRestore)
    : null;

  return (
    <div className="screen-stack">
      <section className="page-heading">
        <p className="kicker">More</p>
        <h1>{data.dogName}'s training settings.</h1>
      </section>

      <section className="menu-card">
        <div>
          <strong>Account & backup</strong>
          <span>Optional cloud backup and cross-device sync</span>
        </div>
        <span className="soon-pill">Coming next</span>
      </section>

      {data.scenarios.length > 1 && (
        <section className="menu-card scenario-switch-card">
          <div>
            <strong>Training track</strong>
            <span>Keep different routines on separate progress histories.</span>
          </div>
          <select
            aria-label="Training track"
            value={scenario.id}
            onChange={(event) => void onSelectScenario(event.target.value)}
          >
            {data.scenarios.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </section>
      )}

      <section className="menu-card">
        <div>
          <strong>Starting comfort</strong>
          <span>{formatDuration(scenario.startSeconds)} known comfortable duration</span>
        </div>
      </section>

      <section className="data-tools-card">
        <div>
          <p className="kicker">Your data</p>
          <h2>Keep a copy whenever you want.</h2>
          <p>
            Export a complete backup or a spreadsheet-friendly session history. These
            exports stay free even if paid features are added later.
          </p>
        </div>
        <div className="data-tools-actions">
          <button onClick={() => downloadBackup(data)}>Download backup</button>
          <button onClick={() => downloadSessionsCsv(data)}>Export CSV</button>
          <button onClick={() => fileInput.current?.click()}>Restore backup</button>
        </div>
        <input
          ref={fileInput}
          className="visually-hidden"
          type="file"
          accept="application/json,.json"
          aria-label="Choose backup file"
          onChange={(event) =>
            void chooseBackup(event.target.files?.[0])
          }
        />

        {restoreError && (
          <div className="restore-message restore-error" role="alert">
            {restoreError}
          </div>
        )}

        {pendingRestore && pendingSummary && (
          <div className="restore-preview">
            <div>
              <strong>Ready to restore {pendingSummary.dogName}</strong>
              <span>
                {pendingSummary.scenarios} training {
                  pendingSummary.scenarios === 1 ? "track" : "tracks"
                } · {pendingSummary.sessions} timed {
                  pendingSummary.sessions === 1 ? "session" : "sessions"
                } · {pendingSummary.cueSets} cue {
                  pendingSummary.cueSets === 1 ? "set" : "sets"
                }
              </span>
              <small>
                This replaces the current local training data on this device. Download
                a backup first if you want to keep the current version.
              </small>
            </div>
            <div className="restore-actions">
              <button
                className="restore-confirm"
                onClick={async () => {
                  await onRestoreBackup(pendingRestore);
                  setPendingRestore(null);
                }}
              >
                Restore this backup
              </button>
              <button onClick={() => setPendingRestore(null)}>Cancel</button>
            </div>
          </div>
        )}
      </section>

      <section className="quiet-card vertical">
        <p className="kicker">Evidence-aware, not algorithm worship</p>
        <h2>Every recommendation should be explainable.</h2>
        <p>
          The new engine is based on gradual systematic desensitisation and observed
          behaviour. Its exact software step sizes are conservative product heuristics,
          not a claim that science has discovered the perfect percentage increase.
        </p>
      </section>
    </div>
  );
}
