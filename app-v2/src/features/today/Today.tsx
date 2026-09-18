import { useMemo } from "react";
import type { AppData } from "../../domain/types";
import type { StorageMode } from "../../data/repository";
import { activeScenario } from "../../data/appData";
import {
  buildPracticeDepartures,
  formatDuration,
  recommendNext
} from "../../domain/trainingEngine";
import { AccountNotice } from "../../components/AccountNotice";

export function Today({
  data,
  storageMode,
  onStart,
  onOpenCuePractice
}: {
  data: AppData;
  storageMode: StorageMode;
  onStart: (target: number) => void;
  onOpenCuePractice: () => void;
}) {
  const scenario = activeScenario(data);
  const recommendation = useMemo(
    () => recommendNext(scenario.sessions, scenario.startSeconds),
    [scenario]
  );
  const practice = buildPracticeDepartures(recommendation.targetSeconds);

  return (
    <div className="screen-stack">
      <AccountNotice storageMode={storageMode} />

      <section className="today-card">
        <p className="kicker">Today's plan</p>
        <div className="target-row">
          <div>
            <h1>{formatDuration(recommendation.targetSeconds)}</h1>
            <p>main departure</p>
          </div>
          <span className={`direction direction-${recommendation.direction}`}>
            {recommendation.direction === "increase"
              ? "Small step up"
              : recommendation.direction === "reduce"
                ? "Easier today"
                : recommendation.direction === "start"
                  ? "Starting point"
                  : "Repeat"}
          </span>
        </div>

        {practice.length > 0 && (
          <div className="practice-preview">
            <span>Before the main departure</span>
            <strong>
              {practice.map((seconds) => formatDuration(seconds)).join(" · ")}
            </strong>
            <small>Short practice departures with calm settle time between them.</small>
          </div>
        )}

        <div className="why-card">
          <span>Why this plan?</span>
          <p>{recommendation.reason}</p>
        </div>

        {recommendation.supportFlag && (
          <div className="support-card">
            Several recent sessions showed concern. Make things easier and consider
            checking in with a qualified behaviour professional before pushing duration.
          </div>
        )}

        <button
          className="primary-button start-button"
          onClick={() => onStart(recommendation.targetSeconds)}
        >
          Start session
        </button>
        <p className="ceiling-note">
          The target is a ceiling, not a quota. Returning early is always okay.
        </p>
      </section>

      <section className="quiet-card">
        <div>
          <p className="kicker">Current track</p>
          <h2>{scenario.label}</h2>
        </div>
        <div className="mini-stat">
          <strong>{scenario.sessions.length}</strong>
          <span>sessions logged</span>
        </div>
      </section>

      <section className="cue-entry-card">
        <div>
          <p className="kicker">Before you can leave</p>
          <h2>Does getting ready to go already cause worry?</h2>
          <p>
            Practise departure cues without actually leaving, so keys, shoes and the
            door become less predictive.
          </p>
        </div>
        <button className="secondary-button" onClick={onOpenCuePractice}>
          Departure cue practice
        </button>
      </section>
    </div>
  );
}
