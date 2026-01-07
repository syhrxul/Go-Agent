import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// IMPORT CONTEXT
import { usePomodoro } from '@/context/PomodoroContext';

const { width } = Dimensions.get('window');

// Palet Warna (Sama dengan Dashboard)
const Colors = {
  background: '#F2F4F8',
  surface: '#FFFFFF',
  primary: '#6366F1',        // Indigo (Focus)
  success: '#10B981',        // Emerald (Break)
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  border: '#E2E8F0',
};

export default function PomodoroScreen() {
  const { 
      focusDuration, breakDuration, longBreakDuration, cycles, 
      updateSettings, timeLeft, isActive, toggleTimer, resetTimer,
      isBreak, isLongBreak, completedCycles 
  } = usePomodoro();

  // State Lokal
  const [focus, setFocus] = useState(focusDuration);
  const [shrt, setShrt] = useState(breakDuration);
  const [lng, setLng] = useState(longBreakDuration);
  const [cyc, setCyc] = useState(cycles);

  useEffect(() => {
    setFocus(focusDuration);
    setShrt(breakDuration);
    setLng(longBreakDuration);
    setCyc(cycles);
  }, [focusDuration, breakDuration, longBreakDuration, cycles]);

  const handleSave = () => {
    updateSettings(focus, shrt, lng, cyc);
    router.back();
  };

  // Helper Stepper
  const increment = (setter: any, val: number) => setter(val + 1);
  const decrement = (setter: any, val: number) => { if (val > 1) setter(val - 1); };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const activeColor = isBreak ? Colors.success : Colors.primary;
  const statusLabel = isBreak ? (isLongBreak ? "Long Break" : "Short Break") : "Focus Session";

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
           <MaterialIcons name="arrow-back-ios-new" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Timer Settings</Text>
        <View style={{width: 40}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* === TIMER PREVIEW CARD === */}
        <View style={styles.previewCard}>
            <View style={[styles.statusBadge, { backgroundColor: isBreak ? '#DCFCE7' : '#E0E7FF' }]}>
                <View style={[styles.dot, { backgroundColor: activeColor }]} />
                <Text style={[styles.statusText, { color: activeColor }]}>{statusLabel}</Text>
            </View>

            <Text style={[styles.bigTimer, { color: activeColor }]}>{formatTime(timeLeft)}</Text>
            
            <View style={styles.controlRow}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={resetTimer}>
                    <MaterialIcons name="refresh" size={24} color={Colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.playBtn, { backgroundColor: activeColor }]} 
                    onPress={toggleTimer}
                >
                    <MaterialIcons name={isActive ? "pause" : "play-arrow"} size={36} color="white" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/pomodoro-fullscreen')}>
                    <MaterialIcons name="fullscreen" size={28} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>
        </View>

        {/* === SETTINGS SECTION === */}
        <Text style={styles.sectionLabel}>Duration (Minutes)</Text>
        
        <View style={styles.settingsGroup}>
            <StepperRow label="Focus Time" value={focus} onInc={() => increment(setFocus, focus)} onDec={() => decrement(setFocus, focus)} color={Colors.primary} />
            <View style={styles.divider} />
            <StepperRow label="Short Break" value={shrt} onInc={() => increment(setShrt, shrt)} onDec={() => decrement(setShrt, shrt)} color={Colors.success} />
            <View style={styles.divider} />
            <StepperRow label="Long Break" value={lng} onInc={() => increment(setLng, lng)} onDec={() => decrement(setLng, lng)} color={Colors.success} />
        </View>

        <Text style={styles.sectionLabel}>Target</Text>
        <View style={styles.settingsGroup}>
             <StepperRow label="Cycles (Laps)" value={cyc} onInc={() => increment(setCyc, cyc)} onDec={() => decrement(setCyc, cyc)} color="#F59E0B" />
        </View>

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// Komponen Baris Stepper (+ Angka -)
function StepperRow({ label, value, onInc, onDec, color }: any) {
    return (
        <View style={styles.stepperRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                     <MaterialIcons name="timer" size={18} color={color} />
                </View>
                <Text style={styles.stepperLabel}>{label}</Text>
            </View>

            <View style={styles.stepperControls}>
                <TouchableOpacity style={styles.stepBtn} onPress={onDec}>
                    <MaterialIcons name="remove" size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{value}</Text>
                <TouchableOpacity style={styles.stepBtn} onPress={onInc}>
                    <MaterialIcons name="add" size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  backButton: { 
      width: 40, height: 40, borderRadius: 20, 
      backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center',
      borderWidth: 1, borderColor: Colors.border
  },

  scrollContent: { padding: 24, paddingBottom: 50 },

  // Timer Preview
  previewCard: {
      backgroundColor: Colors.surface,
      borderRadius: 32,
      padding: 30,
      alignItems: 'center',
      marginBottom: 30,
      shadowColor: "#64748B",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
  },
  statusBadge: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 12, paddingVertical: 6,
      borderRadius: 20, gap: 8, marginBottom: 10,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  
  bigTimer: {
      fontFamily: 'SpaceMono-Regular',
      fontSize: 56,
      letterSpacing: -2,
      marginBottom: 25,
  },
  controlRow: {
      flexDirection: 'row', alignItems: 'center', gap: 20,
  },
  playBtn: {
      width: 72, height: 72, borderRadius: 36,
      justifyContent: 'center', alignItems: 'center',
      shadowColor: "#6366F1", shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25, shadowRadius: 12, elevation: 8,
  },
  secondaryBtn: {
      width: 50, height: 50, borderRadius: 25,
      backgroundColor: '#F1F5F9',
      justifyContent: 'center', alignItems: 'center',
  },

  // Settings
  sectionLabel: { fontSize: 14, fontWeight: '700', color: Colors.textSecondary, marginBottom: 12, marginLeft: 5 },
  settingsGroup: {
      backgroundColor: Colors.surface,
      borderRadius: 24,
      padding: 20,
      marginBottom: 25,
      shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 2,
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 15 },
  
  // Stepper
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  stepperLabel: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  
  stepperControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 4 },
  stepBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  stepValue: { width: 40, textAlign: 'center', fontSize: 16, fontWeight: '700', fontFamily: 'SpaceMono-Regular', color: Colors.textPrimary },

  // Save Button
  saveButton: {
      backgroundColor: Colors.textPrimary, // Dark Theme for button
      paddingVertical: 18,
      borderRadius: 20,
      alignItems: 'center',
      shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5,
  },
  saveButtonText: { color: 'white', fontWeight: '700', fontSize: 16 },
});