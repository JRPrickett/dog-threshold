export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const displayModeStandalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  const iosStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayModeStandalone || iosStandalone;
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent || "";
  const isIphoneOrIpad = /iphone|ipad|ipod/i.test(userAgent);
  const isModernIpad =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return isIphoneOrIpad || isModernIpad;
}

/**
 * Best-effort: asks the browser to exempt this origin's storage from
 * automatic eviction (notably iOS Safari's 7-day unused-site cleanup).
 * Returns whether it was granted; never throws.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persist) {
      return await navigator.storage.persist();
    }
  } catch {
    // Best-effort — an unsupported or denied request is not an error.
  }
  return false;
}
