package utils

import (
	"os/exec"
	"strconv"
	"strings"
)

type MediaState struct {
	Player   string  `json:"player"` // "Spotify" atau "Music"
	State    string  `json:"state"`  // "playing", "paused", "stopped"
	Title    string  `json:"title"`
	Artist   string  `json:"artist"`
	Position float64 `json:"position"` // Posisi sekarang (detik)
	Duration float64 `json:"duration"` // Total durasi (detik)
}

func GetMediaInfo() MediaState {
	// Script ini mengecek Spotify dulu, kalau tidak ada baru cek Music
	script := `
	tell application "System Events"
		set spotifyRunning to (name of processes) contains "Spotify"
		set musicRunning to (name of processes) contains "Music"
	end tell

	if spotifyRunning then
		tell application "Spotify"
			if player state is playing or player state is paused then
				set trkName to name of current track
				set trkArtist to artist of current track
				set trkDur to duration of current track -- Spotify dalam MS
				set trkPos to player position -- Spotify dalam Detik
				set pState to player state
				return "Spotify|" & pState & "|" & trkName & "|" & trkArtist & "|" & trkPos & "|" & (trkDur / 1000)
			end if
		end tell
	end if

	if musicRunning then
		tell application "Music"
			if player state is playing or player state is paused then
				set trkName to name of current track
				set trkArtist to artist of current track
				set trkDur to duration of current track -- Music dalam Detik
				set trkPos to player position
				set pState to player state
				return "Music|" & pState & "|" & trkName & "|" & trkArtist & "|" & trkPos & "|" & trkDur
			end if
		end tell
	end if

	return "Stopped|stopped|No Music|-|-|0|0"
	`

	cmd := exec.Command("/usr/bin/osascript", "-e", script)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return MediaState{State: "stopped", Title: "Not Running"}
	}

	// Parse Output: "Player|State|Title|Artist|Pos|Dur"
	parts := strings.Split(strings.TrimSpace(string(output)), "|")
	if len(parts) < 6 {
		return MediaState{State: "stopped", Title: "No Media"}
	}

	pos, _ := strconv.ParseFloat(parts[4], 64)
	dur, _ := strconv.ParseFloat(parts[5], 64)

	return MediaState{
		Player:   parts[0],
		State:    parts[1], // "playing" atau "paused"
		Title:    parts[2],
		Artist:   parts[3],
		Position: pos,
		Duration: dur,
	}
}
