package utils

import (
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
