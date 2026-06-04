package tui

import (
	"bufio"
	"io"
	"time"

	"github.com/charmbracelet/bubbletea"
	"github.com/ericdahl-dev/live-spend/internal/event"
)

func tickCmd() tea.Cmd {
	return tea.Tick(100*time.Millisecond, func(t time.Time) tea.Msg {
		return tickMsg{t: t}
	})
}

// startReader launches a goroutine that reads JSONL lines from r and
// sends parsed events to the returned channel.
func startReader(r io.Reader) <-chan event.Event {
	ch := make(chan event.Event, 100)
	go func() {
		defer close(ch)
		scanner := bufio.NewScanner(r)
		for scanner.Scan() {
			line := scanner.Text()
			if line == "" {
				continue
			}
			if e, err := event.ParseLine(line); err == nil {
				ch <- e
			}
		}
	}()
	return ch
}

// readEventCmd returns a Bubble Tea command that blocks until the next
// event arrives on ch.
func readEventCmd(ch <-chan event.Event) tea.Cmd {
	return func() tea.Msg {
		e, ok := <-ch
		if !ok {
			return nil
		}
		return eventMsg(e)
	}
}
