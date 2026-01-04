package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"Agent/utils"
)

type Stats struct {
	TS            int64   `json:"ts"`
	CPU           float64 `json:"cpu"`
	RAM           float64 `json:"ram"`
	GPU           float64 `json:"gpu"`
	Disk          float64 `json:"disk"`
	Temp          float64 `json:"temp"`
	Battery       int     `json:"battery"`
	BatteryStatus string  `json:"battery_status"`
	BatteryTime   string  `json:"battery_time"`
	Uptime        string  `json:"uptime"`

	Network struct {
		RxSpeed string `json:"rx_speed"`
		TxSpeed string `json:"tx_speed"`
		RxTotal string `json:"rx_total"`
		TxTotal string `json:"tx_total"`
	} `json:"network"`

	// Field Processes DIHAPUS dari sini
}

func StatsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher := w.(http.Flusher)

	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			pm := utils.GetPowerMetrics()
			batt := utils.GetBatteryInfo()
			netStats := utils.GetNetworkStats()

			data := Stats{
				TS:            time.Now().UnixMilli(),
				CPU:           pm.CPU,
				GPU:           pm.GPU,
				Temp:          pm.Temp,
				Disk:          utils.GetDiskUsage(),
				RAM:           utils.GetRAMUsage(),
				Battery:       batt.Percent,
				BatteryStatus: batt.Status,
				BatteryTime:   batt.Time,
				Uptime:        utils.FormatDuration(utils.GetUptime()),
			}

			data.Network.RxSpeed = netStats.RxSpeedStr
			data.Network.TxSpeed = netStats.TxSpeedStr
			data.Network.RxTotal = netStats.RxTotalStr
			data.Network.TxTotal = netStats.TxTotalStr

			jsonData, _ := json.Marshal(data)
			w.Write([]byte("data: " + string(jsonData) + "\n\n"))
			flusher.Flush()

		case <-r.Context().Done():
			return
		}
	}
}
