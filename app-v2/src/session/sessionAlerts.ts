export type NotificationPermissionState =
  | "unsupported"
  | NotificationPermission;

export interface AlertCapabilities {
  notifications: NotificationPermissionState;
  mediaSession: boolean;
  wakeLock: boolean;
}

let keeper: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let wakeLock: WakeLockSentinel | null = null;

function makeSilentWav(): string {
  const sampleRate = 8000;
  const seconds = 2;
  const samples = sampleRate * seconds;
  const bytes = new Uint8Array(44 + samples * 2);
  const view = new DataView(bytes.buffer);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i += 1) {
      bytes[offset + i] = text.charCodeAt(i);
    }
  };

  write(0, "RIFF");
  view.setUint32(4, 36 + samples * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples * 2, true);

  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `data:audio/wav;base64,${btoa(binary)}`;
}

function context(): AudioContext | null {
  const Ctor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;

  if (!audioContext) {
    try {
      audioContext = new Ctor();
    } catch {
      return null;
    }
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume().catch(() => {});
  }
  return audioContext;
}

function tone(
  frequency: number,
  delaySeconds: number,
  durationSeconds: number,
  gainValue: number
) {
  const ctx = context();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const start = ctx.currentTime + delaySeconds;
  const end = start + durationSeconds;

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(end + 0.03);
}

export function playHeadBackSoonChime() {
  tone(520, 0, 0.38, 0.11);
  tone(660, 0.18, 0.42, 0.10);
  tone(820, 0.40, 0.48, 0.09);
}

export function playTargetReachedChime() {
  tone(660, 0, 0.72, 0.13);
  tone(990, 0, 0.62, 0.07);
  tone(880, 0.36, 0.9, 0.12);
  tone(1320, 0.36, 0.76, 0.06);
}

export function alertCapabilities(): AlertCapabilities {
  return {
    notifications:
      typeof Notification === "undefined"
        ? "unsupported"
        : Notification.permission,
    mediaSession: "mediaSession" in navigator,
    wakeLock: "wakeLock" in navigator
  };
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;

  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export async function showSessionNotification(
  title: string,
  body: string
): Promise<void> {
  if (
    typeof Notification === "undefined" ||
    Notification.permission !== "granted" ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      tag: "dog-training-return",
      icon: "/icon.svg",
      badge: "/icon.svg"
    });
  } catch {
    // Alerts are supplementary. Timer/recovery state must never depend on them.
  }
}

async function requestWakeLock() {
  if (!("wakeLock" in navigator) || document.visibilityState !== "visible") return;
  if (wakeLock && !wakeLock.released) return;

  try {
    wakeLock = await navigator.wakeLock.request("screen");
    wakeLock.addEventListener("release", () => {
      wakeLock = null;
    });
  } catch {
    wakeLock = null;
  }
}

export function prepareSessionAudio() {
  context();

  if (!keeper && typeof Audio !== "undefined") {
    try {
      keeper = new Audio(makeSilentWav());
      keeper.loop = true;
      keeper.volume = 0.01;
      keeper.setAttribute("playsinline", "");
    } catch {
      keeper = null;
    }
  }

  if (keeper) {
    try {
      keeper.currentTime = 0;
      void keeper.play().catch(() => {});
    } catch {
      // Best effort only.
    }
  }

  void requestWakeLock();
}

export function configureMediaSession(
  dogName: string,
  scenarioLabel: string,
  targetSeconds: number,
  elapsedSeconds: number
) {
  if (!("mediaSession" in navigator)) return;

  try {
    navigator.mediaSession.playbackState = "playing";

    if (typeof MediaMetadata !== "undefined") {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${dogName} · training session`,
        artist: scenarioLabel,
        album: `${Math.max(0, targetSeconds - elapsedSeconds)}s remaining`,
        artwork: [
          {
            src: "/icon.svg",
            sizes: "512x512",
            type: "image/svg+xml"
          }
        ]
      });
    }

    if (typeof navigator.mediaSession.setPositionState === "function") {
      const duration = Math.max(1, targetSeconds);
      const position = Math.min(duration, Math.max(0, elapsedSeconds));
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: 1,
        position
      });
    }

    const keepRunning = () => {
      if (keeper?.paused) void keeper.play().catch(() => {});
    };
    for (const action of ["play", "pause", "stop"] as MediaSessionAction[]) {
      try {
        navigator.mediaSession.setActionHandler(action, keepRunning);
      } catch {
        // Unsupported media actions vary by browser.
      }
    }
  } catch {
    // Media Session is progressive enhancement.
  }
}

export function stopSessionAlerts() {
  if (keeper) {
    try {
      keeper.pause();
      keeper.removeAttribute("src");
      keeper.load();
    } catch {
      // Ignore cleanup failure.
    }
    keeper = null;
  }

  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.playbackState = "none";
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.setPositionState?.();
    } catch {
      // Ignore cleanup failure.
    }

    for (const action of ["play", "pause", "stop"] as MediaSessionAction[]) {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {
        // Ignore unsupported actions.
      }
    }
  }

  if (wakeLock && !wakeLock.released) {
    void wakeLock.release().catch(() => {});
  }
  wakeLock = null;
}

export function installWakeLockRecovery(): () => void {
  const recover = () => {
    if (document.visibilityState === "visible") void requestWakeLock();
  };
  document.addEventListener("visibilitychange", recover);
  return () => document.removeEventListener("visibilitychange", recover);
}
