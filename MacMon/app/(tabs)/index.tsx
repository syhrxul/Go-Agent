import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Text, View } from '@/components/Themed'; // Menggunakan komponen tema bawaan
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function TabOneScreen() {
  // --- STATE UNTUK JAM ---
  const [date, setDate] = useState(new Date());

  // --- STATE UNTUK POMODORO ---
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoTime, setPomoTime] = useState(25 * 60); // 25 Menit dalam detik

  // Effect untuk Jam Realtime
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Effect untuk Pomodoro Timer (Sederhana)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (pomoActive && pomoTime > 0) {
      interval = setInterval(() => {
        setPomoTime((prev) => prev - 1);
      }, 1000);
    } else if (pomoTime === 0) {
      setPomoActive(false);
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoTime]);

  const formatTime = (time: number) => {
    const m = Math.floor(time / 60);
    const s = time % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  // --- RENDER UTAMA ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 1. HEADER & JAM */}
        <View style={styles.headerSection}>
          <Text style={styles.greetingText}>Halo, Arul 👋</Text>
          <Text style={styles.clockText}>
            {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.dateText}>
            {date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* 2. GRID DASHBOARD */}
        <View style={styles.gridContainer}>
          
          {/* WIDGET POMODORO */}
          <View style={[styles.card, styles.cardPomodoro]}>
            <View style={styles.cardHeader}>
              <FontAwesome name="hourglass-half" size={16} color="white" />
              <Text style={styles.cardTitleWhite}>Focus Timer</Text>
            </View>
            <Text style={styles.pomoTimerText}>{formatTime(pomoTime)}</Text>
            <TouchableOpacity 
              style={styles.pomoButton} 
              onPress={() => setPomoActive(!pomoActive)}
            >
              <Text style={styles.pomoButtonText}>
                {pomoActive ? "PAUSE" : "START FOCUS"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* WIDGET KEUANGAN */}
          <View style={[styles.card, styles.cardFinance]}>
            <View style={styles.cardHeader}>
              <FontAwesome name="credit-card" size={16} color="#333" />
              <Text style={styles.cardTitleDark}>Keuangan</Text>
            </View>
            <View style={{marginTop: 10}}>
              <Text style={styles.financeLabel}>Sisa Saldo</Text>
              <Text style={styles.financeValue}>Rp 2.500.000</Text>
            </View>
            <View style={{marginTop: 10}}>
              <Text style={styles.financeLabel}>Pengeluaran Hari Ini</Text>
              <Text style={[styles.financeValue, {color: '#FF3B30', fontSize: 14}]}>- Rp 45.000</Text>
            </View>
          </View>

        </View>

        {/* 3. WIDGET REMINDER / TASKS */}
        <View style={[styles.card, styles.cardFull]}>
          <View style={styles.cardHeaderRow}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <FontAwesome name="check-square-o" size={18} color="#007AFF" />
              <Text style={[styles.cardTitleDark, {marginLeft: 8}]}>Reminder & Tugas</Text>
            </View>
            <TouchableOpacity>
              <Text style={{color:'#007AFF', fontSize:12, fontWeight:'bold'}}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {/* List Dummy Tugas */}
          <TaskItem title="Meeting dengan Dosen" time="10:00 AM" completed={true} />
          <TaskItem title="Bayar Tagihan Internet" time="13:00 PM" completed={false} />
          <TaskItem title="Mengerjakan Tugas React Native" time="19:00 PM" completed={false} />
          <TaskItem title="Jogging Sore" time="16:30 PM" completed={false} />
        </View>

        {/* 4. SHORTCUTS / LAIN-LAIN */}
        <Text style={styles.sectionTitle}>Pintasan Cepat</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 10, paddingBottom: 20}}>
          <ShortcutButton icon="sticky-note" label="Catatan" color="#FF9500" />
          <ShortcutButton icon="calendar" label="Kalender" color="#FF2D55" />
          <ShortcutButton icon="cloud" label="Cuaca" color="#5AC8FA" />
          <ShortcutButton icon="cog" label="Settings" color="#8E8E93" />
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTS ---

function TaskItem({ title, time, completed }: { title: string, time: string, completed: boolean }) {
  return (
    <View style={styles.taskRow}>
      <FontAwesome 
        name={completed ? "check-circle" : "circle-o"} 
        size={20} 
        color={completed ? "#34C759" : "#ccc"} 
      />
      <View style={{marginLeft: 12, flex: 1}}>
        <Text style={[styles.taskTitle, completed && {textDecorationLine: 'line-through', color: '#aaa'}]}>
          {title}
        </Text>
        <Text style={styles.taskTime}>{time}</Text>
      </View>
    </View>
  );
}

function ShortcutButton({ icon, label, color }: any) {
  return (
    <TouchableOpacity style={styles.shortcutBtn}>
      <View style={[styles.shortcutIconBox, {backgroundColor: color}]}>
        <FontAwesome name={icon} size={20} color="white" />
      </View>
      <Text style={styles.shortcutLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Latar belakang abu-abu terang
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  
  // Header
  headerSection: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  clockText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Pomodoro Widget
  cardPomodoro: {
    width: '48%',
    backgroundColor: '#FF6B6B', // Merah Soft
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 160,
  },
  cardTitleWhite: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
  pomoTimerText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  pomoButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  pomoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Finance Widget
  cardFinance: {
    width: '48%',
    backgroundColor: 'white',
    height: 160,
  },
  cardTitleDark: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 5,
  },
  financeLabel: {
    fontSize: 10,
    color: '#888',
  },
  financeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },

  // Common Card Header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  // Reminder / Task List
  cardFull: {
    width: '100%',
    backgroundColor: 'white',
    marginBottom: 25,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  taskTime: {
    fontSize: 10,
    color: '#999',
  },

  // Shortcuts
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  shortcutBtn: {
    alignItems: 'center',
    marginRight: 20,
  },
  shortcutIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  shortcutLabel: {
    fontSize: 12,
    color: '#666',
  },
});