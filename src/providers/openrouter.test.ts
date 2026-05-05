import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test"
import { fetchOpenRouter } from "./openrouter"

describe("fetchOpenRouter", () => {
  let fetchSpy: ReturnType<typeof spyOn>

  beforeEach(() => {
    fetchSpy = spyOn(globalThis, "fetch")
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it("returns creditsUsed and creditsRemaining from key info", async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            usage: 1.25,
            limit: 10.0,
            limit_remaining: 8.75,
          },
        }),
        { status: 200 }
      )
    )
    const result = await fetchOpenRouter("test-key")
    expect(result.creditsUsed).toBeCloseTo(1.25)
    expect(result.creditsRemaining).toBeCloseTo(8.75)
    expect(result.error).toBeUndefined()
  })

  it("returns creditsUsed with null limit_remaining", async () => {
    fetchSpy.mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            usage: 0.5,
            limit: null,
            limit_remaining: null,
          },
        }),
        { status: 200 }
      )
    )
    const result = await fetchOpenRouter("test-key")
    expect(result.creditsUsed).toBeCloseTo(0.5)
    expect(result.creditsRemaining).toBeUndefined()
    expect(result.error).toBeUndefined()
  })

  it("returns error string on non-200", async () => {
    fetchSpy.mockResolvedValue(
      new Response("Unauthorized", { status: 401 })
    )
    const result = await fetchOpenRouter("bad-key")
    expect(result.error).toMatch(/401/)
    expect(result.creditsUsed).toBeUndefined()
  })
})
