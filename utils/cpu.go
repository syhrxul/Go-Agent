package utils

import "math"

func calcCPUAverage(eCluster, pCluster float64) float64 {
	// M1: 4 E-core + 4 P-core
	return math.Round(((eCluster*4+pCluster*4)/8)*100) / 100
}
