package handlers

import (
	"Agent/utils"
	"encoding/json"
	"net/http"
)

func MediaInfoHandler(w http.ResponseWriter, r *http.Request) {
	// Ambil data terbaru dari Mac
	info := utils.GetMediaInfo()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(info)
}
