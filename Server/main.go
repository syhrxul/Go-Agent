package main

import (
	"log"
	"net/http"

	"Agent/handlers"
	"Agent/utils"
)

func main() {
	utils.StartMetricsCollector()

	http.HandleFunc("/stats", handlers.StatsHandler)
	http.HandleFunc("/processes", handlers.ListProcessesHandler)
	http.HandleFunc("/kill", handlers.KillProcessHandler)

	log.Println("Mac Monitor Agent running on :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}
