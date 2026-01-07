package utils

import (
	"fmt"
	"os/exec"
)

// Helper: jalankan osascript dengan full path
func runOsa(script string) error {
	cmd := exec.Command("/usr/bin/osascript", "-e", script)
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("❌ GAGAL: %s\nOutput: %s\n", script, string(output))
		return fmt.Errorf("osascript error: %s", string(output))
	}
	return nil
}

/* =====================
   🔊 VOLUME CONTROL
===================== */

func ControlVolume(action string, value int) error {
	var script string

	switch action {
	case "up":
		script = "set volume output volume ((output volume of (get volume settings)) + 10)"
	case "down":
		script = "set volume output volume ((output volume of (get volume settings)) - 10)"
	case "mute":
		script = "set volume output muted not (output muted of (get volume settings))"
	case "set":
		script = fmt.Sprintf("set volume output volume %d", value)
	}

	return runOsa(script)
}

/* =====================
   ☀️ BRIGHTNESS CONTROL
===================== */

func ControlBrightness(action string) error {
	keyCode := 145 // brightness down
	if action == "up" {
		keyCode = 144
	}

	script := fmt.Sprintf(`
		tell application "System Events"
			repeat 3 times
				key code %d
			end repeat
		end tell
	`, keyCode)

	return runOsa(script)
}

/* =====================
   🚀 OPEN APPLICATION
===================== */

func OpenApp(appName string) error {
	cmd := exec.Command("/usr/bin/open", "-a", appName)
	return cmd.Run()
}

/* =====================
   🎵 MEDIA KEY CONTROL (FIXED)
===================== */

func SendMediaKey(key string) error {
	var keyCode int

	switch key {
	case "playpause":
		keyCode = 20
	case "next":
		keyCode = 19
	case "prev":
		keyCode = 18
	default:
		return nil
	}

	// NSEvent media key (INI YANG BENAR)
	script := fmt.Sprintf(`
		tell application "System Events"
			key down (key code %d)
			delay 0.05
			key up (key code %d)
		end tell
	`, keyCode, keyCode)

	return runOsa(script)
}
