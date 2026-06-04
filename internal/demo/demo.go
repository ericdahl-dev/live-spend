package demo

import (
	"math/rand"
	"time"

	"github.com/ericdahl-dev/live-spend/internal/event"
	tea "github.com/charmbracelet/bubbletea"
)

// EventMsg wraps a demo-generated event as a Bubble Tea message.
type EventMsg event.Event

type entry struct {
	provider     string
	model        string
	avgInputTok  float64
	avgOutputTok float64
	costPer1kTok float64
}

var catalog = []entry{
	{"openai", "gpt-4.1-mini", 800, 300, 0.00015},
	{"openai", "gpt-4o", 2000, 800, 0.005},
	{"anthropic", "claude-3-5-sonnet-20241022", 1500, 600, 0.003},
	{"anthropic", "claude-3-haiku-20240307", 500, 200, 0.00025},
}

// NextEvent returns a Bubble Tea command that sleeps a random interval
// and then produces a DemoEventMsg.
func NextEvent() tea.Cmd {
	return func() tea.Msg {
		time.Sleep(time.Duration(100+rand.Intn(900)) * time.Millisecond)
		e := catalog[rand.Intn(len(catalog))]
		in := e.avgInputTok * (0.3 + rand.Float64()*1.4)
		out := e.avgOutputTok * (0.3 + rand.Float64()*1.4)
		cost := (in + out) / 1000.0 * e.costPer1kTok
		return EventMsg(event.Event{
			Provider:     e.provider,
			Model:        e.model,
			Requests:     1,
			InputTokens:  in,
			OutputTokens: out,
			CostUSD:      cost,
			Timestamp:    time.Now(),
		})
	}
}
