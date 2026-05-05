import type { Component } from "solid-js"
import { Show } from "solid-js"
import type { ProviderState } from "../rates"

interface Props {
  name: string
  color: string
  state: ProviderState
}

/** Formats a USD spend rate as "$0.0012 / hr". */
function formatSpendRate(dollarsPerHour: number | undefined): string {
  if (dollarsPerHour === undefined) return ""
  return `$${dollarsPerHour.toFixed(4)} / hr`
}

/** Formats a token rate as "1.2k tok / hr" or "800 tok / hr". */
function formatTokenRate(tokensPerHour: number | undefined): string {
  if (tokensPerHour === undefined) return ""
  const count = Math.abs(tokensPerHour)
  const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count.toFixed(0)
  return `${formatted} tok / hr`
}

/** Formats a USD value as "$12.3456". Coerces strings since some APIs return spend as a string. */
function formatDollars(value: number | undefined): string {
  return `$${(value ?? 0).toFixed(4)}`
}

const ProviderCard: Component<Props> = (props) => {
  const isLoading = () => props.state.status === "loading"
  const isError = () => props.state.status === "error"
  const isUnconfigured = () => props.state.status === "unconfigured"
  const result = () => props.state.result
  const rates = () => props.state.rates

  const formattedLastUpdated = () => {
    const lastUpdated = props.state.lastUpdated
    if (!lastUpdated) return ""
    return lastUpdated.toLocaleTimeString()
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
            <span fg={props.color}>{isLoading() ? "…" : formatDollars(result().spend)}</span>
          </text>
          <Show when={rates().spend !== undefined}>
            <text>
              <span fg="#888">Rate:        </span>
              <span fg="#666">{formatSpendRate(rates().spend)}</span>
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
            <text fg="#666">{"  "}{formatTokenRate(rates().inputTokens)}</text>
          </Show>
          <text>
            <span fg="#888">Output: </span>
            <span fg={props.color}>
              {isLoading() ? "…" : (result().outputTokens ?? 0).toLocaleString()}
            </span>
          </text>
          <Show when={rates().outputTokens !== undefined}>
            <text fg="#666">{"  "}{formatTokenRate(rates().outputTokens)}</text>
          </Show>
        </Show>

        <Show when={result().creditsUsed !== undefined}>
          <text>
            <span fg="#888">Used:      </span>
            <span fg={props.color}>{isLoading() ? "…" : formatDollars(result().creditsUsed)}</span>
          </text>
          <Show when={rates().creditsUsed !== undefined}>
            <text>
              <span fg="#888">Rate:        </span>
              <span fg="#666">{formatSpendRate(rates().creditsUsed)}</span>
            </text>
          </Show>
          <Show when={result().creditsRemaining !== undefined}>
            <text>
              <span fg="#888">Remaining: </span>
              <span fg={props.color}>{isLoading() ? "…" : formatDollars(result().creditsRemaining)}</span>
            </text>
          </Show>
        </Show>

        <Show when={props.state.status === "idle"}>
          <text fg="#555">Waiting…</text>
        </Show>
      </Show>

      <Show when={formattedLastUpdated()}>
        <text fg="#444">{formattedLastUpdated()}</text>
      </Show>
    </box>
  )
}

export default ProviderCard
