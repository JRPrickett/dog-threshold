import { useEffect, useRef, useState, type RefObject } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { BrandMark } from "../brand/BrandMark";
import { isIOS, isStandalone } from "../pwa/installStatus";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

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

function IOSInstallGuide({ dialogRef }: { dialogRef: RefObject<HTMLDialogElement | null> }) {
  return (
    <dialog
      ref={dialogRef}
      className="ios-install-dialog"
      aria-labelledby="ios-install-title"
    >
      <button className="ios-install-close" type="button" onClick={() => dialogRef.current?.close()}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
        <span className="visually-hidden">Close installation guide</span>
      </button>

      <div className="ios-install-copy">
        <BrandMark compact />
        <p>Install on iPhone or iPad</p>
        <h2 id="ios-install-title">Keep SettledSolo one tap away.</h2>
        <ol>
          <li><span>1</span>Open this page in Safari.</li>
          <li><span>2</span>Tap the Share button.</li>
          <li><span>3</span>Choose <strong>Add to Home Screen</strong>.</li>
        </ol>
        <small>No App Store, account or payment card needed.</small>
      </div>

      <div className="ios-install-demo" aria-hidden="true">
        <div className="ios-demo-phone">
          <div className="ios-demo-page">
            <BrandMark compact light />
            <span>settledsolo.com</span>
          </div>
          <div className="ios-demo-toolbar">
            <i />
            <span className="ios-demo-share"><ShareIcon /></span>
            <i />
          </div>
          <div className="ios-demo-sheet">
            <span className="ios-demo-sheet-handle" />
            <div className="ios-demo-sheet-title">Safari</div>
            <div className="ios-demo-add-row">
              <PlusSquareIcon />
              <span>Add to Home Screen</span>
            </div>
          </div>
          <div className="ios-demo-home-icon">
            <BrandMark variant="badge" />
            <span>SettledSolo</span>
          </div>
        </div>
        <p><span>Share</span><span>Add to Home Screen</span><span>Done</span></p>
      </div>
    </dialog>
  );
}

export function PublicInstallAction() {
  useRegisterSW({ immediate: true });
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandalone());
  const guideRef = useRef<HTMLDialogElement>(null);
  const ios = isIOS();

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setInstalled(true);
      setInstallEvent(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (installed) {
    return <a className="marketing-primary" href="/app/">Open SettledSolo</a>;
  }

  if (installEvent) {
    return (
      <button
        className="marketing-primary marketing-install-button"
        type="button"
        onClick={async () => {
          await installEvent.prompt();
          const choice = await installEvent.userChoice;
          setInstallEvent(null);
          if (choice.outcome === "accepted") setInstalled(true);
        }}
      >
        Install SettledSolo
      </button>
    );
  }

  if (ios) {
    return (
      <>
        <button
          className="marketing-primary marketing-install-button"
          type="button"
          onClick={() => guideRef.current?.showModal()}
        >
          Install on iPhone
        </button>
        <IOSInstallGuide dialogRef={guideRef} />
      </>
    );
  }

  return <a className="marketing-primary" href="/app/">Start training free</a>;
}
