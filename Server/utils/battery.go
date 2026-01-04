package utils

import (
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

type BatteryInfo struct {
	Percent int
	Status  string
	Time    string
}

func GetBatteryInfo() BatteryInfo {
	out, _ := exec.Command("pmset", "-g", "batt").Output()
	output := string(out)

	re := regexp.MustCompile(`(\d+)%;\s*([^;]+);\s*(.*)`)
	matches := re.FindStringSubmatch(output)

	info := BatteryInfo{
		Percent: 0,
		Status:  "Unknown",
		Time:    "-",
	}

	if len(matches) >= 4 {
		v, _ := strconv.Atoi(matches[1])
		info.Percent = v

		info.Status = strings.TrimSpace(matches[2])

		remainingPart := strings.TrimSpace(matches[3])

		if strings.HasPrefix(remainingPart, "(no") {
			info.Time = "Calculating..."
		} else {
			parts := strings.Fields(remainingPart)
			if len(parts) > 0 {
				info.Time = parts[0]
			}
		}
	} else {

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
