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
	RxSpeedStr string
	TxSpeedStr string
	RxTotalStr string
	TxTotalStr string
}

var (
	lastRx    uint64
	lastTx    uint64
	lastCheck time.Time
	netMutex  sync.Mutex
)

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

	return fmt.Sprintf("%.2f %cB", float64(bytes)/float64(div), "KMGTPE"[exp])
}

func GetNetworkStats() NetworkStats {
	netMutex.Lock()
	defer netMutex.Unlock()

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

	if !lastCheck.IsZero() {
		duration := now.Sub(lastCheck).Seconds()
		if duration > 0 {
			diffRx := currentRx - lastRx
			diffTx := currentTx - lastTx

			rxSpeed := float64(diffRx) / duration
			txSpeed := float64(diffTx) / duration

			rxSpeedStr = formatBytes(uint64(rxSpeed)) + "/s"
			txSpeedStr = formatBytes(uint64(txSpeed)) + "/s"
		}
	}

	lastRx = currentRx
	lastTx = currentTx
	lastCheck = now

	return NetworkStats{
		RxSpeedStr: rxSpeedStr,
		TxSpeedStr: txSpeedStr,
		RxTotalStr: formatBytes(currentRx),
		TxTotalStr: formatBytes(currentTx),
	}
}
