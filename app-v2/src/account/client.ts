export class AccountError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}
export interface AccountUser { id: string; email: string }
export async function accountRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, { method: body === undefined ? "GET" : "POST", credentials: "same-origin",
    cache: "no-store", headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15_000) });
  const result = await response.json().catch(() => ({})) as { error?: string; message?: string };
  if (!response.ok) throw new AccountError(response.status === 429 ? "Too many attempts. Wait a minute before trying again."
    : result.error ?? result.message ?? "Could not connect. Your local progress is safe; try again when online.", response.status);
  return result as T;
}
export function downloadAccountFile(value: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
