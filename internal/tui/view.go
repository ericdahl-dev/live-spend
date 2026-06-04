package tui

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
	"github.com/ericdahl-dev/live-spend/internal/event"
)

const barWidth = 22

var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#FAFAFA"))

	providerStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#60A5FA"))

	healthyStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#22C55E"))

	warningStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#EAB308"))

	criticalStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#EF4444"))

	dimStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#6B7280"))

	barGreenStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("#22C55E"))
	barYellowStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("#EAB308"))
	barOrangeStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("#F97316"))
	barRedStyle    = lipgloss.NewStyle().Foreground(lipgloss.Color("#EF4444"))

	sectionStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("#D1D5DB"))
)

func (m Model) View() string {
	if m.quitting {
		return ""
	}

	width := m.width
	if width < 64 {
		width = 64
	}

	var sb strings.Builder
	sep := dimStyle.Render(strings.Repeat("━", width))

	// Title bar
	title := titleStyle.Render("⚡ LLM Tower")
	pad := (width - lipgloss.Width(title)) / 2
	if pad < 0 {
		pad = 0
	}
	sb.WriteString(strings.Repeat(" ", pad) + title + "\n")
	sb.WriteString(sep + "\n\n")

	// Tower panels
	for _, key := range m.order {
		ts := m.towers[key]
		sb.WriteString(renderHeader(ts, width) + "\n")
		sb.WriteString(dimStyle.Render(" "+strings.Repeat("─", width-2)) + "\n")
		sb.WriteString(renderMetric("Requests/min", ts.requests.Pct(), ts.requests.Current(), ts.requests.Capacity()) + "\n")
		sb.WriteString(renderMetric("Input TPM   ", ts.inputTPM.Pct(), ts.inputTPM.Current(), ts.inputTPM.Capacity()) + "\n")
		sb.WriteString(renderMetric("Output TPM  ", ts.outputTPM.Pct(), ts.outputTPM.Current(), ts.outputTPM.Capacity()) + "\n")
		if ts.spendDay != nil {
			sb.WriteString(renderMetric("Daily Spend ", ts.spendDay.Pct(), ts.spendDay.Current(), ts.spendDay.Capacity()) + "\n")
		}
		sb.WriteString("\n")
	}

	// Recent events
	sb.WriteString(sep + "\n")
	sb.WriteString(" " + sectionStyle.Render("Recent Events") + "\n")
	if len(m.events) == 0 {
		sb.WriteString(dimStyle.Render("  waiting for events...") + "\n")
	} else {
		for _, e := range m.events {
			sb.WriteString(renderEvent(e) + "\n")
		}
	}

	// Footer
	sb.WriteString(sep + "\n")
	modeStr := []string{"demo", "stdin", "file"}[m.mode]
	sb.WriteString(dimStyle.Render(fmt.Sprintf(" [q] quit  [r] reset  mode: %s", modeStr)) + "\n")

	return sb.String()
}

func renderHeader(ts *towerState, width int) string {
	name := providerStyle.Render(fmt.Sprintf(" %s / %s", ts.key.provider, ts.key.model))
	status, style := statusOf(ts)
	dot := style.Render("● " + status)

	nameW := lipgloss.Width(name)
	dotW := lipgloss.Width(dot)
	pad := width - nameW - dotW - 1
	if pad < 1 {
		pad = 1
	}
	return name + strings.Repeat(" ", pad) + dot
}

func renderMetric(label string, pct, current, capacity float64) string {
	bar := renderBar(pct)
	pctStr := fmt.Sprintf("%3.0f%%", pct)
	nums := dimStyle.Render(fmt.Sprintf("%s / %s", fmtNum(current), fmtNum(capacity)))
	return fmt.Sprintf("  %-12s  %s  %s  %s", label, bar, pctStr, nums)
}

func renderBar(pct float64) string {
	filled := int(pct / 100.0 * float64(barWidth))
	if filled > barWidth {
		filled = barWidth
	}
	if filled < 0 {
		filled = 0
	}
	empty := barWidth - filled
	return barColor(pct).Render(strings.Repeat("█", filled)) +
		dimStyle.Render(strings.Repeat("░", empty))
}

func barColor(pct float64) lipgloss.Style {
	switch {
	case pct >= 50:
		return barGreenStyle
	case pct >= 25:
		return barYellowStyle
	case pct >= 10:
		return barOrangeStyle
	default:
		return barRedStyle
	}
}

func statusOf(ts *towerState) (string, lipgloss.Style) {
	low := minPct(ts.requests.Pct(), ts.inputTPM.Pct(), ts.outputTPM.Pct())
	switch {
	case low < 10:
		return "critical", criticalStyle
	case low < 25:
		return "warning", warningStyle
	default:
		return "healthy", healthyStyle
	}
}

func minPct(a, b, c float64) float64 {
	m := a
	if b < m {
		m = b
	}
	if c < m {
		m = c
	}
	return m
}

func fmtNum(n float64) string {
	switch {
	case n >= 1_000_000:
		return fmt.Sprintf("%.1fM", n/1_000_000)
	case n >= 1_000:
		return fmt.Sprintf("%.0fK", n/1_000)
	default:
		return fmt.Sprintf("%.0f", n)
	}
}

func renderEvent(e event.Event) string {
	ts := e.Timestamp.Format("15:04:05")
	name := fmt.Sprintf("%s/%s", e.Provider, e.Model)
	if len(name) > 34 {
		name = name[:34]
	}
	line := fmt.Sprintf("  %s  %-36s ↑%-7s ↓%s",
		ts, name,
		fmtNum(e.InputTokens),
		fmtNum(e.OutputTokens),
	)
	if e.CostUSD > 0 {
		line += fmt.Sprintf("   $%.4f", e.CostUSD)
	}
	return dimStyle.Render(line)
}
