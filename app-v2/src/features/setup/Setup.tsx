import { useState } from "react";
import { BrandMark } from "../../brand/BrandMark";

export function Setup({
  onSaved
}: {
  onSaved: (dogName: string, startSeconds: number) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [seconds, setSeconds] = useState(5);

  return (
    <main className="setup-shell">
      <section className="setup-card">
        <BrandMark light variant="photo" />
        <p className="setup-brand">SettledSolo</p>
        <p className="kicker">Separation training for dogs</p>
        <h1>Calm starts with small steps.</h1>
        <p className="lead">
          Build comfortable alone time gradually. Start with something you already
          know feels safe, observe closely, and come back before concern builds.
        </p>

        <label>
          Your dog's name
          <input
            autoComplete="off"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Mabel"
            maxLength={40}
          />
        </label>

        <label>
          A duration you already know feels comfortable
          <div className="duration-input">
            <input
              type="number"
              min={1}
              max={7200}
              value={seconds}
              onChange={(event) => setSeconds(Number(event.target.value))}
            />
            <span>seconds</span>
          </div>
        </label>

        <p className="field-help">
          This is not a test of the longest your dog can tolerate. Pick something
          you have already seen them manage calmly.
        </p>

        <button
          className="primary-button"
          disabled={!name.trim() || !Number.isFinite(seconds) || seconds < 1}
          onClick={() => void onSaved(name, seconds)}
        >
          Set up your first session
        </button>

        <p className="disclaimer">
          This app supports gradual training and record keeping. It does not diagnose
          separation anxiety or replace veterinary or qualified behavioural care.
        </p>
      </section>
    </main>
  );
}
