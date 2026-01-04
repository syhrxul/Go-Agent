package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"Agent/utils"
)

func KillHandler(w http.ResponseWriter, r *http.Request) {
	// Pastikan hanya method POST yang diterima
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Ambil PID dari query parameter (contoh: /kill?pid=1234)
	pidStr := r.URL.Query().Get("pid")
	if pidStr == "" {
		http.Error(w, "PID is required", http.StatusBadRequest)
		return
	}

	pid, err := strconv.Atoi(pidStr)
	if err != nil {
		http.Error(w, "Invalid PID", http.StatusBadRequest)
		return
	}

	// Lakukan Kill Process
	err = utils.KillProcess(pid)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to kill process: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf("Process %d killed successfully", pid)))
}
