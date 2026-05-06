import { describe, it, expect, beforeEach, afterEach, vi, type MockInstance } from "vitest"
import { fetchOpenAI } from "./openai"

describe("fetchOpenAI", () => {
  let fetchSpy: MockInstance<typeof fetch>

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, "fetch")
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it("returns summed spend from today's bucket", async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              results: [
                { amount: { value: 0.04, currency: "usd" } },
                { amount: { value: 0.02, currency: "usd" } },
              ],
            },
          ],
        }),
        { status: 200 }
      )
    )
    const result = await fetchOpenAI("test-key")
    expect(result.spend).toBeCloseTo(0.06)
    expect(result.error).toBeUndefined()
  })

  it("returns 0 spend when bucket is empty", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 })
    )
    const result = await fetchOpenAI("test-key")
    expect(result.spend).toBe(0)
    expect(result.error).toBeUndefined()
  })

  it("returns error string on non-200", async () => {
    fetchSpy.mockResolvedValue(
      new Response("Unauthorized", { status: 401 })
    )
    const result = await fetchOpenAI("bad-key")
    expect(result.error).toMatch(/401/)
    expect(result.spend).toBeUndefined()
  })
})
