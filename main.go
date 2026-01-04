package main

import (
	"log"
	"net/http"

	"Agent/handlers"
)

func main() {
	http.HandleFunc("/stats", handlers.StatsHandler)

	log.Println("Mac Monitor Agent running on :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}
