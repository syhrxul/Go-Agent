package utils

import (
	"bufio"
	"log"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"sync"
)

var (
	currentMetrics PowerMetrics
	metricsLock    sync.RWMutex
)

type PowerMetrics struct {
	CPU  float64
	GPU  float64
	Temp float64
}

func GetLatestPowerMetrics() PowerMetrics {
	metricsLock.RLock()
	defer metricsLock.RUnlock()
	return currentMetrics
}

func StartPowerMetricsLoop() {
	// Run powermetrics in streaming mode (default without -n)
	// -i 1000 sets sample interval to 1 second
	cmd := exec.Command("sudo", "powermetrics",
		"--samplers", "cpu_power,gpu_power,thermal",
		"-i", "1000")

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		log.Printf("Error creating stdout pipe for powermetrics: %v", err)
		return
	}

	if err := cmd.Start(); err != nil {
		log.Printf("Error starting powermetrics: %v", err)
		return
	}

	scanner := bufio.NewScanner(stdout)
	var buffer strings.Builder

	// The output consists of repeated blocks starting with "*** Sampled system activity"
	for scanner.Scan() {
		line := scanner.Text()
		if strings.Contains(line, "*** Sampled system activity") {
			// Process the previous block if it exists and contains data
			s := buffer.String()
			if strings.Contains(s, "E-Cluster HW active residency") {
				pm := parsePowerMetrics(s)
				metricsLock.Lock()
				currentMetrics = pm
				metricsLock.Unlock()
			}
			buffer.Reset()
		}
		buffer.WriteString(line + "\n")
	}

	if err := scanner.Err(); err != nil {
		log.Printf("powermetrics scanner error: %v", err)
	}

	if err := cmd.Wait(); err != nil {
		log.Printf("powermetrics exited with error: %v", err)
	}
}

func parsePowerMetrics(s string) PowerMetrics {
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
