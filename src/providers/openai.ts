import type { ProviderResult } from "../rates"

export async function fetchOpenAI(apiKey: string): Promise<ProviderResult> {
  const startOfDay = Math.floor(new Date().setUTCHours(0, 0, 0, 0) / 1000)

  const res = await fetch(
    `https://api.openai.com/v1/organization/costs?start_time=${startOfDay}&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  )

  if (!res.ok) {
    const text = await res.text()
    return { error: `${res.status}: ${text}` }
  }

  const json = (await res.json()) as {
    data: Array<{
      results: Array<{ amount: { value: number; currency: string } }>
    }>
  }

  const bucket = json.data[0]
  if (!bucket?.results?.length) return { spend: 0 }

  const spend = bucket.results.reduce((sum, r) => sum + (r.amount?.value ?? 0), 0)
  return { spend }
}
