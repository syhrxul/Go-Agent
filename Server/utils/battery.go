package utils

import (
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

// BatteryInfo menampung data lengkap baterai
type BatteryInfo struct {
	Percent int
	Status  string // contoh: "discharging", "charging", "charged"
	Time    string // contoh: "2:15", "0:00", atau "Calculating..."
}

func GetBatteryInfo() BatteryInfo {
	out, _ := exec.Command("pmset", "-g", "batt").Output()
	output := string(out)

	// Regex untuk menangkap pola: "55%; discharging; 3:19 remaining"
	// Group 1: Angka (55)
	// Group 2: Status (discharging)
	// Group 3: Sisa text (3:19 remaining...)
	re := regexp.MustCompile(`(\d+)%;\s*([^;]+);\s*(.*)`)
	matches := re.FindStringSubmatch(output)

	// Default values jika regex gagal (misal tidak ada baterai)
	info := BatteryInfo{
		Percent: 0,
		Status:  "Unknown",
		Time:    "-",
	}

	if len(matches) >= 4 {
		// 1. Parse Persentase
		v, _ := strconv.Atoi(matches[1])
		info.Percent = v

		// 2. Parse Status
		info.Status = strings.TrimSpace(matches[2])

		// 3. Parse Waktu
		// matches[3] bisa berisi "3:15 remaining" atau "(no estimate)"
		remainingPart := strings.TrimSpace(matches[3])

		if strings.HasPrefix(remainingPart, "(no") {
			info.Time = "Calculating..."
		} else {
			// Ambil kata pertama saja, yaitu jamnya (misal "3:15")
			parts := strings.Fields(remainingPart)
			if len(parts) > 0 {
				info.Time = parts[0]
			}
		}
	} else {
		// Fallback simpel jika format beda, coba ambil persen saja seperti kode lama
		reSimple := regexp.MustCompile(`(\d+)%`)
		mSimple := reSimple.FindStringSubmatch(output)
		if len(mSimple) > 1 {
			v, _ := strconv.Atoi(mSimple[1])
			info.Percent = v
		}
	}

	return info
}

func GetBatteryPercent() int {
	return GetBatteryInfo().Percent
}
