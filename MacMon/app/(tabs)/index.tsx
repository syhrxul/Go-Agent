import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// IMPORT HOOK CONTEXT
import { usePomodoro } from '@/context/PomodoroContext';
import { useFinance } from '@/context/FinanceContext'; // <--- IMPORT BARU

export default function TabOneScreen() {
  const [date, setDate] = useState(new Date());

  // 1. AMBIL DATA POMODORO
  const { timeLeft, isActive, toggleTimer, isBreak, isLongBreak } = usePomodoro();

  // 2. AMBIL DATA KEUANGAN (BARU)
  const { balance, todayExpense } = useFinance();

  // Effect untuk Jam Realtime
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper Format Waktu (mm:ss)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  // Helper Format Rupiah (BARU)
  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* HEADER & JAM */}
        <View style={styles.headerSection}>
          <Text style={styles.greetingText}>Halo, Alul 😸</Text>
          <Text style={styles.clockText}>
            {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.dateText}>
            {date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* GRID DASHBOARD */}
        <View style={styles.gridContainer}>
          
          {/* WIDGET POMODORO */}
          <TouchableOpacity 
            style={[
              styles.card, 
              styles.cardPomodoro, 
              isBreak ? { backgroundColor: isLongBreak ? '#45B7D1' : '#4ECDC4' } : {} 
            ]} 
            activeOpacity={0.9}
            onPress={() => router.push('/pomodoro-fullscreen')} 
          >
            <View style={styles.cardHeader}>
              <FontAwesome name={isBreak ? "coffee" : "fire"} size={16} color="white" />
              <View style={{flexDirection:'row', justifyContent:'space-between', flex:1, alignItems:'center'}}>
                  <Text style={styles.cardTitleWhite}>
                    {isBreak ? (isLongBreak ? "Long Break" : "Short Break") : "Focus Timer"}
                  </Text>
                  <FontAwesome name="expand" size={12} color="rgba(255,255,255,0.6)" /> 
              </View>
            </View>
            
            <Text style={styles.pomoTimerText}>{formatTime(timeLeft)}</Text>
            
            <TouchableOpacity 
              style={styles.pomoButton} 
              onPress={(e) => {
                e.stopPropagation(); 
                toggleTimer();       
              }}
            >
              <Text style={styles.pomoButtonText}>
                {isActive ? "PAUSE" : isBreak ? "START BREAK" : "START FOCUS"}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* WIDGET KEUANGAN (DATA ASLI) */}
          <TouchableOpacity 
            style={[styles.card, styles.cardFinance]}
            activeOpacity={0.9}
            onPress={() => router.push('/finance')} // <--- NAVIGASI KE KEUANGAN
          >
            <View style={styles.cardHeader}>
              <FontAwesome name="credit-card" size={16} color="#333" />
              <View style={{flexDirection:'row', justifyContent:'space-between', flex:1, alignItems:'center'}}>
                  <Text style={styles.cardTitleDark}>Keuangan</Text>
                  <FontAwesome name="chevron-right" size={12} color="#ccc" /> 
              </View>
            </View>
            
            <View style={{marginTop: 10}}>
              <Text style={styles.financeLabel}>Sisa Saldo</Text>
              <Text style={styles.financeValue} numberOfLines={1} adjustsFontSizeToFit>
                {formatRupiah(balance)}
              </Text>
            </View>
            
            <View style={{marginTop: 10}}>
              <Text style={styles.financeLabel}>Pengeluaran Hari Ini</Text>
              <Text style={[styles.financeValue, {color: '#FF3B30', fontSize: 14}]}>
                 {todayExpense === 0 ? 'Rp 0' : `- ${formatRupiah(todayExpense)}`}
              </Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* WIDGET REMINDER */}
        <View style={[styles.card, styles.cardFull]}>
          <View style={styles.cardHeaderRow}>
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <FontAwesome name="check-square-o" size={18} color="#007AFF" />
              <Text style={[styles.cardTitleDark, {marginLeft: 8}]}>Reminder & Tugas</Text>
            </View>
            <TouchableOpacity><Text style={{color:'#007AFF', fontSize:12, fontWeight:'bold'}}>Lihat Semua</Text></TouchableOpacity>
          </View>
          <TaskItem title="Meeting dengan Dosen" time="10:00 AM" completed={true} />
          <TaskItem title="Bayar Tagihan Internet" time="13:00 PM" completed={false} />
        </View>

        {/* SHORTCUT MENU */}
        <View style={{marginTop: 10}}>
            <Text style={styles.sectionTitle}>Pintasan Menu</Text>
            <View style={styles.shortcutGrid}>
                <ShortcutButton label="Set Pomodoro" icon="cog" color="#FF6B6B" onPress={() => router.push('/pomodoro')} />
                <ShortcutButton label="Keuangan" icon="money" color="#34C759" onPress={() => router.push('/finance')} />
                <ShortcutButton label="Statistik" icon="bar-chart" color="#5856D6" onPress={() => {}} />
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- SUB COMPONENTS ---

function TaskItem({ title, time, completed }: { title: string, time: string, completed: boolean }) {
  return (
    <View style={styles.taskRow}>
      <FontAwesome name={completed ? "check-circle" : "circle-o"} size={20} color={completed ? "#34C759" : "#ccc"} />
      <View style={{marginLeft: 12, flex: 1}}>
        <Text style={[styles.taskTitle, completed && {textDecorationLine: 'line-through', color: '#aaa'}]}>{title}</Text>
        <Text style={styles.taskTime}>{time}</Text>
      </View>
    </View>
  );
}

function ShortcutButton({ label, icon, color, onPress }: any) {
    return (
        <TouchableOpacity style={styles.shortcutBtn} onPress={onPress}>
            <View style={[styles.iconCircle, {backgroundColor: color}]}>
                <FontAwesome name={icon} size={20} color="white" />
            </View>
            <Text style={styles.shortcutText}>{label}</Text>
        </TouchableOpacity>
    )
}

// --- STYLES ---

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
  scrollContainer: { padding: 20, paddingBottom: 100 },
  headerSection: { marginBottom: 20 },
  greetingText: { fontSize: 16, color: '#666', marginBottom: 5 },
  clockText: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  dateText: { fontSize: 14, color: '#888', marginTop: 2 },
  
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  
  card: { borderRadius: 20, padding: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  
  cardPomodoro: { width: '48%', backgroundColor: '#FF6B6B', alignItems: 'center', justifyContent: 'space-between', height: 160 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5, width: '100%', borderBottomWidth: 0 },
  cardTitleWhite: { color: 'white', fontWeight: 'bold', fontSize: 12, marginLeft: 5 },
  pomoTimerText: { color: 'white', fontSize: 28, fontWeight: 'bold', marginVertical: 10 },
  pomoButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, width: '100%', alignItems: 'center' },
  pomoButtonText: { color: 'white', fontWeight: 'bold', fontSize: 12 },

  cardFinance: { width: '48%', backgroundColor: 'white', height: 160 },
  cardTitleDark: { color: '#333', fontWeight: 'bold', fontSize: 12, marginLeft: 5 },
  financeLabel: { fontSize: 10, color: '#888' },
  financeValue: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  
  cardFull: { width: '100%', backgroundColor: 'white', marginBottom: 20 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  taskTitle: { fontSize: 14, color: '#333', fontWeight: '500' },
  taskTime: { fontSize: 10, color: '#999' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  shortcutGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  shortcutBtn: { width: '23%', alignItems: 'center', marginBottom: 15 },
  iconCircle: { width: 50, height: 50, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8, elevation: 2, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.1, shadowRadius:3 },
  shortcutText: { fontSize: 11, color: '#555', textAlign: 'center', fontWeight: '500' },
});