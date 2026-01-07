import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { router, Stack } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// IMPORT CONTEXT
import { usePomodoro } from '@/context/PomodoroContext';

// Palet Warna
const Colors = {
  background: '#F2F4F8',     // Tetap Abu-abu muda
  surface: '#FFFFFF',
  primary: '#6366F1',        // Indigo
  success: '#10B981',        // Emerald
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
};

export default function PomodoroFullscreenScreen() {
  const { 
    timeLeft, isActive, toggleTimer, resetTimer, 
    isBreak, isLongBreak, completedCycles 
  } = usePomodoro();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  // Logic Warna Dinamis (Hanya Text & Button yang berubah)
  const themeColor = isBreak ? Colors.success : Colors.primary;
  const statusText = isBreak ? (isLongBreak ? "LONG BREAK" : "SHORT BREAK") : "FOCUS TIME";
  const bgBadge = isBreak ? '#DCFCE7' : '#E0E7FF';

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />
      
      {/* Header Minimize */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <MaterialIcons name="close-fullscreen" size={20} color={Colors.textSecondary} />
          <Text style={styles.closeText}>Minimize</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        
        {/* Status Badge Modern */}
        <View style={[styles.statusBadge, { backgroundColor: bgBadge }]}>
           <View style={[styles.dot, { backgroundColor: themeColor }]} />
           <Text style={[styles.statusText, { color: themeColor }]}>{statusText}</Text>
        </View>

        {/* Lap Indicator */}
        <Text style={styles.lapText}>CYCLE {completedCycles + 1}</Text>
        
        {/* Timer Besar (Colored Text) */}
        <Text style={[styles.timerText, { color: themeColor }]}>{formatTime(timeLeft)}</Text>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Reset Button */}
          <TouchableOpacity style={styles.sideBtn} onPress={resetTimer}>
            <MaterialIcons name="refresh" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Main Button (Filled Color) */}
          <TouchableOpacity 
            style={[styles.mainButton, { backgroundColor: themeColor }]} 
            onPress={toggleTimer}
          >
            <MaterialIcons name={isActive ? "pause" : "play-arrow"} size={48} color="white" />
          </TouchableOpacity>

          {/* Dummy Button (Balance) */}
          <View style={[styles.sideBtn, { opacity: 0 }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  header: { 
      paddingHorizontal: 24, 
      paddingVertical: 10, 
      alignItems: 'flex-end',
  },
  closeButton: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      backgroundColor: Colors.surface,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
      gap: 6
  },
  closeText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  
  content: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      marginTop: -40 // Visual adjustment
  },
  
  // Status Badge
  statusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 24,
    marginBottom: 16,
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontWeight: '800', letterSpacing: 1, fontSize: 13 },
  
  lapText: { 
      color: Colors.textSecondary, 
      fontSize: 14, 
      fontWeight: '600',
      letterSpacing: 2,
      marginBottom: 30,
      textTransform: 'uppercase'
  },
  
  // Timer Font
  timerText: { 
    fontSize: 110, // Sangat Besar
    fontFamily: 'SpaceMono-Regular',
    letterSpacing: -5,
    marginBottom: 60,
  },

  controls: { flexDirection: 'row', alignItems: 'center', gap: 40 },
  
  mainButton: { 
    width: 110, height: 110, 
    borderRadius: 55, 
    justifyContent: 'center', alignItems: 'center', 
    shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: {width:0, height:10}, elevation: 10,
  },
  
  sideBtn: { 
    width: 60, height: 60, 
    borderRadius: 30, 
    backgroundColor: Colors.surface, 
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  }
});