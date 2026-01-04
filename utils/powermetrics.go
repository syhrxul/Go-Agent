package utils

import (
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

type PowerMetrics struct {
	CPU  float64
	GPU  float64
	Temp float64
}

func readPowerMetrics() PowerMetrics {
	out, _ := exec.Command("sudo", "powermetrics",
		"--samplers", "cpu_power,gpu_power,thermal",
		"-n", "1").Output()

	s := string(out)

	e := extractFloat(`E-Cluster HW active residency:\s+([0-9.]+)%`, s)
	p := extractFloat(`P-Cluster HW active residency:\s+([0-9.]+)%`, s)
	gpu := extractFloat(`GPU HW active residency:\s+([0-9.]+)%`, s)

	temp := mapThermal(s)

	return PowerMetrics{
		CPU:  calcCPUAverage(e, p),
		GPU:  gpu,
		Temp: temp,
	}
}

func extractFloat(pattern, src string) float64 {
	re := regexp.MustCompile(pattern)
	m := re.FindStringSubmatch(src)
	if len(m) < 2 {
		return 0
	}
	v, _ := strconv.ParseFloat(m[1], 64)
	return v
}

func mapThermal(s string) float64 {
	switch {
	case strings.Contains(s, "Nominal"):
		return 35
	case strings.Contains(s, "Moderate"):
		return 60
	case strings.Contains(s, "Heavy"):
		return 80
	case strings.Contains(s, "Critical"):
		return 95
	default:
		return 0
	}
}
