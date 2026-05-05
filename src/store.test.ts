import { describe, it, expect } from "bun:test"
import { calcRates, hoursElapsedToday } from "./rates"

describe("hoursElapsedToday", () => {
  it("returns 0 at midnight UTC", () => {
    expect(hoursElapsedToday(new Date("2026-05-05T00:00:00Z"))).toBe(0)
  })

  it("returns 6 at 6am UTC", () => {
    expect(hoursElapsedToday(new Date("2026-05-05T06:00:00Z"))).toBe(6)
  })

  it("returns 12 at noon UTC", () => {
    expect(hoursElapsedToday(new Date("2026-05-05T12:00:00Z"))).toBe(12)
  })
})

describe("calcRates", () => {
  it("divides spend by hours elapsed", () => {
    const now = new Date("2026-05-05T06:00:00Z") // 6 hours in
    const rates = calcRates({ spend: 12 }, now)
    expect(rates.spend).toBeCloseTo(2) // $2/hr
  })

  it("divides tokens by hours elapsed", () => {
    const now = new Date("2026-05-05T04:00:00Z") // 4 hours in
    const rates = calcRates({ inputTokens: 8000, outputTokens: 4000 }, now)
    expect(rates.inputTokens).toBeCloseTo(2000)
    expect(rates.outputTokens).toBeCloseTo(1000)
  })

  it("divides creditsUsed by hours elapsed", () => {
    const now = new Date("2026-05-05T03:00:00Z")
    const rates = calcRates({ creditsUsed: 3 }, now)
    expect(rates.creditsUsed).toBeCloseTo(1)
  })

  it("returns empty rates at midnight", () => {
    const now = new Date("2026-05-05T00:00:00Z")
    const rates = calcRates({ spend: 5 }, now)
    expect(rates.spend).toBeUndefined()
  })
})
