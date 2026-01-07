package main

import (
	"Agent/handlers"
	"Agent/utils"
	"log"
	"net/http"
)

func main() {
	// Jalankan kolektor metrik di background
	utils.StartMetricsCollector()

	// --- Endpoint Monitoring ---
	http.HandleFunc("/stats", handlers.StatsHandler)
	http.HandleFunc("/stats-json", handlers.StatsOnceHandler)

	// --- Endpoint Processes ---
	http.HandleFunc("/processes", enableCors(handlers.ListProcessesHandler))
	http.HandleFunc("/kill", enableCors(handlers.KillProcessHandler))

	// --- Endpoint Power Control ---
	http.HandleFunc("/api/action/restart", enableCors(handlers.RestartSystem))
	http.HandleFunc("/api/action/sleep", enableCors(handlers.SleepSystem))
	http.HandleFunc("/api/action/shutdown", enableCors(handlers.ShutdownSystem))

	// --- PERBAIKAN DI SINI (Tambahkan enableCors) ---
	http.HandleFunc("/api/control", enableCors(handlers.HandleControl))

	log.Println("Mac Monitor Agent running on :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}

// Fungsi enableCors (Wajib ada di file main.go Anda)
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
