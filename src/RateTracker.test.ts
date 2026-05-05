import { describe, it, expect } from "bun:test"
import { RateTracker } from "./RateTracker"

const WINDOW = 15 * 60 * 1000 // 15 min

describe("RateTracker", () => {
  it("returns undefined with fewer than 2 samples", () => {
    const t = new RateTracker()
    t.record(1.0, new Date(0))
    expect(t.rate(WINDOW)).toBeUndefined()
  })

  it("computes rate between two samples within window", () => {
    const t = new RateTracker()
    t.record(0.0, new Date(0))
    t.record(0.06, new Date(30_000)) // 30s later
    // 0.06 over 30s → 0.06 * (900s / 30s) = 1.8 per 15min
    expect(t.rate(WINDOW)).toBeCloseTo(1.8)
  })

  it("returns 0 if value unchanged", () => {
    const t = new RateTracker()
    t.record(5.0, new Date(0))
    t.record(5.0, new Date(60_000))
    expect(t.rate(WINDOW)).toBe(0)
  })

  it("prunes samples outside the window", () => {
    const t = new RateTracker()
    t.record(0.0, new Date(0))              // outside window
    t.record(1.0, new Date(WINDOW + 1))     // start of window
    t.record(2.0, new Date(WINDOW + 60_000)) // 1min later
    // only last two samples in window: delta=1.0 over 60s → 1.0 * (900/60) = 15
    expect(t.rate(WINDOW)).toBeCloseTo(15)
  })
})
