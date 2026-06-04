package tui

import (
	"os"
	"sort"
	"time"

	"github.com/charmbracelet/bubbletea"
	"github.com/ericdahl-dev/live-spend/internal/bucket"
	"github.com/ericdahl-dev/live-spend/internal/config"
	"github.com/ericdahl-dev/live-spend/internal/demo"
	"github.com/ericdahl-dev/live-spend/internal/event"
)

const maxRecentEvents = 12

// Mode controls the event source.
type Mode int

const (
	ModeDemo Mode = iota
	ModeStdin
	ModeFile
)

type modelKey struct {
	provider string
	model    string
}

type towerState struct {
	key       modelKey
	requests  *bucket.Bucket
	inputTPM  *bucket.Bucket
	outputTPM *bucket.Bucket
	spendDay  *bucket.Bucket // nil when not configured
}

type tickMsg struct{ t time.Time }
type eventMsg event.Event

// Model is the Bubble Tea application model.
type Model struct {
	cfg      *config.Config
	towers   map[modelKey]*towerState
	order    []modelKey
	events   []event.Event
	mode     Mode
	eventCh  <-chan event.Event
	width    int
	height   int
	quitting bool
}

// New initialises the model from config, mode, and optional file path.
func New(cfg *config.Config, mode Mode, filePath string) Model {
	m := Model{
		cfg:    cfg,
		towers: make(map[modelKey]*towerState),
		mode:   mode,
		width:  80,
		height: 24,
	}

	for pName, pc := range cfg.Providers {
		for mName, limits := range pc.Models {
			key := modelKey{provider: pName, model: mName}
			ts := &towerState{
				key:       key,
				requests:  bucket.New(limits.RequestsPerMinute),
				inputTPM:  bucket.New(limits.InputTokensPerMinute),
				outputTPM: bucket.New(limits.OutputTokensPerMinute),
			}
			if limits.DailySpendUSD > 0 {
				ts.spendDay = bucket.New(limits.DailySpendUSD)
			}
			m.towers[key] = ts
			m.order = append(m.order, key)
		}
	}

	sort.Slice(m.order, func(i, j int) bool {
		a, b := m.order[i], m.order[j]
		if a.provider != b.provider {
			return a.provider < b.provider
		}
		return a.model < b.model
	})

	switch mode {
	case ModeStdin:
		m.eventCh = startReader(os.Stdin)
	case ModeFile:
		if filePath != "" {
			if f, err := os.Open(filePath); err == nil {
				m.eventCh = startReader(f)
			}
		}
	}

	return m
}

func (m Model) Init() tea.Cmd {
	cmds := []tea.Cmd{tickCmd()}
	switch m.mode {
	case ModeDemo:
		cmds = append(cmds, demo.NextEvent())
	default:
		if m.eventCh != nil {
			cmds = append(cmds, readEventCmd(m.eventCh))
		}
	}
	return tea.Batch(cmds...)
}
