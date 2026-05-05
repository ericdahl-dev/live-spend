/** Discriminated union returned by fetchJson — avoids throwing on HTTP errors. */
export type FetchJsonResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string }

/**
 * Fetches a URL and parses the JSON response.
 * Returns a discriminated union so callers handle errors without try/catch.
 * On non-2xx status, returns the response body as a human-readable error string.
 */
export async function fetchJson<T>(
  url: string,
  options: RequestInit
): Promise<FetchJsonResult<T>> {
  const res = await fetch(url, options)

  if (!res.ok) {
    const errorText = await res.text()
    return { ok: false, error: `${res.status}: ${errorText}` }
  }

  const data = (await res.json()) as T
  return { ok: true, data }
}
