package utils

import (
	"os/exec"
	"strconv"
	"strings"
)

func GetDiskUsage() float64 {
	out, err := exec.Command("sh", "-c",
		`df / | awk 'NR==2 {print $5}'`,
	).Output()
	if err != nil {
		return 0
	}

	s := strings.TrimSpace(string(out))
	s = strings.TrimSuffix(s, "%")

	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0
	}

	return v
}
