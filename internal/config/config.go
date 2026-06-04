package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

// ModelLimits defines rate limits for a single provider+model pair.
type ModelLimits struct {
	RequestsPerMinute     float64 `yaml:"requests_per_minute"`
	InputTokensPerMinute  float64 `yaml:"input_tokens_per_minute"`
	OutputTokensPerMinute float64 `yaml:"output_tokens_per_minute"`
	DailySpendUSD         float64 `yaml:"daily_spend_usd"`
}

// ProviderConfig holds model limits for one provider.
type ProviderConfig struct {
	Models map[string]ModelLimits `yaml:"models"`
}

// Config is the root configuration.
type Config struct {
	Providers map[string]ProviderConfig `yaml:"providers"`
}

// Load reads and parses a YAML config file.
func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var cfg Config
	return &cfg, yaml.Unmarshal(data, &cfg)
}

// Default returns a built-in config suitable for demo mode.
func Default() *Config {
	return &Config{
		Providers: map[string]ProviderConfig{
			"openai": {
				Models: map[string]ModelLimits{
					"gpt-4.1-mini": {
						RequestsPerMinute:     3000,
						InputTokensPerMinute:  200000,
						OutputTokensPerMinute: 50000,
					},
					"gpt-4o": {
						RequestsPerMinute:     500,
						InputTokensPerMinute:  150000,
						OutputTokensPerMinute: 150000,
					},
				},
			},
			"anthropic": {
				Models: map[string]ModelLimits{
					"claude-3-5-sonnet-20241022": {
						RequestsPerMinute:     1000,
						InputTokensPerMinute:  80000,
						OutputTokensPerMinute: 16000,
					},
					"claude-3-haiku-20240307": {
						RequestsPerMinute:     4000,
						InputTokensPerMinute:  200000,
						OutputTokensPerMinute: 50000,
					},
				},
			},
		},
	}
}
