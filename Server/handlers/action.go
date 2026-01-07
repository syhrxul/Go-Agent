package handlers

import (
	"fmt"
	"net/http"
	"os/exec"
	"strconv"

	"Agent/utils"
)

func KillHandler(w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

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

	err = utils.KillProcess(pid)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to kill process: %v", err), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf("Process %d killed successfully", pid)))
}

// RestartSystem: Me-restart Mac
func RestartSystem(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Menggunakan AppleScript agar aplikasi lain bisa menutup dengan aman
	cmd := exec.Command("osascript", "-e", `tell app "System Events" to restart`)
	err := cmd.Run()
	if err != nil {
		// Fallback ke command line jika AppleScript gagal (butuh sudo biasanya)
		// cmd = exec.Command("shutdown", "-r", "now")
		// err = cmd.Run()
		http.Error(w, fmt.Sprintf("Gagal restart: %v", err), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Restart initiated"))
}

// SleepSystem: Membuat Mac tidur
func SleepSystem(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 'pmset sleepnow' adalah perintah standar macOS untuk tidur instan tanpa sudo (biasanya)
	cmd := exec.Command("pmset", "sleepnow")
	err := cmd.Run()
	if err != nil {
		http.Error(w, fmt.Sprintf("Gagal sleep: %v", err), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Sleep initiated"))
}

// ShutdownSystem: Mematikan Mac
func ShutdownSystem(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Menggunakan AppleScript untuk shutdown aman
	cmd := exec.Command("osascript", "-e", `tell app "System Events" to shut down`)
	err := cmd.Run()
	if err != nil {
		http.Error(w, fmt.Sprintf("Gagal shutdown: %v", err), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Shutdown initiated"))
}
