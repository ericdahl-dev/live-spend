import type { Component } from "solid-js"
import { Show } from "solid-js"
import type { ProviderState } from "../store"

interface Props {
  name: string
  color: string
  state: ProviderState
}

function fmtRate(val: number | undefined, unit: "usd" | "tok"): string {
  if (val === undefined) return ""
  if (unit === "usd") return `$${val.toFixed(4)} / hr`
  const abs = Math.abs(val)
  const formatted = abs >= 1000 ? `${(abs / 1000).toFixed(1)}k` : abs.toFixed(0)
  return `${formatted} tok / hr`
}

const ProviderCard: Component<Props> = (props) => {
  const isLoading = () => props.state.status === "loading"
  const isError = () => props.state.status === "error"
  const isUnconfigured = () => props.state.status === "unconfigured"
  const result = () => props.state.result
  const rates = () => props.state.rates

  const lastUpdated = () => {
    const d = props.state.lastUpdated
    if (!d) return ""
    return d.toLocaleTimeString()
  }

  return (
    <box
      border
      borderStyle="rounded"
      borderColor={isError() ? "#ff5555" : props.color}
      title={` ${props.name} `}
      titleAlignment="center"
      flexDirection="column"
      padding={1}
      flexGrow={1}
    >
      <Show when={isUnconfigured()}>
        <text fg="#555">no API key set</text>
      </Show>

      <Show when={isError()}>
        <text fg="#ff5555">{result().error ?? "Unknown error"}</text>
      </Show>

      <Show when={!isError() && !isUnconfigured()}>
        <Show when={result().spend !== undefined}>
          <text>
            <span fg="#888">Spend today: </span>
            <span fg={props.color}>
              {isLoading() ? "…" : `$${Number(result().spend ?? 0).toFixed(4)}`}
            </span>
          </text>
          <Show when={rates().spend !== undefined}>
            <text>
              <span fg="#888">Rate:        </span>
              <span fg="#666">{fmtRate(rates().spend, "usd")}</span>
            </text>
          </Show>
        </Show>

        <Show when={result().inputTokens !== undefined || result().outputTokens !== undefined}>
          <text>
            <span fg="#888">Input:  </span>
            <span fg={props.color}>
              {isLoading() ? "…" : (result().inputTokens ?? 0).toLocaleString()}
            </span>
          </text>
          <Show when={rates().inputTokens !== undefined}>
            <text fg="#666">{"  "}{fmtRate(rates().inputTokens, "tok")}</text>
          </Show>
          <text>
            <span fg="#888">Output: </span>
            <span fg={props.color}>
              {isLoading() ? "…" : (result().outputTokens ?? 0).toLocaleString()}
            </span>
          </text>
          <Show when={rates().outputTokens !== undefined}>
            <text fg="#666">{"  "}{fmtRate(rates().outputTokens, "tok")}</text>
          </Show>
        </Show>

        <Show when={result().creditsUsed !== undefined}>
          <text>
            <span fg="#888">Used:      </span>
            <span fg={props.color}>
              {isLoading() ? "…" : `$${Number(result().creditsUsed ?? 0).toFixed(4)}`}
            </span>
          </text>
          <Show when={rates().creditsUsed !== undefined}>
            <text>
              <span fg="#888">Rate:        </span>
              <span fg="#666">{fmtRate(rates().creditsUsed, "usd")}</span>
            </text>
          </Show>
          <Show when={result().creditsRemaining !== undefined}>
            <text>
              <span fg="#888">Remaining: </span>
              <span fg={props.color}>
                {isLoading() ? "…" : `$${Number(result().creditsRemaining ?? 0).toFixed(4)}`}
              </span>
            </text>
          </Show>
        </Show>

        <Show when={props.state.status === "idle"}>
          <text fg="#555">Waiting…</text>
        </Show>
      </Show>

      <Show when={lastUpdated()}>
        <text fg="#444">{lastUpdated()}</text>
      </Show>
    </box>
  )
}

export default ProviderCard
