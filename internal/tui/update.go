package tui

import (
	"time"

	"github.com/charmbracelet/bubbletea"
	"github.com/ericdahl-dev/live-spend/internal/demo"
	"github.com/ericdahl-dev/live-spend/internal/event"
)

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

	case tea.KeyMsg:
		switch msg.String() {
		case "q", "ctrl+c":
			m.quitting = true
			return m, tea.Quit
		case "r":
			now := time.Now()
			for _, ts := range m.towers {
				ts.requests.Reset(now)
				ts.inputTPM.Reset(now)
				ts.outputTPM.Reset(now)
				if ts.spendDay != nil {
					ts.spendDay.Reset(now)
				}
			}
			m.events = nil
		}

	case tickMsg:
		now := msg.t
		for _, ts := range m.towers {
			ts.requests.Tick(now)
			ts.inputTPM.Tick(now)
			ts.outputTPM.Tick(now)
			if ts.spendDay != nil {
				ts.spendDay.Tick(now)
			}
		}
		return m, tickCmd()

	case demo.EventMsg:
		m = m.applyEvent(event.Event(msg))
		return m, demo.NextEvent()

	case eventMsg:
		m = m.applyEvent(event.Event(msg))
		if m.eventCh != nil {
			return m, readEventCmd(m.eventCh)
		}
	}

	return m, nil
}

func (m Model) applyEvent(e event.Event) Model {
	key := modelKey{provider: e.Provider, model: e.Model}
	if ts, ok := m.towers[key]; ok {
		ts.requests.Drain(e.Requests)
		ts.inputTPM.Drain(e.InputTokens)
		ts.outputTPM.Drain(e.OutputTokens)
		if ts.spendDay != nil && e.CostUSD > 0 {
			ts.spendDay.Drain(e.CostUSD)
		}
	}
	m.events = append([]event.Event{e}, m.events...)
	if len(m.events) > maxRecentEvents {
		m.events = m.events[:maxRecentEvents]
	}
	return m
}
