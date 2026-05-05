/**
 * Normalised usage data returned by every provider fetcher.
 * Fields are optional because each provider exposes different metrics.
 * OpenAI/OpenRouter return spend in USD; Anthropic returns raw token counts.
 */
export interface ProviderResult {
  /** Total USD spend for today. Provided by OpenAI and OpenRouter. */
  spend?: number
  /** Total input tokens consumed today. Provided by Anthropic. */
  inputTokens?: number
  /** Total output tokens generated today. Provided by Anthropic. */
  outputTokens?: number
  /** Lifetime credits consumed on this API key. Provided by OpenRouter. */
  creditsUsed?: number
  /** Credits remaining on this API key's limit. Provided by OpenRouter. */
  creditsRemaining?: number
  /** Human-readable error message if the fetch failed. */
  error?: string
}

/**
 * Hourly burn rates derived from today's cumulative usage.
 * Calculated as: value / hoursElapsedToday.
 * Fields are absent until at least one hour has elapsed.
 */
export interface ProviderRates {
  /** Projected USD spend per hour based on today's pace. */
  spend?: number
  /** Input tokens consumed per hour based on today's pace. */
  inputTokens?: number
  /** Output tokens generated per hour based on today's pace. */
  outputTokens?: number
  /** Credits used per hour based on today's pace. */
  creditsUsed?: number
}

/**
 * Returns the number of hours elapsed since midnight UTC today.
 * Used as the denominator when calculating hourly burn rates.
 */
export function hoursElapsedToday(now: Date = new Date()): number {
  const midnightUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return (now.getTime() - midnightUtc.getTime()) / (1000 * 60 * 60)
}

/**
 * Calculates hourly burn rates from today's cumulative usage totals.
 * Returns empty object if called at midnight (division by zero guard).
 */
export function calcRates(result: ProviderResult, now: Date = new Date()): ProviderRates {
  const hoursElapsed = hoursElapsedToday(now)
  if (hoursElapsed === 0) return {}

  const rates: ProviderRates = {}
  if (result.spend !== undefined) rates.spend = Number(result.spend) / hoursElapsed
  if (result.inputTokens !== undefined) rates.inputTokens = result.inputTokens / hoursElapsed
  if (result.outputTokens !== undefined) rates.outputTokens = result.outputTokens / hoursElapsed
  if (result.creditsUsed !== undefined) rates.creditsUsed = Number(result.creditsUsed) / hoursElapsed
  return rates
}
