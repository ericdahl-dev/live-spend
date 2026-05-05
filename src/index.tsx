import { onMount, onCleanup } from "solid-js"
import { render, useKeyboard, useRenderer } from "@opentui/solid"
import { fetchOpenAI } from "./providers/openai"
import { fetchAnthropic } from "./providers/anthropic"
import { fetchOpenRouter } from "./providers/openrouter"
import {
  openai, setOpenAI,
  anthropic, setAnthropic,
  openrouter, setOpenRouter,
  calcRates,
} from "./store"
import ProviderCard from "./components/ProviderCard"

const POLL_INTERVAL_MS = 30_000

const OPENAI_KEY = process.env["OPENAI_ADMIN_KEY"] ?? ""
const ANTHROPIC_KEY = process.env["ANTHROPIC_ADMIN_KEY"] ?? ""
const OPENROUTER_KEY = process.env["OPENROUTER_API_KEY"] ?? ""

function initUnconfigured() {
  if (!OPENAI_KEY) setOpenAI({ result: {}, status: "unconfigured", rates: {} })
  if (!ANTHROPIC_KEY) setAnthropic({ result: {}, status: "unconfigured", rates: {} })
  if (!OPENROUTER_KEY) setOpenRouter({ result: {}, status: "unconfigured", rates: {} })
}

async function pollAll() {
  if (OPENAI_KEY) {
    setOpenAI(s => ({ ...s, status: "loading" }))
    const result = await fetchOpenAI(OPENAI_KEY)
    const now = new Date()
    const rates = result.error ? {} : calcRates(result, now)
    setOpenAI({ result, status: result.error ? "error" : "ok", lastUpdated: now, rates })
  }

  if (ANTHROPIC_KEY) {
    setAnthropic(s => ({ ...s, status: "loading" }))
    const result = await fetchAnthropic(ANTHROPIC_KEY)
    const now = new Date()
    const rates = result.error ? {} : calcRates(result, now)
    setAnthropic({ result, status: result.error ? "error" : "ok", lastUpdated: now, rates })
  }

  if (OPENROUTER_KEY) {
    setOpenRouter(s => ({ ...s, status: "loading" }))
    const result = await fetchOpenRouter(OPENROUTER_KEY)
    const now = new Date()
    const rates = result.error ? {} : calcRates(result, now)
    setOpenRouter({ result, status: result.error ? "error" : "ok", lastUpdated: now, rates })
  }
}

function App() {
  const renderer = useRenderer()

  useKeyboard((key) => {
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      renderer.destroy()
    }
    if (key.name === "r") {
      void pollAll()
    }
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
        <ProviderCard name="OpenAI" color="#10a37f" state={openai()} />
        <ProviderCard name="Anthropic" color="#d97757" state={anthropic()} />
        <ProviderCard name="OpenRouter" color="#6c7ae0" state={openrouter()} />
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
