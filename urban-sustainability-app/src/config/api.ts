/**
 * api.ts — Central API configuration.
 * All fetch calls go through here so switching from mock→real requires changing ONE line.
 *
 * In development: calls go to http://localhost:8000 (FastAPI backend).
 * In production:  set VITE_API_URL=https://your-render-url.onrender.com
 */
export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

/** Typed fetch wrapper — throws on non-2xx responses or timeout */
export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // 2-second timeout max

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      signal: controller.signal,
      ...options,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}
