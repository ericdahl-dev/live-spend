import type { ProviderResult } from "../rates"
import { fetchJson } from "./fetchJson"

/**
 * Fetches today's total spend from the OpenAI organization costs API.
 * Requires an admin key (OPENAI_ADMIN_KEY), not a regular inference key.
 * Endpoint: GET /v1/organization/costs
 */
export async function fetchOpenAI(apiKey: string): Promise<ProviderResult> {
  const todayMidnightUtcUnix = Math.floor(new Date().setUTCHours(0, 0, 0, 0) / 1000)

  const result = await fetchJson<{
    data: Array<{
      results: Array<{ amount: { value: number | string; currency: string } }>
    }>
  }>(
    `https://api.openai.com/v1/organization/costs?start_time=${todayMidnightUtcUnix}&limit=1`,
    { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
  )

  if (!result.ok) return { error: result.error }

  const todayBucket = result.data.data[0]
  if (!todayBucket?.results?.length) return { spend: 0 }

  const totalSpend = todayBucket.results.reduce(
    (sum, lineItem) => sum + Number(lineItem.amount?.value ?? 0),
    0
  )
  return { spend: totalSpend }
}
