package utils

func init() {
	// Start the background collector
	go StartPowerMetricsLoop()
}

func GetPowerMetrics() PowerMetrics {
	// Return the latest available metrics from the background collector
	return GetLatestPowerMetrics()
}
