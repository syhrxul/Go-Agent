package main

import (
	"Agent/handlers"
	"Agent/utils"
	"log"
	"net/http"
)

func main() {
	utils.StartMetricsCollector()

	http.HandleFunc("/stats", handlers.StatsHandler)          // Endpoint SSE (Lama)
	http.HandleFunc("/stats-json", handlers.StatsOnceHandler) // Endpoint BARU (JSON)

	// ... endpoint lain ...
	http.HandleFunc("/processes", handlers.ListProcessesHandler)
	http.HandleFunc("/kill", handlers.KillProcessHandler)

	log.Println("Mac Monitor Agent running on :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}
