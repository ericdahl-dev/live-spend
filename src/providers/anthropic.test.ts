import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from "vitest"
import { fetchAnthropic } from "./anthropic"

describe("fetchAnthropic", () => {
  let fetchSpy: MockInstance<typeof fetch>

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch")
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it("returns input and output tokens from today's usage", async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              usage: {
                input_tokens: 1000,
                output_tokens: 500,
                cache_creation_input_tokens: 0,
                cache_read_input_tokens: 0,
              },
            },
          ],
        }),
        { status: 200 }
      )
    )
    const result = await fetchAnthropic("test-key")
    expect(result.inputTokens).toBe(1000)
    expect(result.outputTokens).toBe(500)
    expect(result.error).toBeUndefined()
  })

  it("returns 0 tokens when data is empty", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 })
    )
    const result = await fetchAnthropic("test-key")
    expect(result.inputTokens).toBe(0)
    expect(result.outputTokens).toBe(0)
    expect(result.error).toBeUndefined()
  })

  it("returns error string on non-200", async () => {
    fetchSpy.mockResolvedValue(
      new Response("Forbidden", { status: 403 })
    )
    const result = await fetchAnthropic("bad-key")
    expect(result.error).toMatch(/403/)
    expect(result.inputTokens).toBeUndefined()
  })
})
