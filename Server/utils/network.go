package utils

import (
	"fmt"
	"os/exec"
	"strconv"
	"strings"
	"sync"
	"time"
)

type NetworkStats struct {
	RxSpeedStr string // Contoh: "1.5 MB/s"
	TxSpeedStr string // Contoh: "20 KB/s"
	RxTotalStr string // Contoh: "5.2 GB"
	TxTotalStr string // Contoh: "100 MB"
}

var (
	lastRx    uint64
	lastTx    uint64
	lastCheck time.Time
	netMutex  sync.Mutex
)

// Helper untuk mengubah bytes ke format KB/MB/GB
func formatBytes(bytes uint64) string {
	const unit = 1024
	if bytes < unit {
		return fmt.Sprintf("%d B", bytes)
	}
	div, exp := uint64(unit), 0
	for n := bytes / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	// %.2f artinya 2 angka di belakang koma
	return fmt.Sprintf("%.2f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

func GetNetworkStats() NetworkStats {
	netMutex.Lock()
	defer netMutex.Unlock()

	// Ambil data dari netstat (bytes in & bytes out)
	out, err := exec.Command("sh", "-c",
		`netstat -b -I en0 | awk 'NR==2 {print $7, $10}'`,
	).Output()

	if err != nil {
		return NetworkStats{"0 B/s", "0 B/s", "0 B", "0 B"}
	}

	parts := strings.Fields(string(out))
	if len(parts) < 2 {
		return NetworkStats{"0 B/s", "0 B/s", "0 B", "0 B"}
	}

	currentRx, _ := strconv.ParseUint(parts[0], 10, 64)
	currentTx, _ := strconv.ParseUint(parts[1], 10, 64)
	now := time.Now()

	rxSpeedStr := "0 B/s"
	txSpeedStr := "0 B/s"

	// Hitung kecepatan jika bukan pertama kali jalan
	if !lastCheck.IsZero() {
		duration := now.Sub(lastCheck).Seconds()
		if duration > 0 {
			diffRx := currentRx - lastRx
			diffTx := currentTx - lastTx

			// Hitung kecepatan (Bytes per second)
			rxSpeed := float64(diffRx) / duration
			txSpeed := float64(diffTx) / duration

			// Format kecepatan lalu tambahkan "/s"
			rxSpeedStr = formatBytes(uint64(rxSpeed)) + "/s"
			txSpeedStr = formatBytes(uint64(txSpeed)) + "/s"
		}
	}

	// Update state
	lastRx = currentRx
	lastTx = currentTx
	lastCheck = now

	return NetworkStats{
		RxSpeedStr: rxSpeedStr,
		TxSpeedStr: txSpeedStr,
		RxTotalStr: formatBytes(currentRx), // Total download terformat
		TxTotalStr: formatBytes(currentTx), // Total upload terformat
	}
}
