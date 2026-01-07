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
	// Menjalankan powermetrics (Membutuhkan akses SUDO/ROOT saat menjalankan server)
	out, _ := exec.Command("sudo", "powermetrics",
		"--samplers", "cpu_power,gpu_power,thermal",
		"-n", "1",
		"-i", "1000", // Sampel selama 1 detik
	).Output()

	s := string(out)

	// Ambil data penggunaan CPU (Efficiency & Performance Clusters)
	e := extractFloat(`E-Cluster HW active residency:\s+([0-9.]+)%`, s)
	p := extractFloat(`P-Cluster HW active residency:\s+([0-9.]+)%`, s)

	// Ambil data penggunaan GPU
	gpu := extractFloat(`GPU HW active residency:\s+([0-9.]+)%`, s)

	// PERBAIKAN DI SINI:
	// 1. Coba ambil suhu asli (CPU die temperature)
	temp := extractFloat(`CPU die temperature:\s+([0-9.]+)`, s)

	// 2. Jika gagal (hasil 0), gunakan logika lama (baca status "Nominal") sebagai cadangan
	if temp == 0 {
		temp = mapThermalFallback(s)
	}

	return PowerMetrics{
		CPU:  calcCPUAverage(e, p),
		GPU:  gpu,
		Temp: temp,
	}
}

// Fungsi helper untuk mengambil angka float dari string menggunakan Regex
func extractFloat(pattern, src string) float64 {
	re := regexp.MustCompile(pattern)
	m := re.FindStringSubmatch(src)
	if len(m) < 2 {
		return 0
	}
	v, _ := strconv.ParseFloat(m[1], 64)
	return v
}

// Fallback: Jika angka suhu tidak ditemukan, tebak berdasarkan status termal
func mapThermalFallback(s string) float64 {
	switch {
	case strings.Contains(s, "Critical"):
		return 95
	case strings.Contains(s, "Heavy"):
		return 80
	case strings.Contains(s, "Moderate"):
		return 60
	case strings.Contains(s, "Nominal"):
		return 35 // Ini penyebab kenapa sebelumnya selalu 35
	default:
		return 0
	}
}
