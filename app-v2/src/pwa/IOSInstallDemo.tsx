import { useEffect, useState } from "react";
import { BrandMark } from "../brand/BrandMark";

type InstallStep = 0 | 1 | 2 | 3;

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 16V3m0 0L7.5 7.5M12 3l4.5 4.5M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
    </svg>
  );
}

function PlusSquareIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function IOSInstallDemo({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState<InstallStep>(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setTimeout(() => {
      setStep((current) => ((current + 1) % 4) as InstallStep);
    }, 1250);
    return () => window.clearTimeout(timer);
  }, [autoplay, step]);

  function choose(nextStep: InstallStep) {
    setAutoplay(false);
    setStep(nextStep);
  }

  return (
    <div className={`ios-install-demo${compact ? " ios-install-demo--compact" : ""}`}>
      <div className="ios-guide-phone" aria-label="Interactive Safari installation demonstration">
        <div className="ios-guide-page">
          <BrandMark compact light />
          <span>settledsolo.com</span>
        </div>

        <div className="ios-guide-toolbar" aria-hidden={step !== 0}>
          <span className="ios-guide-back">‹</span>
          <span className="ios-guide-address">settledsolo.com</span>
          <button
            className={`ios-guide-more${step === 0 ? " is-current" : ""}`}
            type="button"
            aria-label="Tap Safari's three-dot menu"
            disabled={step !== 0}
            onClick={() => choose(1)}
          >
            <i /><i /><i />
          </button>
        </div>

        {step === 1 && (
          <div className="ios-guide-menu">
            <button type="button" onClick={() => choose(2)}>
              <ShareIcon />
              <span>Share</span>
            </button>
            <div><span>◇</span><span>Add to Bookmarks</span></div>
            <div><span>＋</span><span>New Tab</span></div>
          </div>
        )}

        {step === 2 && (
          <div className="ios-guide-share-sheet">
            <span className="ios-guide-handle" />
            <div className="ios-guide-sheet-title">SettledSolo</div>
            <div className="ios-guide-share-options"><i /><i /><i /><i /></div>
            <button type="button" onClick={() => choose(3)}>
              <PlusSquareIcon />
              <span>Add to Home Screen</span>
            </button>
          </div>
        )}

        {step === 3 && (
          <button className="ios-guide-installed" type="button" onClick={() => choose(0)}>
            <BrandMark variant="badge" />
            <strong>SettledSolo</strong>
            <span>Installed. Tap to watch again.</span>
          </button>
        )}
      </div>

      <ol className="ios-guide-progress" aria-label="Installation steps">
        <li className={step === 0 ? "is-current" : ""} aria-current={step === 0 ? "step" : undefined}>Three dots</li>
        <li className={step === 1 ? "is-current" : ""} aria-current={step === 1 ? "step" : undefined}>Share</li>
        <li className={step === 2 ? "is-current" : ""} aria-current={step === 2 ? "step" : undefined}>Add to Home Screen</li>
        <li className={step === 3 ? "is-current" : ""} aria-current={step === 3 ? "step" : undefined}>Done</li>
      </ol>
    </div>
  );
}
