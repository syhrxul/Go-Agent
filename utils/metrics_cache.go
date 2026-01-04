package utils

import (
	"sync"
	"time"
)

var (
	cache     PowerMetrics
	lastRead  time.Time
	cacheLock sync.Mutex
)

func GetPowerMetrics() PowerMetrics {
	cacheLock.Lock()
	defer cacheLock.Unlock()

	if time.Since(lastRead) > 1*time.Millisecond {
		cache = readPowerMetrics()
		lastRead = time.Now()
	}
	return cache
}
