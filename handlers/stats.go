package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"Agent/utils"
)

type Stats struct {
	TS      int64   `json:"ts"`
	CPU     float64 `json:"cpu"`     // %
	RAM     float64 `json:"ram"`     // %
	GPU     float64 `json:"gpu"`     // %
	Disk    float64 `json:"disk"`    // %
	Temp    float64 `json:"temp"`    // °C
	Battery int     `json:"battery"` // %
	Uptime  int64   `json:"uptime"`  // seconds
}

func StatsHandler(w http.ResponseWriter, r *http.Request) {
	// SSE headers
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher := w.(http.Flusher)

	ticker := time.NewTicker(1 * time.Second) // hardcode 1 detik
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			pm := utils.GetPowerMetrics()

			data := Stats{
				TS:      time.Now().UnixMilli(),
				CPU:     pm.CPU,
				GPU:     pm.GPU,
				Temp:    pm.Temp,
				Disk:    utils.GetDiskUsage(),
				RAM:     utils.GetRAMUsage(),
				Battery: utils.GetBatteryPercent(),
				Uptime:  utils.GetUptime(),
			}

			jsonData, _ := json.Marshal(data)
			w.Write([]byte("data: " + string(jsonData) + "\n\n"))
			flusher.Flush()

		case <-r.Context().Done():
			return
		}
	}
}
