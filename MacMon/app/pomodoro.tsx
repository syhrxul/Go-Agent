import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// IMPORT CONTEXT
import { usePomodoro } from '@/context/PomodoroContext';

export default function PomodoroScreen() {
  const { 
      focusDuration, breakDuration, longBreakDuration, cycles, 
      updateSettings, timeLeft, isActive, toggleTimer, resetTimer,
      isBreak, isLongBreak, completedCycles 
  } = usePomodoro();

  const [focus, setFocus] = useState(focusDuration.toString());
  const [shrt, setShrt] = useState(breakDuration.toString());
  const [lng, setLng] = useState(longBreakDuration.toString());
  const [cyc, setCyc] = useState(cycles.toString());

  useEffect(() => {
    setFocus(focusDuration.toString());
    setShrt(breakDuration.toString());
    setLng(longBreakDuration.toString());
    setCyc(cycles.toString());
  }, [focusDuration, breakDuration, longBreakDuration, cycles]);

  const handleSave = () => {
    updateSettings(
        parseInt(focus) || 25, 
        parseInt(shrt) || 5, 
        parseInt(lng) || 15, 
        parseInt(cyc) || 4 
    );
    router.back();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  let statusText = "FOKUS";
  let statusColor = "#333";
  if (isBreak) {
      if (isLongBreak) {
          statusText = "ISTIRAHAT PANJANG";
          statusColor = "#45B7D1";
      } else {
          statusText = "ISTIRAHAT PENDEK";
          statusColor = "#4ECDC4";
      }
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Timer Control', headerStyle: { backgroundColor: '#FF6B6B' }, headerTintColor: '#fff' }} />
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* TIMER PREVIEW BESAR */}
        <View style={styles.timerPreview}>
            <View style={{flexDirection:'row', alignItems:'center', marginBottom: 5}}>
                <View style={[styles.badge, {backgroundColor: statusColor}]}>
                    <Text style={styles.badgeText}>{statusText}</Text>
                </View>
                <View style={[styles.badge, {backgroundColor: '#FF9500', marginLeft: 10}]}>
                    <Text style={styles.badgeText}>LAP {completedCycles + 1}</Text>
                </View>
            </View>

            <Text style={styles.bigTimer}>{formatTime(timeLeft)}</Text>
            
            <View style={{flexDirection: 'row', gap: 15, marginTop: 10, alignItems: 'center'}}>
                {/* Reset */}
                <TouchableOpacity style={styles.controlBtn} onPress={resetTimer}>
                    <FontAwesome name="refresh" size={24} color="#666" />
                </TouchableOpacity>

                {/* Play/Pause */}
                <TouchableOpacity style={[styles.controlBtn, {width: 70, height: 70, borderRadius: 35, backgroundColor: '#FF6B6B'}]} onPress={toggleTimer}>
                    <FontAwesome name={isActive ? "pause" : "play"} size={30} color="white" />
                </TouchableOpacity>

                {/* UPDATE: Tombol Fullscreen */}
                <TouchableOpacity style={styles.controlBtn} onPress={() => router.push('/pomodoro-fullscreen')}>
                    <FontAwesome name="expand" size={24} color="#666" />
                </TouchableOpacity>
            </View>
        </View>

        {/* FORM SETTINGS */}
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Durasi (Menit)</Text>
            <InputRow label="Waktu Fokus" value={focus} onChange={setFocus} icon="fire" color="#FF6B6B" />
            <View style={styles.divider} />
            <InputRow label="Istirahat Pendek" value={shrt} onChange={setShrt} icon="coffee" color="#4ECDC4" />
            <View style={styles.divider} />
            <InputRow label="Istirahat Panjang" value={lng} onChange={setLng} icon="bed" color="#45B7D1" />
        </View>

        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Target</Text>
            <InputRow label="Jumlah Laps (Siklus)" value={cyc} onChange={setCyc} icon="refresh" color="#FF9500" />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>SIMPAN PENGATURAN</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function InputRow({ label, value, onChange, icon, color }: any) {
    return (
        <View style={styles.row}>
            <View style={{flexDirection:'row', alignItems:'center', flex:1}}>
                <FontAwesome name={icon} size={18} color={color} style={{width: 30}} />
                <Text style={styles.label}>{label}</Text>
            </View>
            <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="numeric" />
        </View>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContent: { padding: 20 },
  timerPreview: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  bigTimer: { fontSize: 60, fontWeight: 'bold', color: '#333' },
  controlBtn: { width: 50, height: 50, backgroundColor: 'white', borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  card: { backgroundColor: 'white', borderRadius: 15, padding: 15, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#aaa', marginBottom: 15, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  label: { fontSize: 16, color: '#333', fontWeight: '500' },
  input: { backgroundColor: '#f0f0f0', width: 60, height: 40, borderRadius: 10, textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  saveButton: { backgroundColor: '#FF6B6B', padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 }
});