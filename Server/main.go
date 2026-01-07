package main

import (
	"Agent/handlers"
	"Agent/utils"
	"log"
	"net/http"
)

func main() {
	utils.StartMetricsCollector()

	// --- Monitoring ---
	http.HandleFunc("/stats", handlers.StatsHandler)
	http.HandleFunc("/stats-json", handlers.StatsOnceHandler)

	// --- Processes ---
	http.HandleFunc("/processes", enableCors(handlers.ListProcessesHandler))
	http.HandleFunc("/kill", enableCors(handlers.KillProcessHandler))

	// --- Power Control ---
	http.HandleFunc("/api/action/restart", enableCors(handlers.RestartSystem))
	http.HandleFunc("/api/action/sleep", enableCors(handlers.SleepSystem))
	http.HandleFunc("/api/action/shutdown", enableCors(handlers.ShutdownSystem))

	// --- Control (Volume, Brightness, dll) ---
	// Pastikan handler HandleControl sudah Anda buat sebelumnya di handlers/control.go
	// Jika belum, gunakan kode dari diskusi sebelumnya.
	http.HandleFunc("/api/control", enableCors(handlers.HandleControl))

	// --- MEDIA INFO (BARU) ---
	http.HandleFunc("/api/media/info", enableCors(handlers.MediaInfoHandler))

	log.Println("Mac Monitor Agent running on :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}

func enableCors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}
