import { useState } from "react";
import { BrandMark } from "../../brand/BrandMark";

export function Setup({
  onSaved
}: {
  onSaved: (dogName: string, startSeconds: number) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [durationValue, setDurationValue] = useState("5");
  const [durationUnit, setDurationUnit] = useState<"seconds" | "minutes">(
    "seconds"
  );

  const numericDuration = Number.parseInt(durationValue, 10);
  const durationSeconds =
    Number.isFinite(numericDuration) && numericDuration > 0
      ? numericDuration * (durationUnit === "minutes" ? 60 : 1)
      : 0;
  const durationIsValid = durationSeconds >= 1 && durationSeconds <= 7200;

  function changeDuration(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    setDurationValue(digitsOnly.replace(/^0+(?=\d)/, ""));
  }

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

        <label className="duration-field">
          A duration you already know feels comfortable
          <div className="duration-input">
            <input
              aria-label="Comfortable duration"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={durationValue}
              onChange={(event) => changeDuration(event.target.value)}
            />
            <select
              aria-label="Duration unit"
              value={durationUnit}
              onChange={(event) =>
                setDurationUnit(event.target.value as "seconds" | "minutes")
              }
            >
              <option value="seconds">seconds</option>
              <option value="minutes">minutes</option>
            </select>
          </div>
        </label>

        <p className="field-help">
          This is not a test of the longest your dog can tolerate. Pick something
          you have already seen them manage calmly.
        </p>

        <button
          className="primary-button"
          disabled={!name.trim() || !durationIsValid}
          onClick={() => void onSaved(name, durationSeconds)}
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
