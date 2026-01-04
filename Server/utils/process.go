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
	CPU  float64 `json:"cpu"` // Persentase CPU
	RAM  float64 `json:"ram"` // Persentase RAM
}

// GetTopProcesses mengambil daftar proses teratas diurutkan berdasarkan CPU usage
func GetTopProcesses(limit int) []Process {
	// Command ps untuk macOS:
	// -A: Semua proses
	// -c: Nama command pendek (bukan full path)
	// -r: Urutkan berdasarkan CPU
	// -o: Output format (pid, %cpu, %mem, command name)
	cmd := exec.Command("ps", "-Aceo", "pid,pcpu,pmem,comm", "-r")
	out, err := cmd.Output()
	if err != nil {
		return []Process{}
	}

	lines := strings.Split(string(out), "\n")
	var processes []Process

	// Mulai dari index 1 untuk melewati header
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

		// Gabungkan sisa field sebagai nama (jika ada spasi, meski jarang dgn flag -c)
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

// KillProcess mematikan proses berdasarkan PID
func KillProcess(pid int) error {
	// Cara Go native untuk mengirim sinyal KILL (SIGKILL)
	proc, err := os.FindProcess(pid)
	if err != nil {
		return err
	}
	// Kill() mengirim SIGKILL (paksa berhenti)
	return proc.Kill()
}
