import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { router, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// IMPORT CONTEXT
import { usePomodoro } from '@/context/PomodoroContext';

const { width } = Dimensions.get('window');

export default function PomodoroFullscreenScreen() {
  const { 
    timeLeft, isActive, toggleTimer, resetTimer, 
    isBreak, isLongBreak, completedCycles 
  } = usePomodoro();

  // Helper Format Waktu
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  // Tentukan Warna Background Berdasarkan Status
  let backgroundColor = '#FF6B6B'; // Default Merah (Fokus)
  let statusText = "FOCUS TIME";
  
  if (isBreak) {
    if (isLongBreak) {
      backgroundColor = '#45B7D1'; // Biru (Long Break)
      statusText = "LONG BREAK";
    } else {
      backgroundColor = '#4ECDC4'; // Hijau Tosca (Short Break)
      statusText = "SHORT BREAK";
    }
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <StatusBar style="light" />
      
      {/* Tombol Close / Minimize */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <FontAwesome name="compress" size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.content}>
        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>

        <Text style={styles.lapText}>LAP {completedCycles + 1}</Text>
        
        {/* Timer Besar */}
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.mainButton} onPress={toggleTimer}>
            <FontAwesome name={isActive ? "pause" : "play"} size={40} color={backgroundColor} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
            <FontAwesome name="refresh" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'flex-end', paddingHorizontal: 20 },
  closeButton: { padding: 10, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 20 },
  
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: -50 },
  
  statusBadge: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 20,
    marginBottom: 10
  },
  statusText: { color: 'white', fontWeight: 'bold', letterSpacing: 1.5, fontSize: 16 },
  
  lapText: { color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 20, fontWeight: '600' },
  
  timerText: { 
    fontSize: 100, // Sangat Besar
    fontWeight: 'bold', 
    color: 'white', 
    fontVariant: ['tabular-nums'], // Agar angka tidak goyang saat berubah
    marginBottom: 50
  },

  controls: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  
  mainButton: { 
    width: 100, height: 100, 
    borderRadius: 50, 
    backgroundColor: 'white', 
    justifyContent: 'center', alignItems: 'center', 
    elevation: 10, shadowColor: 'black', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width:0, height:5}
  },
  
  resetButton: { 
    width: 60, height: 60, 
    borderRadius: 30, 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    justifyContent: 'center', alignItems: 'center' 
  }
});