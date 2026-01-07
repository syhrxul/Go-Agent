package handlers

import (
	"Agent/utils" // PERHATIKAN: Gunakan "Agent/utils", bukan "go-agent/utils"
	"encoding/json"
	"net/http"
)

type ControlRequest struct {
	Type   string `json:"type"`
	Action string `json:"action"`
	Value  int    `json:"value"`
	Name   string `json:"name"`
}

func HandleControl(w http.ResponseWriter, r *http.Request) {
	// CORS sudah ditangani di main.go via enableCors, tapi method check tetap perlu
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ControlRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var err error
	switch req.Type {
	case "volume":
		err = utils.ControlVolume(req.Action, req.Value)
	case "brightness":
		err = utils.ControlBrightness(req.Action)
	case "app":
		err = utils.OpenApp(req.Name)
	case "media":
		err = utils.SendMediaKey(req.Action)
	default:
		http.Error(w, "Unknown control type", http.StatusBadRequest)
		return
	}

	if err != nil {
		// Log error ke terminal server agar terlihat jika ada masalah script
		println("Error executing command:", err.Error())
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}
