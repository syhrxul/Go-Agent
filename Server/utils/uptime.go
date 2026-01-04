package utils

import (
	"fmt"
	"os/exec"
	"strconv"
	"strings"
)

func GetUptime() int64 {
	out, _ := exec.Command("sh", "-c",
		`sysctl -n kern.boottime | awk '{print $4}' | tr -d ','`,
	).Output()

	boot, _ := strconv.ParseInt(strings.TrimSpace(string(out)), 10, 64)
	return nowUnix() - boot
}

func nowUnix() int64 {
	out, _ := exec.Command("date", "+%s").Output()
	v, _ := strconv.ParseInt(strings.TrimSpace(string(out)), 10, 64)
	return v
}

func FormatDuration(seconds int64) string {
	hours := seconds / 3600
	minutes := (seconds % 3600) / 60
	secs := seconds % 60

	return fmt.Sprintf("%02d:%02d:%02d", hours, minutes, secs)
}
