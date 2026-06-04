package bucket

import (
	"testing"
	"time"
)

func TestNewStartsFull(t *testing.T) {
	b := New(300)
	if b.Pct() != 100 {
		t.Fatalf("expected 100%%, got %.2f%%", b.Pct())
	}
}

func TestDrainReducesPct(t *testing.T) {
	b := New(100)
	b.Drain(50)
	if got := b.Pct(); got != 50 {
		t.Fatalf("expected 50%%, got %.2f%%", got)
	}
}

func TestDrainFloorIsZero(t *testing.T) {
	b := New(100)
	b.Drain(999)
	if got := b.Pct(); got != 0 {
		t.Fatalf("expected 0%%, got %.2f%%", got)
	}
}

func TestTickRefills(t *testing.T) {
	b := New(600) // 600/min = 10/sec
	b.Drain(60)   // drain 10%

	// Tick 6 seconds forward — should refill 60 units
	future := b.lastTick.Add(6 * time.Second)
	b.Tick(future)

	if b.Pct() != 100 {
		t.Fatalf("expected fully refilled (100%%), got %.2f%%", b.Pct())
	}
}

func TestTickCappsAtCapacity(t *testing.T) {
	b := New(100)
	// Already full; tick far into future
	b.Tick(b.lastTick.Add(10 * time.Minute))
	if b.Pct() != 100 {
		t.Fatalf("should not exceed 100%%, got %.2f%%", b.Pct())
	}
}

func TestReset(t *testing.T) {
	b := New(100)
	b.Drain(80)
	b.Reset(time.Now())
	if b.Pct() != 100 {
		t.Fatalf("expected 100%% after reset, got %.2f%%", b.Pct())
	}
}
