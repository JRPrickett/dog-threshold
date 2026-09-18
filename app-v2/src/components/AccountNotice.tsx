import type { StorageMode } from "../data/repository";

export function AccountNotice({ storageMode }: { storageMode: StorageMode }) {
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
            ? "Using compatibility storage. Create a free account later for safer backup across devices."
            : "Create a free account later to back it up and use it on other devices."}
        </span>
      </div>
      <button type="button" disabled title="Account sync is the next production phase">
        Soon
      </button>
    </aside>
  );
}
