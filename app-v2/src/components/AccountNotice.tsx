import type { StorageMode } from "../data/repository";

export function AccountNotice({ storageMode, onOpenAccount }: { storageMode: StorageMode; onOpenAccount: () => void }) {
  if (storageMode === "memory") {
    return (
      <aside className="account-notice storage-danger" role="status">
        <div>
          <strong>This browser cannot save progress reliably.</strong>
          <span>
            Keep this page open for this session and try a normal browser window before
            relying on the training history.
          </span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="account-notice">
      <div>
        <strong>Your progress is saved on this device.</strong>
        <span>
          {storageMode === "localstorage"
            ? "Using compatibility storage. Keep a separate backup while compatibility storage is in use."
            : "Optional account sync and backup controls are in More."}
        </span>
        <span>
          Keep a separate copy with More → Download backup. Installing the app does not back up your history.
        </span>
      </div>
      <button type="button" onClick={onOpenAccount}>
        Account & backup
      </button>
    </aside>
  );
}
