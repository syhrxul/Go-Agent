package main

import (
	"log"
	"net/http"

	"Agent/handlers"
	"Agent/utils"
)

func main() {
	utils.StartMetricsCollector()

	// 1. Endpoint Stats (SSE - Realtime 1 detik)
	http.HandleFunc("/stats", handlers.StatsHandler)

	// 2. Endpoint Processes (JSON Biasa - Request on demand)
	http.HandleFunc("/processes", handlers.ListProcessesHandler)

	// 3. Endpoint Action (Kill)
	http.HandleFunc("/kill", handlers.KillProcessHandler)

	log.Println("Mac Monitor Agent running on :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}
