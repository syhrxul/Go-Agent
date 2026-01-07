package utils

import (
	"os"
	"os/exec"
	"sort"
	"strconv"
	"strings"
)

type Process struct {
	PID      int     `json:"pid"`
	Name     string  `json:"name"`
	CPU      float64 `json:"cpu"`
	RAM      float64 `json:"ram"`
	Category string  `json:"category"`
}

var systemProcesses = map[string]bool{
	"kernel_task": true, "launchd": true, "WindowServer": true,
	"logd": true, "mds": true, "mds_stores": true, "notifyd": true,
	"fseventsd": true, "syslogd": true, "distnoted": true,
	"nsurlsessiond": true, "trustd": true, "kextd": true,
	"cfprefsd": true, "coreaudiod": true, "bluetoothd": true,
	"wifid": true, "ControlCenter": true, "Dock": true, "Finder": true,
	"Spotlight": true, "SystemUIServer": true, "hidd": true,
	"loginwindow": true, "UserEventAgent": true,
}

func GetTopProcesses(limit int) []Process {
	cmd := exec.Command("ps", "-Aceo", "pid,pcpu,pmem,comm", "-r")
	out, err := cmd.Output()
	if err != nil {
		return []Process{}
	}

	lines := strings.Split(string(out), "\n")
	var processes []Process

	for i := 1; i < len(lines); i++ {
		if len(processes) >= limit {
			break
		}

		fields := strings.Fields(lines[i])
		if len(fields) < 4 {
			continue
		}

		pid, _ := strconv.Atoi(fields[0])
		cpu, _ := strconv.ParseFloat(fields[1], 64)
		ram, _ := strconv.ParseFloat(fields[2], 64)
		name := strings.Join(fields[3:], " ")

		category := "User"

		if systemProcesses[name] ||
			strings.Contains(name, "Helper") ||
			strings.Contains(name, "Service") ||
			strings.Contains(name, "Agent") ||
			strings.Contains(name, "Daemon") {
			category = "System"
		}

		processes = append(processes, Process{
			PID:      pid,
			Name:     name,
			CPU:      cpu,
			RAM:      ram,
			Category: category,
		})
	}
	sort.SliceStable(processes, func(i, j int) bool {
		if processes[i].Category == "System" && processes[j].Category == "User" {
			return true
		}
		if processes[i].Category == "User" && processes[j].Category == "System" {
			return false
		}
		return processes[i].CPU > processes[j].CPU
	})

	return processes
}

func KillProcess(pid int) error {
	proc, err := os.FindProcess(pid)
	if err != nil {
		return err
	}
	return proc.Kill()
}
