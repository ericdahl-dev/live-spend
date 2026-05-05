import type { ProviderResult } from "../rates"
import { fetchJson } from "./fetchJson"

/**
 * Fetches credit usage for the current API key from OpenRouter.
 * Returns lifetime credits used and remaining balance on the key's limit.
 * Note: this reflects all-time usage on the key, not just today's.
 * Endpoint: GET /api/v1/auth/key
 */
export async function fetchOpenRouter(apiKey: string): Promise<ProviderResult> {
  const result = await fetchJson<{
    data: {
      usage: number | string | null
      limit: number | null
      limit_remaining: number | string | null
    }
  }>("https://openrouter.ai/api/v1/auth/key", {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (!result.ok) return { error: result.error }

  return {
    creditsUsed: result.data.data.usage != null ? Number(result.data.data.usage) : undefined,
    creditsRemaining: result.data.data.limit_remaining != null ? Number(result.data.data.limit_remaining) : undefined,
  }
}
