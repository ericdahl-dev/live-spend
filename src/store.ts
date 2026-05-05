import { createSignal } from "solid-js"
import type { ProviderResult, ProviderRates } from "./rates"

export type { ProviderResult }

/** Lifecycle status of a provider's data fetch. */
export type ProviderStatus =
  | "idle"          // Initial state before first poll
  | "loading"       // Fetch in flight
  | "ok"            // Last fetch succeeded
  | "error"         // Last fetch failed
  | "unconfigured"  // No API key set for this provider

/** All reactive state for one provider, held in a Solid signal. */
export interface ProviderState {
  /** The latest usage data from the provider's API. */
  result: ProviderResult
  /** Current lifecycle status of this provider's data. */
  status: ProviderStatus
  /** When the last successful or failed fetch completed. */
  lastUpdated?: Date
  /** Hourly burn rates derived from result. Empty until data is available. */
  rates: ProviderRates
}

const initialState = (): ProviderState => ({ result: {}, status: "idle", rates: {} })

export const [openai, setOpenAI] = createSignal<ProviderState>(initialState())
export const [anthropic, setAnthropic] = createSignal<ProviderState>(initialState())
export const [openrouter, setOpenRouter] = createSignal<ProviderState>(initialState())
