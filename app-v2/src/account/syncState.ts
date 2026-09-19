import type { AppData } from "../domain/types";
import {
  flatten,
  inflate,
  type SyncOperation,
  type SyncReply,
  type SyncValue,
  type RemoteRecord,
} from "./protocol";
export interface SyncConflict {
  key: string;
  local: SyncValue | null;
  remote: RemoteRecord;
}
export interface SyncState {
  accountId: string;
  enabled: boolean;
  deleted?: boolean;
  cursor: number;
  lastSyncAt?: number;
  shadow: Record<string, SyncValue>;
  remote: Record<string, RemoteRecord>;
  outbox: SyncOperation[];
  conflicts: SyncConflict[];
  archive: SyncConflict[];
}
const equal = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
export function connect(data: AppData, accountId: string): AppData {
  if (data.sync && !data.sync.deleted && data.sync.accountId !== accountId)
    throw new Error(
      "This log belongs to another account. Export it before removing it from this device.",
    );
  return reconcile({
    ...data,
    sync:
      data.sync && !data.sync.deleted
        ? { ...data.sync, enabled: true }
        : {
            accountId,
            enabled: true,
            cursor: 0,
            shadow: {},
            remote: {},
            outbox: [],
            conflicts: [],
            archive: data.sync?.archive ?? [],
          },
  });
}
export function reconcile(data: AppData): AppData {
  if (!data.sync) return data;
  const state = structuredClone(data.sync);
  const current = flatten(data);
  for (const key of new Set([
    ...Object.keys(state.shadow),
    ...Object.keys(current),
  ])) {
    if (equal(state.shadow[key], current[key])) continue;
    const value = current[key] ?? null;
    const conflict = state.conflicts.find((item) => item.key === key);
    if (conflict) conflict.local = value;
    else {
      const previous = state.outbox.find((item) => item.key === key);
      state.outbox = state.outbox.filter((item) => item.key !== key);
      state.outbox.push({
        id: crypto.randomUUID(),
        key,
        value,
        base: previous?.base ?? state.remote[key]?.revision ?? 0,
      });
    }
  }
  state.shadow = current;
  return { ...data, sync: state };
}
export function applyReply(
  data: AppData,
  accountId: string,
  sent: SyncOperation[],
  reply: SyncReply,
): AppData {
  let next = reconcile(data);
  if (!next.sync?.enabled || next.sync.accountId !== accountId) return next;
  const state = structuredClone(next.sync);
  for (const ack of reply.accepted) {
    const op = sent.find((item) => item.id === ack.id);
    if (!op) continue;
    state.outbox = state.outbox.filter((item) => item.id !== ack.id);
    const newer = state.outbox.find((item) => item.key === op.key);
    if (newer) newer.base = ack.revision;
    if (ack.revision > (state.remote[op.key]?.revision ?? 0))
      state.remote[op.key] = {
        key: op.key,
        revision: ack.revision,
        value: op.value,
      };
  }
  function conflict(record: RemoteRecord) {
    state.outbox = state.outbox.filter((item) => item.key !== record.key);
    const existing = state.conflicts.find((item) => item.key === record.key);
    if (existing) existing.remote = record;
    else
      state.conflicts.push({
        key: record.key,
        local: state.shadow[record.key] ?? null,
        remote: record,
      });
  }
  for (const item of reply.conflicts) {
    if (sent.some((op) => op.id === item.id)) {
      state.remote[item.record.key] = item.record;
      conflict(item.record);
    }
  }
  for (const record of reply.changes) {
    if (record.revision <= (state.remote[record.key]?.revision ?? 0)) continue;
    const localTrack = state.shadow[record.key];
    const removesLocalTrack =
      record.value === null && localTrack?.kind === "scenario";
    state.remote[record.key] = record;
    const pending = state.outbox.find((item) => item.key === record.key);
    if (
      removesLocalTrack ||
      state.conflicts.some((item) => item.key === record.key) ||
      (pending && !equal(pending.value, record.value))
    )
      conflict(record);
    else if (pending)
      state.outbox = state.outbox.filter((item) => item.key !== record.key);
  }
  const values = { ...flatten(next) };
  const assign = (key: string, value: SyncValue | null) => {
    if (value) values[key] = value;
    else delete values[key];
  };
  Object.values(state.remote).forEach((record) =>
    assign(record.key, record.value),
  );
  state.outbox.forEach((op) => assign(op.key, op.value));
  state.conflicts.forEach((item) => assign(item.key, item.local));
  next = inflate(values, next);
  state.cursor = reply.cursor;
  state.shadow = flatten(next);
  if (!reply.hasMore && !state.outbox.length && !state.conflicts.length)
    state.lastSyncAt = Date.now();
  return { ...next, sync: state };
}
export function resolveConflict(
  data: AppData,
  key: string,
  choice: "local" | "cloud",
): AppData {
  if (!data.sync) return data;
  const next = reconcile(data);
  const state = structuredClone(next.sync!);
  const item = state.conflicts.find((conflict) => conflict.key === key);
  if (!item) return data;
  if (
    choice === "cloud" &&
    item.remote.value === null &&
    item.local?.kind === "scenario" &&
    next.scenarios.length === 1
  ) {
    throw new Error(
      "This is your last training track. Keep this device’s version, or export a backup and use the local reset before restoring the cloud log.",
    );
  }
  state.archive.push(item); // Keep both versions locally, including after explicit resolution.
  state.conflicts = state.conflicts.filter((conflict) => conflict.key !== key);
  const values = flatten(next);
  const value = choice === "local" ? item.local : item.remote.value;
  if (choice === "cloud" && value === null && item.local?.kind === "scenario") {
    const trackId = item.local.id;
    for (const [childKey, child] of Object.entries(values)) {
      if (
        (child.kind === "session" || child.kind === "cue") &&
        child.scenarioId === trackId
      ) {
        state.archive.push({
          key: childKey,
          local: child,
          remote: state.remote[childKey] ?? {
            key: childKey,
            revision: 0,
            value: null,
          },
        });
        delete values[childKey];
        state.outbox = state.outbox.filter((op) => op.key !== childKey);
        state.conflicts = state.conflicts.filter(
          (conflict) => conflict.key !== childKey,
        );
      }
    }
  }
  if (value) values[key] = value;
  else delete values[key];
  if (choice === "local")
    state.outbox.push({
      id: crypto.randomUUID(),
      key,
      base: item.remote.revision,
      value,
    });
  const result = inflate(values, next);
  state.shadow = flatten(result);
  return { ...result, sync: state };
}
