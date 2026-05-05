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
} from "./store"
import type { ProviderState } from "./store"
import { calcRates } from "./rates"
import ProviderCard from "./components/ProviderCard"
import type { Accessor, Setter } from "solid-js"

const POLL_INTERVAL_MS = 30_000

interface ProviderConfig {
  name: string
  color: string
  apiKey: string
  fetcher: (key: string) => Promise<ProviderResult>
  state: Accessor<ProviderState>
  setState: Setter<ProviderState>
}

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

async function pollProvider(p: ProviderConfig) {
  p.setState(s => ({ ...s, status: "loading" }))
  const result = await p.fetcher(p.apiKey)
  const now = new Date()
  const rates = result.error ? {} : calcRates(result, now)
  p.setState({ result, status: result.error ? "error" : "ok", lastUpdated: now, rates })
}

async function pollAll() {
  await Promise.all(PROVIDERS.filter(p => p.apiKey).map(pollProvider))
}

function initUnconfigured() {
  PROVIDERS.filter(p => !p.apiKey).forEach(p =>
    p.setState({ result: {}, status: "unconfigured", rates: {} })
  )
}

function App() {
  const renderer = useRenderer()

  useKeyboard((key) => {
    if (key.name === "q" || (key.ctrl && key.name === "c")) renderer.destroy()
    if (key.name === "r") void pollAll()
  })

  onMount(() => {
    initUnconfigured()
    void pollAll()
    const id = setInterval(() => void pollAll(), POLL_INTERVAL_MS)
    onCleanup(() => clearInterval(id))
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
          {(p) => <ProviderCard name={p.name} color={p.color} state={p.state()} />}
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
