export interface ProviderResult {
  spend?: number
  inputTokens?: number
  outputTokens?: number
  creditsUsed?: number
  creditsRemaining?: number
  error?: string
}

export interface ProviderRates {
  spend?: number
  inputTokens?: number
  outputTokens?: number
  creditsUsed?: number
}

export function hoursElapsedToday(now: Date = new Date()): number {
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return (now.getTime() - startOfDay.getTime()) / (1000 * 60 * 60)
}

export function calcRates(result: ProviderResult, now: Date = new Date()): ProviderRates {
  const hours = hoursElapsedToday(now)
  if (hours === 0) return {}

  const rates: ProviderRates = {}
  if (result.spend !== undefined) rates.spend = Number(result.spend) / hours
  if (result.inputTokens !== undefined) rates.inputTokens = result.inputTokens / hours
  if (result.outputTokens !== undefined) rates.outputTokens = result.outputTokens / hours
  if (result.creditsUsed !== undefined) rates.creditsUsed = Number(result.creditsUsed) / hours
  return rates
}
