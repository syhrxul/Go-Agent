package utils

import (
	"os"
	"os/exec"
	"strconv"
	"strings"
)

type Process struct {
	PID  int     `json:"pid"`
	Name string  `json:"name"`
	CPU  float64 `json:"cpu"`
	RAM  float64 `json:"ram"`
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

		processes = append(processes, Process{
			PID:  pid,
			Name: name,
			CPU:  cpu,
			RAM:  ram,
		})
	}

	return processes
}

func KillProcess(pid int) error {
	proc, err := os.FindProcess(pid)
	if err != nil {
		return err
	}
	return proc.Kill()
}
