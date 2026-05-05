import { createSignal } from "solid-js"
import type { ProviderResult } from "./providers/types"

export type ProviderStatus = "idle" | "loading" | "ok" | "error" | "unconfigured"

export interface ProviderState {
  result: ProviderResult
  status: ProviderStatus
  lastUpdated?: Date
  rates: {
    spend?: number
    inputTokens?: number
    outputTokens?: number
    creditsUsed?: number
  }
}

const defaultState = (): ProviderState => ({ result: {}, status: "idle", rates: {} })

export const [openai, setOpenAI] = createSignal<ProviderState>(defaultState())
export const [anthropic, setAnthropic] = createSignal<ProviderState>(defaultState())
export const [openrouter, setOpenRouter] = createSignal<ProviderState>(defaultState())

export function hoursElapsedToday(now: Date = new Date()): number {
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return (now.getTime() - startOfDay.getTime()) / (1000 * 60 * 60)
}

export function calcRates(result: ProviderResult, now: Date = new Date()): ProviderState["rates"] {
  const hours = hoursElapsedToday(now)
  if (hours === 0) return {}

  const rates: ProviderState["rates"] = {}
  if (result.spend !== undefined) rates.spend = Number(result.spend) / hours
  if (result.inputTokens !== undefined) rates.inputTokens = result.inputTokens / hours
  if (result.outputTokens !== undefined) rates.outputTokens = result.outputTokens / hours
  if (result.creditsUsed !== undefined) rates.creditsUsed = Number(result.creditsUsed) / hours
  return rates
}
