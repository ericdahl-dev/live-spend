import type { ProviderResult } from "../rates"

/**
 * Fetches credit usage for the current API key from OpenRouter.
 * Returns lifetime credits used and remaining balance on the key's limit.
 * Note: this reflects all-time usage on the key, not just today's.
 * Endpoint: GET /api/v1/auth/key
 */
export async function fetchOpenRouter(apiKey: string): Promise<ProviderResult> {
  const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!res.ok) {
    const errorText = await res.text()
    return { error: `${res.status}: ${errorText}` }
  }

  const json = (await res.json()) as {
    data: {
      usage: number | null
      limit: number | null
      limit_remaining: number | null
    }
  }

  return {
    creditsUsed: json.data.usage ?? undefined,
    creditsRemaining: json.data.limit_remaining ?? undefined,
  }
}
