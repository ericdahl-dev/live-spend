package bucket

import (
	"sync"
	"time"
)

// Bucket is a token bucket that starts full, drains on events, and refills over time.
// A full bucket (Pct=100) means full capacity available; empty (Pct=0) means rate-limited.
type Bucket struct {
	capacity float64
	current  float64
	lastTick time.Time
	mu       sync.Mutex
}

func New(capacityPerMinute float64) *Bucket {
	return &Bucket{
		capacity: capacityPerMinute,
		current:  capacityPerMinute,
		lastTick: time.Now(),
	}
}

// Tick refills the bucket proportionally to elapsed time.
func (b *Bucket) Tick(now time.Time) {
	b.mu.Lock()
	defer b.mu.Unlock()
	elapsed := now.Sub(b.lastTick).Seconds()
	b.current += (b.capacity / 60.0) * elapsed
	if b.current > b.capacity {
		b.current = b.capacity
	}
	b.lastTick = now
}

// Drain decrements the bucket by amount.
func (b *Bucket) Drain(amount float64) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.current -= amount
	if b.current < 0 {
		b.current = 0
	}
}

// Pct returns remaining capacity as a percentage (0–100).
func (b *Bucket) Pct() float64 {
	b.mu.Lock()
	defer b.mu.Unlock()
	if b.capacity == 0 {
		return 100
	}
	return (b.current / b.capacity) * 100
}

// Current returns the current level.
func (b *Bucket) Current() float64 {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.current
}

// Capacity returns the configured maximum.
func (b *Bucket) Capacity() float64 {
	return b.capacity
}

// Reset fills the bucket to capacity.
func (b *Bucket) Reset(now time.Time) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.current = b.capacity
	b.lastTick = now
}
