package utils

import (
	"os/exec"
	"strconv"
	"strings"
)

func GetRAMUsage() float64 {
	out, _ := exec.Command("sh", "-c", `
	vm_stat | awk '
	/Pages active/ {a=$3}
	/Pages wired/ {w=$4}
	/Pages compressed/ {c=$3}
	/Pages free/ {f=$3}
	END {
		used=(a+w+c)*4096
		total=(a+w+c+f)*4096
		printf "%.2f", (used/total)*100
	}'`).Output()

	v, _ := strconv.ParseFloat(strings.TrimSpace(string(out)), 64)
	return v
}
