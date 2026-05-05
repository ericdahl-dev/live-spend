import type { ProviderResult } from "../rates"
import { fetchJson } from "./fetchJson"

/**
 * Fetches today's token usage from the Anthropic organization usage report API.
 * Requires an admin key (ANTHROPIC_ADMIN_KEY), not a regular inference key.
 * Returns raw token counts — Anthropic does not expose cost on standard keys.
 * Endpoint: GET /v1/organizations/usage_report/messages
 */
export async function fetchAnthropic(apiKey: string): Promise<ProviderResult> {
  const now = new Date()
  const todayMidnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const tomorrowMidnightUtc = new Date(todayMidnightUtc.getTime() + 86_400_000)

  const queryParams = new URLSearchParams({
    starting_at: todayMidnightUtc.toISOString(),
    ending_at: tomorrowMidnightUtc.toISOString(),
    bucket_width: "1d",
  })

  const result = await fetchJson<{
    data: Array<{
      usage: {
        input_tokens: number
        output_tokens: number
        cache_creation_input_tokens: number
        cache_read_input_tokens: number
      }
    }>
  }>(
    `https://api.anthropic.com/v1/organizations/usage_report/messages?${queryParams}`,
    { headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01" } }
  )

  if (!result.ok) return { error: result.error }
  if (!result.data.data?.length) return { inputTokens: 0, outputTokens: 0 }

  const totalInputTokens = result.data.data.reduce(
    (sum, bucket) => sum + (bucket.usage?.input_tokens ?? 0),
    0
  )
  const totalOutputTokens = result.data.data.reduce(
    (sum, bucket) => sum + (bucket.usage?.output_tokens ?? 0),
    0
  )

  return { inputTokens: totalInputTokens, outputTokens: totalOutputTokens }
}
