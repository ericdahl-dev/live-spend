import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test"
import { fetchJson } from "./fetchJson"

describe("fetchJson", () => {
  let fetchSpy: ReturnType<typeof spyOn>

  beforeEach(() => { fetchSpy = spyOn(globalThis, "fetch") })
  afterEach(() => { fetchSpy.mockRestore() })

  it("returns parsed JSON on success", async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify({ value: 42 }), { status: 200 }))
    const result = await fetchJson<{ value: number }>("https://example.com", {})
    expect(result).toEqual({ ok: true, data: { value: 42 } })
  })

  it("returns error string with status on non-200", async () => {
    fetchSpy.mockResolvedValue(new Response("Unauthorized", { status: 401 }))
    const result = await fetchJson("https://example.com", {})
    expect(result).toEqual({ ok: false, error: "401: Unauthorized" })
  })

  it("passes request options through to fetch", async () => {
    fetchSpy.mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }))
    await fetchJson("https://example.com", { headers: { Authorization: "Bearer tok" } })
    expect(fetchSpy).toHaveBeenCalledWith("https://example.com", {
      headers: { Authorization: "Bearer tok" },
    })
  })
})
