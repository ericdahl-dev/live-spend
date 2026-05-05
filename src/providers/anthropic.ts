import type { ProviderResult } from "./types"

export async function fetchAnthropic(apiKey: string): Promise<ProviderResult> {
  const now = new Date()
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const endOfDay = new Date(startOfDay.getTime() + 86400000)

  const params = new URLSearchParams({
    starting_at: startOfDay.toISOString(),
    ending_at: endOfDay.toISOString(),
    bucket_width: "1d",
  })

  const res = await fetch(
    `https://api.anthropic.com/v1/organizations/usage_report/messages?${params}`,
    {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    return { error: `${res.status}: ${text}` }
  }

  const json = (await res.json()) as {
    data: Array<{
      usage: {
        input_tokens: number
        output_tokens: number
        cache_creation_input_tokens: number
        cache_read_input_tokens: number
      }
    }>
  }

  if (!json.data?.length) return { inputTokens: 0, outputTokens: 0 }

  const inputTokens = json.data.reduce((sum, d) => sum + (d.usage?.input_tokens ?? 0), 0)
  const outputTokens = json.data.reduce((sum, d) => sum + (d.usage?.output_tokens ?? 0), 0)

  return { inputTokens, outputTokens }
}
