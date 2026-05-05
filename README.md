# live-spend

A terminal UI for monitoring AI API spend and token usage in real time — across OpenAI, Anthropic, and OpenRouter.

![Terminal UI showing three provider cards with spend, token counts, and hourly burn rates](https://raw.githubusercontent.com/ericdahl-dev/live-spend/master/docs/screenshot.png)

## Features

- **Live polling** — fetches usage data every 30 seconds from all configured providers
- **Hourly burn rate** — shows `spend / hours elapsed today` so you know your pace at a glance
- **Multi-provider** — OpenAI (cost), Anthropic (tokens), OpenRouter (credits)
- **Graceful degradation** — unconfigured providers show a clear "no API key set" state
- **Keyboard shortcuts** — `r` to refresh manually, `q` to quit

## Requirements

- [Bun](https://bun.sh) v1.0+
- API keys for the providers you want to monitor (see below)

## Setup

```bash
git clone https://github.com/ericdahl-dev/live-spend
cd live-spend
bun install
cp .env.example .env
```

Edit `.env` and fill in your keys:

```env
OPENAI_ADMIN_KEY=sk-admin-...
ANTHROPIC_ADMIN_KEY=sk-ant-admin-...
OPENROUTER_API_KEY=sk-or-...
```

> [!NOTE]
> OpenAI and Anthropic require **admin keys**, not regular inference keys. You can leave any key blank — that provider's card will show "no API key set" and be skipped during polling.

## Usage

```bash
bun run dev     # watch mode (hot reload)
bun run start   # run once
bun test        # run test suite
```

## Provider API Keys

| Provider | Key type | Where to get it |
|----------|----------|-----------------|
| OpenAI | Admin key (`sk-admin-...`) | [platform.openai.com](https://platform.openai.com) → Organization → API keys |
| Anthropic | Admin key (`sk-ant-admin-...`) | [console.anthropic.com](https://console.anthropic.com) → Settings → Admin API keys |
| OpenRouter | Standard key (`sk-or-...`) | [openrouter.ai](https://openrouter.ai) → Keys |

## Architecture

```
src/
├── index.tsx              # Entry point, polling loop, keyboard handling
├── store.ts               # Solid signals, rate calculation
├── RateTracker.ts         # Sliding-window rate tracker (reserved for future use)
├── components/
│   └── ProviderCard.tsx   # Per-provider display card
└── providers/
    ├── types.ts           # Shared ProviderResult interface
    ├── openai.ts          # Fetches /v1/organization/costs
    ├── anthropic.ts       # Fetches /v1/organizations/usage_report/messages
    └── openrouter.ts      # Fetches /api/v1/auth/key
```

Built with [OpenTUI](https://github.com/anomalyco/opentui) (SolidJS reconciler) on [Bun](https://bun.sh).
