package main

import (
	"flag"
	"fmt"
	"os"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/ericdahl-dev/live-spend/internal/config"
	"github.com/ericdahl-dev/live-spend/internal/tui"
)

func main() {
	cfgPath := flag.String("config", "", "path to config.yaml (default: built-in)")
	filePath := flag.String("file", "", "JSONL file to read events from")
	flag.Parse()

	cfg := mustLoadConfig(*cfgPath)
	mode, path, opts := detectMode(*filePath)

	m := tui.New(cfg, mode, path)
	p := tea.NewProgram(m, opts...)
	if _, err := p.Run(); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}
}

func mustLoadConfig(path string) *config.Config {
	if path == "" {
		return config.Default()
	}
	cfg, err := config.Load(path)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error loading config: %v\n", err)
		os.Exit(1)
	}
	return cfg
}

func detectMode(filePath string) (tui.Mode, string, []tea.ProgramOption) {
	opts := []tea.ProgramOption{tea.WithAltScreen()}

	if filePath != "" {
		return tui.ModeFile, filePath, opts
	}

	stat, err := os.Stdin.Stat()
	if err == nil && (stat.Mode()&os.ModeCharDevice) == 0 {
		// stdin is a pipe — read events from it; use /dev/tty for keys
		if tty, err := os.Open("/dev/tty"); err == nil {
			opts = append(opts, tea.WithInput(tty))
		}
		return tui.ModeStdin, "", opts
	}

	return tui.ModeDemo, "", opts
}
