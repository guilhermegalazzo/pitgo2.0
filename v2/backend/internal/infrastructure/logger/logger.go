package logger

import (
	"os"
	"time"

	"github.com/rs/zerolog"
)

var Log zerolog.Logger

func Init(env string) {
	zerolog.TimeFieldFormat = time.RFC3339
	if env == "development" {
		Log = zerolog.New(zerolog.ConsoleWriter{Out: os.Stdout, TimeFormat: time.Kitchen}).
			With().Timestamp().Caller().Logger()
	} else {
		Log = zerolog.New(os.Stdout).With().Timestamp().Caller().Logger()
	}
}

func Info() *zerolog.Event  { return Log.Info() }
func Error() *zerolog.Event { return Log.Error() }
func Warn() *zerolog.Event  { return Log.Warn() }
func Debug() *zerolog.Event { return Log.Debug() }
func Fatal() *zerolog.Event { return Log.Fatal() }
