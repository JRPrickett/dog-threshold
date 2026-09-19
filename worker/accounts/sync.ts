import { keyFor, syncRequestSchema, type RemoteRecord, type SyncReply } from "../../app-v2/src/account/protocol";
interface Row { record_key: string; revision: number; value_json: string | null }
const record = (row: Row): RemoteRecord => ({ key: row.record_key, revision: row.revision, value: row.value_json === null ? null : JSON.parse(row.value_json) });
export async function sync(db: D1Database, userId: string, input: unknown): Promise<SyncReply> {
  const body = syncRequestSchema.parse(input);
  const reply: SyncReply = { accepted: [], conflicts: [], changes: [], cursor: body.cursor, hasMore: false };
  for (const op of body.operations) {
    if (op.value && keyFor(op.value) !== op.key) throw new Error("Invalid record key");
    if (!/^(profile|scenario|session|cue):/.test(op.key)) throw new Error("Invalid record key");
  }
  for (const op of body.operations) {
    // Batch is atomic. The conditional insert is an optimistic compare-and-swap; never overwrite a newer edit.
    await db.batch([
      db.prepare(`INSERT OR IGNORE INTO sync_changes(user_id,mutation_id,record_key,value_json)
        SELECT ?,?,?,? WHERE COALESCE((SELECT revision FROM sync_records WHERE user_id=? AND record_key=?),0)=?`)
        .bind(userId, op.id, op.key, op.value === null ? null : JSON.stringify(op.value), userId, op.key, op.base),
      db.prepare(`INSERT INTO sync_records(user_id,record_key,revision,value_json)
        SELECT user_id,record_key,seq,value_json FROM sync_changes WHERE user_id=? AND mutation_id=?
        ON CONFLICT(user_id,record_key) DO UPDATE SET revision=excluded.revision,value_json=excluded.value_json
        WHERE sync_records.revision < excluded.revision`).bind(userId, op.id)
    ]);
    const accepted = await db.prepare("SELECT seq FROM sync_changes WHERE user_id=? AND mutation_id=?").bind(userId, op.id).first<{ seq: number }>();
    if (accepted) reply.accepted.push({ id: op.id, revision: accepted.seq });
    else {
      const row = await db.prepare("SELECT record_key,revision,value_json FROM sync_records WHERE user_id=? AND record_key=?").bind(userId, op.key).first<Row>();
      reply.conflicts.push({ id: op.id, record: row ? record(row) : { key: op.key, revision: 0, value: null } });
    }
  }
  const { results } = await db.prepare("SELECT record_key,seq AS revision,value_json FROM sync_changes WHERE user_id=? AND seq>? ORDER BY seq LIMIT 201")
    .bind(userId, body.cursor).all<Row>();
  reply.hasMore = results.length > 200;
  reply.changes = results.slice(0, 200).map(record);
  reply.cursor = reply.changes.at(-1)?.revision ?? body.cursor;
  return reply;
}
