interface Sample {
  value: number
  timestamp: Date
}

export class RateTracker {
  private samples: Sample[] = []

  record(value: number, timestamp: Date = new Date()): void {
    this.samples.push({ value, timestamp })
  }

  rate(windowMs: number): number | undefined {
    const now = this.samples.at(-1)?.timestamp
    if (!now) return undefined

    const cutoff = new Date(now.getTime() - windowMs)
    const inWindow = this.samples.filter(s => s.timestamp >= cutoff)

    if (inWindow.length < 2) return undefined

    const first = inWindow[0]!
    const last = inWindow.at(-1)!
    const deltaMs = last.timestamp.getTime() - first.timestamp.getTime()
    if (deltaMs === 0) return 0

    const deltaValue = last.value - first.value
    return deltaValue * (windowMs / deltaMs)
  }
}
