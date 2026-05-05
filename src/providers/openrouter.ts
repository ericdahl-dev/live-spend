import type { ProviderResult } from "../rates"

export async function fetchOpenRouter(apiKey: string): Promise<ProviderResult> {
  const res = await fetch("https://openrouter.ai/api/v1/auth/key", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!res.ok) {
    const text = await res.text()
    return { error: `${res.status}: ${text}` }
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
