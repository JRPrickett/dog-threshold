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
import { DEFAULT_WARMUP_COUNT, formatDuration } from "../../domain/trainingEngine";
import { effectiveDailyCap } from "../../domain/dailyCap";
import {
  alertCapabilities,
  requestNotificationPermission,
  type NotificationPermissionState
} from "../../session/sessionAlerts";

const DEFAULT_REST_SECONDS = 60;

export function More({
  data,
  onSelectScenario,
  onCreateScenario,
  onUpdateScenario,
  onUpdateDailyCap,
  onRestoreBackup
}: {
  data: AppData;
  onSelectScenario: (id: string) => Promise<void>;
  onCreateScenario: (label: string, startSeconds: number) => Promise<void>;
  onUpdateScenario: (
    id: string,
    label: string,
    startSeconds: number,
    warmupCount: number,
    restSeconds: number
  ) => Promise<void>;
  onUpdateDailyCap: (cap: number) => Promise<void>;
  onRestoreBackup: (data: AppData) => Promise<void>;
}) {
  const scenario = activeScenario(data);
  const fileInput = useRef<HTMLInputElement>(null);
  const [pendingRestore, setPendingRestore] = useState<AppData | null>(null);
  const [restoreError, setRestoreError] = useState("");
  const [trackLabel, setTrackLabel] = useState(scenario.label);
  const [trackStart, setTrackStart] = useState(scenario.startSeconds);
  const [warmupCount, setWarmupCount] = useState(
    scenario.warmupCount ?? DEFAULT_WARMUP_COUNT
  );
  const [restSeconds, setRestSeconds] = useState(
    scenario.restSeconds ?? DEFAULT_REST_SECONDS
  );
  const [newTrackLabel, setNewTrackLabel] = useState("");
  const [newTrackStart, setNewTrackStart] = useState(scenario.startSeconds);
  const [dailyCap, setDailyCap] = useState(effectiveDailyCap(data));
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermissionState>(
      () => alertCapabilities().notifications
    );

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
            onChange={(event) => {
              const nextId = event.target.value;
              const next = data.scenarios.find((item) => item.id === nextId);
              if (next) {
                setTrackLabel(next.label);
                setTrackStart(next.startSeconds);
                setWarmupCount(next.warmupCount ?? DEFAULT_WARMUP_COUNT);
                setRestSeconds(next.restSeconds ?? DEFAULT_REST_SECONDS);
              }
              void onSelectScenario(nextId);
            }}
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


      <section className="settings-card">
        <div>
          <p className="kicker">Current training track</p>
          <h2>Keep routines separate when they genuinely differ.</h2>
          <p>
            Edit this track's name or known-comfortable starting point without
            touching its history.
          </p>
        </div>
        <div className="track-form">
          <label>
            Track name
            <input
              value={trackLabel}
              maxLength={48}
              onChange={(event) => setTrackLabel(event.target.value)}
            />
          </label>
          <label>
            Starting comfort
            <div className="duration-input">
              <input
                aria-label="Track starting comfort"
                type="number"
                min={1}
                max={7200}
                value={trackStart}
                onChange={(event) => setTrackStart(Number(event.target.value))}
              />
              <span>seconds</span>
            </div>
          </label>
          <label>
            Practice departures before the main one
            <input
              aria-label="Warm-up count"
              type="number"
              min={0}
              max={4}
              value={warmupCount}
              onChange={(event) => setWarmupCount(Number(event.target.value))}
            />
          </label>
          <label>
            Suggested settle time between departures
            <div className="duration-input">
              <input
                aria-label="Suggested settle time"
                type="number"
                min={0}
                max={3600}
                value={restSeconds}
                onChange={(event) => setRestSeconds(Number(event.target.value))}
              />
              <span>seconds</span>
            </div>
          </label>
          <button
            className="secondary-button"
            onClick={() =>
              void onUpdateScenario(
                scenario.id,
                trackLabel,
                trackStart,
                warmupCount,
                restSeconds
              )
            }
          >
            Save track changes
          </button>
        </div>
      </section>

      <section className="settings-card">
        <div>
          <p className="kicker">Daily ceiling</p>
          <h2>How many main departures per day, at most.</h2>
          <p>
            Counted across every training track, since it's the same dog. Separation
            training consolidates between sessions — more attempts in one day is not
            faster progress.
          </p>
        </div>
        <div className="track-form">
          <label>
            Main departures per day
            <input
              aria-label="Daily main-departure cap"
              type="number"
              min={1}
              max={10}
              value={dailyCap}
              onChange={(event) => setDailyCap(Number(event.target.value))}
            />
          </label>
          <button
            className="secondary-button"
            onClick={() => void onUpdateDailyCap(dailyCap)}
          >
            Save daily ceiling
          </button>
        </div>
      </section>

      <section className="settings-card">
        <div>
          <p className="kicker">Another routine</p>
          <h2>Add a separate training track.</h2>
          <p>
            Useful when a context really behaves differently, such as a school-run
            departure versus an evening departure. Do not split tracks just to chase
            better numbers.
          </p>
        </div>
        <div className="track-form">
          <label>
            New track name
            <input
              value={newTrackLabel}
              maxLength={48}
              placeholder="e.g. School run"
              onChange={(event) => setNewTrackLabel(event.target.value)}
            />
          </label>
          <label>
            Known comfortable duration
            <div className="duration-input">
              <input
                aria-label="New track starting comfort"
                type="number"
                min={1}
                max={7200}
                value={newTrackStart}
                onChange={(event) => setNewTrackStart(Number(event.target.value))}
              />
              <span>seconds</span>
            </div>
          </label>
          <button
            className="secondary-button"
            disabled={!newTrackLabel.trim() || newTrackStart < 1}
            onClick={async () => {
              await onCreateScenario(newTrackLabel, newTrackStart);
              setTrackLabel(newTrackLabel.trim());
              setTrackStart(newTrackStart);
              setNewTrackLabel("");
            }}
          >
            Add training track
          </button>
        </div>
      </section>


      <section className="settings-card">
        <div>
          <p className="kicker">Return alerts</p>
          <h2>Chimes stay part of the live session.</h2>
          <p>
            System notifications are optional. The timer and saved session never
            depend on notification delivery.
          </p>
        </div>
        {notificationPermission === "default" && (
          <button
            className="secondary-button"
            onClick={async () =>
              setNotificationPermission(await requestNotificationPermission())
            }
          >
            Enable system alerts
          </button>
        )}
        {notificationPermission === "granted" && (
          <span className="alert-status enabled">System alerts enabled</span>
        )}
        {notificationPermission === "denied" && (
          <span className="alert-status">System alerts are blocked in this browser</span>
        )}
        {notificationPermission === "unsupported" && (
          <span className="alert-status">
            System alerts are unavailable here. Session chimes still work where
            background audio is supported.
          </span>
        )}
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
