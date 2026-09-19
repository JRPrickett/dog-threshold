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
        <BrandMark light />
        <p className="setup-brand">SettledSolo</p>
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
          This app is a training aid for gradual desensitization and record keeping. It is
          not a substitute for an accredited separation anxiety specialist (such as a
          Certified Separation Anxiety Trainer) or a veterinary behaviourist, and it does not
          diagnose separation anxiety.
        </p>
      </section>
    </main>
  );
}
