import { onMount, onCleanup } from "solid-js"
import { For } from "solid-js"
import { render, useKeyboard, useRenderer } from "@opentui/solid"
import { fetchOpenAI } from "./providers/openai"
import { fetchAnthropic } from "./providers/anthropic"
import { fetchOpenRouter } from "./providers/openrouter"
import type { ProviderResult } from "./rates"
import {
  openai, setOpenAI,
  anthropic, setAnthropic,
  openrouter, setOpenRouter,
} from "./rates"
import type { ProviderState } from "./rates"
import { calcRates } from "./rates"
import ProviderCard from "./components/ProviderCard"
import type { Accessor, Setter } from "solid-js"

/** How often to re-fetch all provider usage data, in milliseconds. */
const POLL_INTERVAL_MS = 30_000

/**
 * Everything needed to poll one provider and display its card.
 * Adding a new provider means adding one entry to PROVIDERS — nothing else.
 */
interface ProviderConfig {
  /** Display name shown in the card title. */
  name: string
  /** Accent color for the card border and values. */
  color: string
  /** API key read from the environment. Empty string = not configured. */
  apiKey: string
  /** Fetches today's usage from the provider's API. */
  fetcher: (apiKey: string) => Promise<ProviderResult>
  /** Solid signal accessor — reads current state for this provider. */
  state: Accessor<ProviderState>
  /** Solid signal setter — writes new state for this provider. */
  setState: Setter<ProviderState>
}

/**
 * All configured providers. To add a new one, append an entry here.
 * No other code needs to change.
 */
const PROVIDERS: ProviderConfig[] = [
  {
    name: "OpenAI",
    color: "#10a37f",
    apiKey: process.env["OPENAI_ADMIN_KEY"] ?? "",
    fetcher: fetchOpenAI,
    state: openai,
    setState: setOpenAI,
  },
  {
    name: "Anthropic",
    color: "#d97757",
    apiKey: process.env["ANTHROPIC_ADMIN_KEY"] ?? "",
    fetcher: fetchAnthropic,
    state: anthropic,
    setState: setAnthropic,
  },
  {
    name: "OpenRouter",
    color: "#6c7ae0",
    apiKey: process.env["OPENROUTER_API_KEY"] ?? "",
    fetcher: fetchOpenRouter,
    state: openrouter,
    setState: setOpenRouter,
  },
]

/**
 * Fetches fresh usage data for one provider and updates its signal.
 * Sets status to "loading" while the request is in flight, then "ok" or "error".
 */
async function pollProvider(provider: ProviderConfig) {
  provider.setState(previous => ({ ...previous, status: "loading" }))
  const result = await provider.fetcher(provider.apiKey)
  const fetchedAt = new Date()
  const rates = result.error ? {} : calcRates(result, fetchedAt)
  provider.setState({ result, status: result.error ? "error" : "ok", lastUpdated: fetchedAt, rates })
}

/** Polls all providers that have an API key configured, in parallel. */
async function pollAll() {
  const configuredProviders = PROVIDERS.filter(provider => provider.apiKey)
  await Promise.all(configuredProviders.map(pollProvider))
}

/** Marks providers with no API key as unconfigured so the UI shows a clear message. */
function markUnconfiguredProviders() {
  const unconfiguredProviders = PROVIDERS.filter(provider => !provider.apiKey)
  unconfiguredProviders.forEach(provider =>
    provider.setState({ result: {}, status: "unconfigured", rates: {} })
  )
}

function App() {
  const renderer = useRenderer()

  useKeyboard((key) => {
    if (key.name === "q" || (key.ctrl && key.name === "c")) renderer.destroy()
    if (key.name === "r") void pollAll()
  })

  onMount(() => {
    markUnconfiguredProviders()
    void pollAll()
    const intervalId = setInterval(() => void pollAll(), POLL_INTERVAL_MS)
    onCleanup(() => clearInterval(intervalId))
  })

  return (
    <box flexDirection="column" flexGrow={1}>
      <box
        borderBottom
        borderColor="#444"
        paddingX={2}
        justifyContent="space-between"
        alignItems="center"
      >
        <text fg="#7aa2f7">
          <strong>live-spend</strong>
          <span fg="#555">  AI token usage</span>
        </text>
        <text fg="#555">r=refresh  q=quit</text>
      </box>

      <box flexDirection="row" flexGrow={1} gap={1} padding={1}>
        <For each={PROVIDERS}>
          {(provider) => (
            <ProviderCard name={provider.name} color={provider.color} state={provider.state()} />
          )}
        </For>
      </box>

      <box
        borderTop
        borderColor="#444"
        paddingX={2}
        justifyContent="flex-end"
      >
        <text fg="#555">auto-refresh every 30s</text>
      </box>
    </box>
  )
}

render(() => <App />)
