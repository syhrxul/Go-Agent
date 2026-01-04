package utils

import (
	"os/exec"
	"strconv"
	"strings"
)

func GetBatteryPercent() int {
	out, _ := exec.Command("sh", "-c",
		`pmset -g batt | grep -Eo "[0-9]+%" | tr -d '%'`,
	).Output()

	v, _ := strconv.Atoi(strings.TrimSpace(string(out)))
	return v
}
