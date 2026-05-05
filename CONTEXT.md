# live-spend — Domain Context

## What this is

`live-spend` is a terminal UI (TUI) application that displays real-time AI API token usage and spend across multiple providers. It polls provider APIs on a configurable interval and renders live data in the terminal.

## Glossary

| Term | Definition |
|------|-----------|
| **Provider** | An AI API vendor (OpenAI, Anthropic, OpenRouter). Each has its own API shape and key type. |
| **ProviderResult** | The normalised data structure returned by a provider fetcher: `{ spend?, inputTokens?, outputTokens?, creditsUsed?, creditsRemaining?, error? }` |
| **ProviderState** | Reactive state for one provider: `{ result, status, lastUpdated? }`. Status is one of `idle`, `loading`, `ok`, `error`, `unconfigured`. |
| **Fetcher** | A pure async function that calls a provider's API and returns a `ProviderResult`. Lives in `src/providers/`. |
| **Poll cycle** | One round of calling all configured fetchers and updating the store. Triggered on mount and every 30s. |
| **Spend** | USD cost for the current day. Returned by OpenAI (`/v1/organization/costs`) and OpenRouter (`/api/v1/auth/key`). |
| **Tokens** | Raw input/output token counts. Returned by Anthropic (`/v1/organizations/usage_report/messages`). Anthropic standard keys don't expose cost directly. |
| **Credits** | OpenRouter's unit of account. `creditsUsed` + `creditsRemaining` map to the key's usage and limit. |
| **Admin key** | A privileged API key required by OpenAI and Anthropic usage endpoints. Not the same as a regular inference key. |

## Architecture

- **Runtime**: Bun + TypeScript
- **TUI framework**: OpenTUI (`@opentui/solid`) — SolidJS reconciler
- **Reactivity**: Solid signals in `src/store.ts`
- **Providers**: `src/providers/{openai,anthropic,openrouter}.ts` — each exports one fetcher fn
- **Entry**: `src/index.tsx` — mounts App, wires polling loop, handles keyboard
- **Tests**: `bun test` — fetchers tested with `spyOn(globalThis, "fetch")` mocks

## Provider API summary

| Provider | Endpoint | Key env var | Returns |
|----------|----------|-------------|---------|
| OpenAI | `GET /v1/organization/costs` | `OPENAI_ADMIN_KEY` | spend (USD) |
| Anthropic | `GET /v1/organizations/usage_report/messages` | `ANTHROPIC_ADMIN_KEY` | input/output tokens |
| OpenRouter | `GET /api/v1/auth/key` | `OPENROUTER_API_KEY` | creditsUsed, creditsRemaining |

## Constraints & decisions

- No persistence in MVP — all data is live/in-memory only
- Providers with no key set show "no API key set" and are skipped during polling
- `.toFixed()` calls must use `Number()` coercion — provider APIs may return spend as strings
