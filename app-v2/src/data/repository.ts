import type {
  AppData,
  DepartureCueSession,
  TrainingSession
} from "../domain/types";
import type { PersistedLiveSession } from "../session/sessionPersistence";
import { readLegacyAppData } from "./legacyImport";

const DB_NAME = "dog-training-app";
const DB_VERSION = 1;
const STORE = "records";
const APP_KEY = "app-data";
const ACTIVE_KEY = "active-session";

type RecordValue = AppData | PersistedLiveSession | null;

interface StoredRecord {
  key: string;
  value: RecordValue;
  updatedAt: number;
}

export interface AppRepository {
  loadAppData(): Promise<AppData>;
  saveAppData(data: AppData): Promise<void>;
  saveSetup(dogName: string, startSeconds: number): Promise<AppData>;
  appendSession(session: TrainingSession): Promise<AppData>;
  appendDepartureCueSession(session: DepartureCueSession, nextLevel: number): Promise<AppData>;
  loadActiveSession(): Promise<PersistedLiveSession | null>;
  saveActiveSession(session: PersistedLiveSession): Promise<void>;
  clearActiveSession(): Promise<void>;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}

async function openDatabase(): Promise<IDBDatabase> {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(STORE)) {
      database.createObjectStore(STORE, { keyPath: "key" });
    }
  };

  return requestResult(request);
}

async function getRecord<T extends RecordValue>(key: string): Promise<T | null> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE, "readonly");
    const store = transaction.objectStore(STORE);
    const record = (await requestResult(store.get(key))) as StoredRecord | undefined;
    await transactionDone(transaction);
    return (record?.value as T | undefined) ?? null;
  } finally {
    database.close();
  }
}

async function putRecord(key: string, value: RecordValue): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put({
      key,
      value,
      updatedAt: Date.now()
    } satisfies StoredRecord);
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

async function deleteRecord(key: string): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).delete(key);
    await transactionDone(transaction);
  } finally {
    database.close();
  }
}

function normaliseAppData(data: AppData): AppData {
  return {
    dogName: String(data.dogName || "").slice(0, 40),
    scenario: {
      id: String(data.scenario?.id || "training"),
      label: String(data.scenario?.label || "Separation training").slice(0, 48),
      startSeconds: Math.max(1, Math.round(Number(data.scenario?.startSeconds || 5))),
      sessions: Array.isArray(data.scenario?.sessions)
        ? data.scenario.sessions.slice()
        : []
    },
    cuePractice: data.cuePractice
      ? {
          level: Math.max(0, Math.min(7, Math.round(data.cuePractice.level ?? 0))),
          sessions: Array.isArray(data.cuePractice.sessions)
            ? data.cuePractice.sessions.slice()
            : []
        }
      : undefined
  };
}

function memoryRepository(initial: AppData): AppRepository {
  let data = normaliseAppData(initial);
  let active: PersistedLiveSession | null = null;

  return {
    async loadAppData() {
      return data;
    },
    async saveAppData(next) {
      data = normaliseAppData(next);
    },
    async saveSetup(dogName, startSeconds) {
      data = normaliseAppData({
        ...data,
        dogName: dogName.trim(),
        scenario: { ...data.scenario, startSeconds }
      });
      return data;
    },
    async appendSession(session) {
      data = normaliseAppData({
        ...data,
        scenario: {
          ...data.scenario,
          sessions: [...data.scenario.sessions, session]
        }
      });
      return data;
    },
    async appendDepartureCueSession(session, nextLevel) {
      data = normaliseAppData({
        ...data,
        cuePractice: {
          level: nextLevel,
          sessions: [...(data.cuePractice?.sessions ?? []), session]
        }
      });
      return data;
    },
    async loadActiveSession() {
      return active;
    },
    async saveActiveSession(session) {
      active = session;
    },
    async clearActiveSession() {
      active = null;
    }
  };
}

export function createAppRepository(): AppRepository {
  const legacy = readLegacyAppData();

  if (typeof indexedDB === "undefined") {
    return memoryRepository(legacy);
  }

  return {
    async loadAppData() {
      const existing = await getRecord<AppData>(APP_KEY);
      if (existing) return normaliseAppData(existing);

      const migrated = normaliseAppData(legacy);
      await putRecord(APP_KEY, migrated);
      return migrated;
    },

    async saveAppData(data) {
      await putRecord(APP_KEY, normaliseAppData(data));
    },

    async saveSetup(dogName, startSeconds) {
      const data = await this.loadAppData();
      const next = normaliseAppData({
        ...data,
        dogName: dogName.trim(),
        scenario: {
          ...data.scenario,
          startSeconds
        }
      });
      await this.saveAppData(next);
      return next;
    },

    async appendSession(session) {
      const data = await this.loadAppData();
      const exists = data.scenario.sessions.some((item) => item.id === session.id);
      const next = exists
        ? data
        : {
            ...data,
            scenario: {
              ...data.scenario,
              sessions: [...data.scenario.sessions, session]
            }
          };
      await this.saveAppData(next);
      return next;
    },

    async appendDepartureCueSession(session, nextLevel) {
      const data = await this.loadAppData();
      const existing = data.cuePractice?.sessions ?? [];
      const exists = existing.some((item) => item.id === session.id);
      const next = exists
        ? data
        : {
            ...data,
            cuePractice: {
              level: nextLevel,
              sessions: [...existing, session]
            }
          };
      await this.saveAppData(next);
      return next;
    },

    async loadActiveSession() {
      const active = await getRecord<PersistedLiveSession>(ACTIVE_KEY);
      if (!active) return null;

      const age = Date.now() - active.savedAt;
      if (age > 12 * 60 * 60 * 1000) {
        await deleteRecord(ACTIVE_KEY);
        return null;
      }

      return active;
    },

    async saveActiveSession(session) {
      await putRecord(ACTIVE_KEY, session);
    },

    async clearActiveSession() {
      await deleteRecord(ACTIVE_KEY);
    }
  };
}
