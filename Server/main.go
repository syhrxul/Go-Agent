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
	http.HandleFunc("/stats", handlers.StatsHandler)          // SSE (Lama)
	http.HandleFunc("/stats-json", handlers.StatsOnceHandler) // JSON (Baru)

	// --- Endpoint Processes ---
	// Pastikan handler ini mendukung CORS juga jika dipanggil dari React Native
	http.HandleFunc("/processes", enableCors(handlers.ListProcessesHandler))
	http.HandleFunc("/kill", enableCors(handlers.KillProcessHandler))

	// --- Endpoint Power Control (Baru) ---
	// Menggunakan enableCors agar bisa diakses dari aplikasi HP
	http.HandleFunc("/api/action/restart", enableCors(handlers.RestartSystem))
	http.HandleFunc("/api/action/sleep", enableCors(handlers.SleepSystem))
	http.HandleFunc("/api/action/shutdown", enableCors(handlers.ShutdownSystem))

	log.Println("Mac Monitor Agent running on :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}

// --- FUNGSI MIDDLEWARE CORS (YANG HILANG) ---
// Fungsi ini menambahkan header agar aplikasi React Native diizinkan mengakses server
func enableCors(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Izinkan semua origin (*) atau spesifik IP HP Anda
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Jika request adalah preflight (OPTIONS), langsung return OK
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		// Lanjutkan ke handler asli
		next(w, r)
	}
}
