package utils

import (
	"fmt"
	"os/exec"
)

// Helper: Gunakan full path /usr/bin/osascript dan print output
func runOsa(script string) error {
	// Ganti "osascript" dengan "/usr/bin/osascript" agar lebih pasti
	cmd := exec.Command("/usr/bin/osascript", "-e", script)

	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("❌ GAGAL: %s\nOutput: %s\n", script, string(output))
		return fmt.Errorf("error: %s", string(output))
	}

	fmt.Printf("✅ SUKSES: %s\n", script)
	return nil
}

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

func ControlBrightness(action string) error {
	// Menggunakan key code 144 (tambah) dan 145 (kurang)
	keyCode := 145
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

func OpenApp(appName string) error {
	// Gunakan full path /usr/bin/open
	cmd := exec.Command("/usr/bin/open", "-a", appName)
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("❌ Gagal Buka App: %s\n", string(output))
		return err
	}
	return nil
}

func SendMediaKey(key string) error {
	var script string
	switch key {
	case "playpause":
		script = "tell application \"System Events\" to key code 100"
	case "next":
		script = "tell application \"System Events\" to key code 101"
	case "prev":
		script = "tell application \"System Events\" to key code 98"
	}

	if script != "" {
		return runOsa(script)
	}
	return nil
}
