package event

import (
	"encoding/json"
	"time"
)

// Event represents a single LLM API call.
type Event struct {
	Provider     string  `json:"provider"`
	Model        string  `json:"model"`
	Requests     float64 `json:"requests"`
	InputTokens  float64 `json:"input_tokens"`
	OutputTokens float64 `json:"output_tokens"`
	CostUSD      float64 `json:"cost_usd"`
	Timestamp    time.Time
}

// ParseLine parses a single JSON line into an Event.
func ParseLine(line string) (Event, error) {
	var e Event
	if err := json.Unmarshal([]byte(line), &e); err != nil {
		return Event{}, err
	}
	e.Timestamp = time.Now()
	return e, nil
}
