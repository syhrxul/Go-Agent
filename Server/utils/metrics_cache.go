package utils

import (
	"sync"
	"time"
)

var (
	cache     PowerMetrics
	cacheLock sync.Mutex
)

func StartMetricsCollector() {
	go func() {
		for {

			data := readPowerMetrics()

			cacheLock.Lock()
			cache = data
			cacheLock.Unlock()
			time.Sleep(100 * time.Millisecond)
		}
	}()
}

func GetPowerMetrics() PowerMetrics {
	cacheLock.Lock()
	defer cacheLock.Unlock()
	return cache
}
