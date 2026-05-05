import { createSignal } from "solid-js"
import type { ProviderResult, ProviderRates } from "./rates"

export type { ProviderResult }

export type ProviderStatus = "idle" | "loading" | "ok" | "error" | "unconfigured"

export interface ProviderState {
  result: ProviderResult
  status: ProviderStatus
  lastUpdated?: Date
  rates: ProviderRates
}

const defaultState = (): ProviderState => ({ result: {}, status: "idle", rates: {} })

export const [openai, setOpenAI] = createSignal<ProviderState>(defaultState())
export const [anthropic, setAnthropic] = createSignal<ProviderState>(defaultState())
export const [openrouter, setOpenRouter] = createSignal<ProviderState>(defaultState())
