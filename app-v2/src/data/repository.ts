import type {
  AppData,
  DepartureCueSession,
  Scenario,
  TrainingSession
} from "../domain/types";
import type { PersistedLiveSession } from "../session/sessionPersistence";
import { activeScenario, replaceScenario } from "./appData";
import { readLegacyAppData } from "./legacyImport";

const DB_NAME = "dog-training-app";
const DB_VERSION = 1;
const STORE = "records";
const APP_KEY = "app-data";
const ACTIVE_KEY = "active-session";
const FALLBACK_APP_KEY = "dog-training-app.fallback.v1";
const FALLBACK_ACTIVE_KEY = "dog-training-app.active.fallback.v1";

export type StorageMode = "indexeddb" | "localstorage" | "memory";

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
  appendSession(session: TrainingSession, scenarioId?: string): Promise<AppData>;
  updateSession(scenarioId: string, session: TrainingSession): Promise<AppData>;
  deleteSession(scenarioId: string, sessionId: string): Promise<AppData>;
  appendDepartureCueSession(
    session: DepartureCueSession,
    nextLevel: number
  ): Promise<AppData>;
  setActiveScenario(id: string): Promise<AppData>;
  createScenario(label: string, startSeconds: number): Promise<AppData>;
  updateScenario(
    id: string,
    label: string,
    startSeconds: number,
    warmupCount?: number,
    restSeconds?: number,
    shuffleWarmups?: boolean
  ): Promise<AppData>;
  updateDailyCap(cap: number): Promise<AppData>;
  loadActiveSession(): Promise<PersistedLiveSession | null>;
  saveActiveSession(session: PersistedLiveSession): Promise<void>;
  clearActiveSession(): Promise<void>;
  storageMode(): StorageMode;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed"));
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

function normaliseScenario(scenario: Scenario, index: number): Scenario {
  const id = String(scenario?.id || `scenario-${index + 1}`);
  return {
    id,
    label: String(scenario?.label || `Scenario ${index + 1}`).slice(0, 48),
    startSeconds: Math.max(1, Math.round(Number(scenario?.startSeconds || 5))),
    sessions: Array.isArray(scenario?.sessions)
      ? scenario.sessions.slice().sort((a, b) => a.at - b.at)
      : [],
    cuePractice: scenario.cuePractice
      ? {
          level: Math.max(
            0,
            Math.min(7, Math.round(scenario.cuePractice.level ?? 0))
          ),
          sessions: Array.isArray(scenario.cuePractice.sessions)
            ? scenario.cuePractice.sessions.slice()
            : []
        }
      : undefined,
    warmupCount:
      scenario?.warmupCount == null
        ? undefined
        : Math.max(0, Math.min(4, Math.round(scenario.warmupCount))),
    shuffleWarmups:
      scenario?.shuffleWarmups == null
        ? undefined
        : Boolean(scenario.shuffleWarmups),
    restSeconds:
      scenario?.restSeconds == null
        ? undefined
        : Math.max(0, Math.min(3600, Math.round(scenario.restSeconds)))
  };
}

function normaliseAppData(data: AppData): AppData {
  const scenarios =
    Array.isArray(data.scenarios) && data.scenarios.length
      ? data.scenarios.map(normaliseScenario)
      : [
          {
            id: "training",
            label: "Separation training",
            startSeconds: 5,
            sessions: []
          }
        ];

  const requestedActive = String(data.activeScenarioId || "");

  return {
    dogName: String(data.dogName || "").slice(0, 40),
    activeScenarioId: scenarios.some(
      (scenario) => scenario.id === requestedActive
    )
      ? requestedActive
      : scenarios[0].id,
    scenarios,
    dailyCap:
      data.dailyCap == null
        ? undefined
        : Math.max(1, Math.min(10, Math.round(data.dailyCap)))
  };
}

function safeLocalStorage(): Storage | null {
  try {
    const storage = globalThis.localStorage;
    const probe = "__dog_training_storage_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

function fallbackRepository(initial: AppData): AppRepository {
  const storage = safeLocalStorage();
  let persistent = Boolean(storage);
  let data = normaliseAppData(initial);
  let active: PersistedLiveSession | null = null;

  if (storage) {
    try {
      const saved = storage.getItem(FALLBACK_APP_KEY);
      if (saved) data = normaliseAppData(JSON.parse(saved) as AppData);

      const savedActive = storage.getItem(FALLBACK_ACTIVE_KEY);
      if (savedActive) {
        active = JSON.parse(savedActive) as PersistedLiveSession;
      }
    } catch {
      persistent = false;
    }
  }

  function persistData() {
    if (!storage || !persistent) return;
    try {
      storage.setItem(FALLBACK_APP_KEY, JSON.stringify(data));
    } catch {
      persistent = false;
    }
  }

  function persistActive() {
    if (!storage || !persistent) return;
    try {
      if (active) {
        storage.setItem(FALLBACK_ACTIVE_KEY, JSON.stringify(active));
      } else {
        storage.removeItem(FALLBACK_ACTIVE_KEY);
      }
    } catch {
      persistent = false;
    }
  }

  return {
    async loadAppData() {
      return data;
    },
    async saveAppData(next) {
      data = normaliseAppData(next);
      persistData();
    },
    async saveSetup(dogName, startSeconds) {
      const scenario = activeScenario(data);
      data = normaliseAppData(
        replaceScenario(
          { ...data, dogName: dogName.trim() },
          { ...scenario, startSeconds }
        )
      );
      persistData();
      return data;
    },
    async appendSession(session, scenarioId) {
      const scenario =
        data.scenarios.find((item) => item.id === scenarioId) ??
        activeScenario(data);
      if (!scenario.sessions.some((item) => item.id === session.id)) {
        data = normaliseAppData(
          replaceScenario(data, {
            ...scenario,
            sessions: [...scenario.sessions, session]
          })
        );
        persistData();
      }
      return data;
    },
    async updateSession(scenarioId, session) {
      const scenario = data.scenarios.find((item) => item.id === scenarioId);
      if (!scenario) return data;
      data = normaliseAppData(
        replaceScenario(data, {
          ...scenario,
          sessions: scenario.sessions.map((item) =>
            item.id === session.id ? session : item
          )
        })
      );
      persistData();
      return data;
    },
    async deleteSession(scenarioId, sessionId) {
      const scenario = data.scenarios.find((item) => item.id === scenarioId);
      if (!scenario) return data;
      data = normaliseAppData(
        replaceScenario(data, {
          ...scenario,
          sessions: scenario.sessions.filter((item) => item.id !== sessionId)
        })
      );
      persistData();
      return data;
    },
    async appendDepartureCueSession(session, nextLevel) {
      const scenario = activeScenario(data);
      const existing = scenario.cuePractice?.sessions ?? [];
      if (!existing.some((item) => item.id === session.id)) {
        data = normaliseAppData(
          replaceScenario(data, {
            ...scenario,
            cuePractice: {
              level: nextLevel,
              sessions: [...existing, session]
            }
          })
        );
        persistData();
      }
      return data;
    },
    async setActiveScenario(id) {
      if (data.scenarios.some((scenario) => scenario.id === id)) {
        data = { ...data, activeScenarioId: id };
        persistData();
      }
      return data;
    },
    async createScenario(label, startSeconds) {
      const id = `scenario-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const scenario: Scenario = {
        id,
        label: label.trim() || "New training track",
        startSeconds: Math.max(1, Math.round(startSeconds || 1)),
        sessions: []
      };
      data = normaliseAppData({
        ...data,
        activeScenarioId: id,
        scenarios: [...data.scenarios, scenario]
      });
      persistData();
      return data;
    },
    async updateScenario(
      id,
      label,
      startSeconds,
      warmupCount,
      restSeconds,
      shuffleWarmups
    ) {
      const existing = data.scenarios.find((scenario) => scenario.id === id);
      if (!existing) return data;
      data = normaliseAppData(
        replaceScenario(data, {
          ...existing,
          label: label.trim() || existing.label,
          startSeconds: Math.max(1, Math.round(startSeconds || existing.startSeconds)),
          warmupCount: warmupCount ?? existing.warmupCount,
          restSeconds: restSeconds ?? existing.restSeconds,
          shuffleWarmups: shuffleWarmups ?? existing.shuffleWarmups
        })
      );
      persistData();
      return data;
    },
    async updateDailyCap(cap) {
      data = normaliseAppData({ ...data, dailyCap: cap });
      persistData();
      return data;
    },
    async loadActiveSession() {
      return active;
    },
    async saveActiveSession(session) {
      active = session;
      persistActive();
    },
    async clearActiveSession() {
      active = null;
      persistActive();
    },
    storageMode() {
      return persistent ? "localstorage" : "memory";
    }
  };
}

export function createAppRepository(): AppRepository {
  let legacy: AppData;
  try {
    legacy = readLegacyAppData();
  } catch {
    legacy = {
      dogName: "",
      activeScenarioId: "training",
      scenarios: [
        {
          id: "training",
          label: "Separation training",
          startSeconds: 5,
          sessions: []
        }
      ]
    };
  }

  if (typeof indexedDB === "undefined") {
    return fallbackRepository(legacy);
  }

  const fallback = fallbackRepository(legacy);
  let useFallback = false;

  async function safely<T>(
    primary: () => Promise<T>,
    secondary: () => Promise<T>
  ): Promise<T> {
    if (useFallback) return secondary();
    try {
      return await primary();
    } catch {
      useFallback = true;
      return secondary();
    }
  }

  const repository: AppRepository = {
    async loadAppData() {
      return safely(
        async () => {
          const existing = await getRecord<AppData>(APP_KEY);
          if (existing) return normaliseAppData(existing);

          const migrated = normaliseAppData(legacy);
          await putRecord(APP_KEY, migrated);
          await fallback.saveAppData(migrated);
          return migrated;
        },
        () => fallback.loadAppData()
      );
    },

    async saveAppData(data) {
      const normalised = normaliseAppData(data);
      await fallback.saveAppData(normalised);
      return safely(
        async () => {
          await putRecord(APP_KEY, normalised);
        },
        async () => {}
      );
    },

    async saveSetup(dogName, startSeconds) {
      const data = await repository.loadAppData();
      const scenario = activeScenario(data);
      const next = normaliseAppData(
        replaceScenario(
          { ...data, dogName: dogName.trim() },
          { ...scenario, startSeconds }
        )
      );
      await repository.saveAppData(next);
      return next;
    },

    async appendSession(session, scenarioId) {
      const data = await repository.loadAppData();
      const scenario =
        data.scenarios.find((item) => item.id === scenarioId) ??
        activeScenario(data);
      const exists = scenario.sessions.some((item) => item.id === session.id);
      const next = exists
        ? data
        : replaceScenario(data, {
            ...scenario,
            sessions: [...scenario.sessions, session]
          });
      await repository.saveAppData(next);
      return next;
    },

    async updateSession(scenarioId, session) {
      const data = await repository.loadAppData();
      const scenario = data.scenarios.find((item) => item.id === scenarioId);
      if (!scenario) return data;
      const next = replaceScenario(data, {
        ...scenario,
        sessions: scenario.sessions.map((item) =>
          item.id === session.id ? session : item
        )
      });
      await repository.saveAppData(next);
      return next;
    },

    async deleteSession(scenarioId, sessionId) {
      const data = await repository.loadAppData();
      const scenario = data.scenarios.find((item) => item.id === scenarioId);
      if (!scenario) return data;
      const next = replaceScenario(data, {
        ...scenario,
        sessions: scenario.sessions.filter((item) => item.id !== sessionId)
      });
      await repository.saveAppData(next);
      return next;
    },

    async appendDepartureCueSession(session, nextLevel) {
      const data = await repository.loadAppData();
      const scenario = activeScenario(data);
      const existing = scenario.cuePractice?.sessions ?? [];
      const exists = existing.some((item) => item.id === session.id);
      const next = exists
        ? data
        : replaceScenario(data, {
            ...scenario,
            cuePractice: {
              level: nextLevel,
              sessions: [...existing, session]
            }
          });
      await repository.saveAppData(next);
      return next;
    },

    async setActiveScenario(id) {
      const data = await repository.loadAppData();
      if (!data.scenarios.some((scenario) => scenario.id === id)) return data;
      const next = { ...data, activeScenarioId: id };
      await repository.saveAppData(next);
      return next;
    },

    async createScenario(label, startSeconds) {
      const data = await repository.loadAppData();
      const id = `scenario-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
      const scenario: Scenario = {
        id,
        label: label.trim() || "New training track",
        startSeconds: Math.max(1, Math.round(startSeconds || 1)),
        sessions: []
      };
      const next = normaliseAppData({
        ...data,
        activeScenarioId: id,
        scenarios: [...data.scenarios, scenario]
      });
      await repository.saveAppData(next);
      return next;
    },

    async updateScenario(
      id,
      label,
      startSeconds,
      warmupCount,
      restSeconds,
      shuffleWarmups
    ) {
      const data = await repository.loadAppData();
      const existing = data.scenarios.find((scenario) => scenario.id === id);
      if (!existing) return data;
      const next = normaliseAppData(
        replaceScenario(data, {
          ...existing,
          label: label.trim() || existing.label,
          startSeconds: Math.max(1, Math.round(startSeconds || existing.startSeconds)),
          warmupCount: warmupCount ?? existing.warmupCount,
          restSeconds: restSeconds ?? existing.restSeconds,
          shuffleWarmups: shuffleWarmups ?? existing.shuffleWarmups
        })
      );
      await repository.saveAppData(next);
      return next;
    },

    async updateDailyCap(cap) {
      const data = await repository.loadAppData();
      const next = normaliseAppData({ ...data, dailyCap: cap });
      await repository.saveAppData(next);
      return next;
    },

    async loadActiveSession() {
      return safely(
        async () => {
          const active = await getRecord<PersistedLiveSession>(ACTIVE_KEY);
          if (!active) return null;

          const age = Date.now() - active.savedAt;
          if (age > 12 * 60 * 60 * 1000) {
            await deleteRecord(ACTIVE_KEY);
            return null;
          }

          return active;
        },
        () => fallback.loadActiveSession()
      );
    },

    async saveActiveSession(session) {
      await fallback.saveActiveSession(session);
      return safely(
        async () => {
          await putRecord(ACTIVE_KEY, session);
        },
        async () => {}
      );
    },

    async clearActiveSession() {
      await fallback.clearActiveSession();
      return safely(
        async () => {
          await deleteRecord(ACTIVE_KEY);
        },
        async () => {}
      );
    },

    storageMode() {
      return useFallback ? fallback.storageMode() : "indexeddb";
    }
  };

  return repository;
}
