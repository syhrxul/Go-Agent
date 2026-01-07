import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Contexts
import { usePomodoro } from '@/context/PomodoroContext';
import { useFinance } from '@/context/FinanceContext';

// Import Styles Baru
import { styles, Colors } from './home.styles'; 

export default function DashboardLandscape() {
  const [date, setDate] = useState(new Date());
  
  // Context Data
  const { timeLeft, isActive, toggleTimer, isBreak, isLongBreak } = usePomodoro();
  const { balance, todayExpense } = useFinance();

  // 1. Force Landscape & Clock Timer
  useEffect(() => {

    const timer = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Helpers
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const formatRupiah = (num: number) => {
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const pomodoroColor = isBreak ? Colors.success : Colors.primary;
  const pomodoroStatus = isBreak ? (isLongBreak ? "Long Break" : "Short Break") : "Focus Mode";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <View style={styles.mainLayout}>
        
        {/* === KOLOM KIRI (65%): Header + Widgets === */}
        <View style={styles.leftColumn}>
          
          {/* Header Landscape */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingText}>Halo, Alul 👋</Text>
              <Text style={styles.dateText}>
                {date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
            </View>
            <View style={styles.clockContainer}>
              <Text style={styles.clockText}>
                {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second:'2-digit', hour12: false }).replace(/\./g, ':')}
              </Text>
            </View>
          </View>

          {/* Row Kartu Utama */}
          <View style={styles.cardRow}>
            
            {/* 1. Pomodoro Card (Modern Glass) */}
            <TouchableOpacity 
              style={[styles.card, styles.cardPomodoro]} 
              activeOpacity={0.9}
              onPress={() => router.push('/pomodoro-fullscreen')} 
            >
              <View style={styles.pomoHeader}>
                <View style={[styles.statusTag, { backgroundColor: isBreak ? '#DCFCE7' : '#E0E7FF' }]}>
                  <FontAwesome name={isBreak ? "coffee" : "fire"} size={12} color={pomodoroColor} />
                  <Text style={[styles.statusText, { color: pomodoroColor }]}>{pomodoroStatus}</Text>
                </View>
                <TouchableOpacity onPress={(e) => { e.stopPropagation(); toggleTimer(); }}>
                   <View style={[styles.playButtonCircle, { backgroundColor: pomodoroColor }]}>
                      <FontAwesome name={isActive ? "pause" : "play"} size={12} color="white" />
                   </View>
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.timerBig, { color: pomodoroColor }]}>{formatTime(timeLeft)}</Text>
              <Text style={styles.cardLabel}>Tap to fullscreen</Text>
            </TouchableOpacity>

            {/* 2. Finance Card */}
            <TouchableOpacity 
              style={[styles.card, styles.cardFinance]}
              activeOpacity={0.9}
              onPress={() => router.push('/finance')}
            >
              <View style={styles.financeHeader}>
                <View style={styles.iconSquare}>
                  <MaterialIcons name="account-balance-wallet" size={20} color={Colors.warning} />
                </View>
                <MaterialIcons name="arrow-outward" size={18} color={Colors.textSecondary} />
              </View>
              
              <View style={styles.financeBody}>
                <Text style={styles.labelSmall}>Total Saldo</Text>
                <Text style={styles.balanceText}>{formatRupiah(balance)}</Text>
                <View style={styles.expenseRow}>
                  <Text style={styles.expenseLabel}>Pengeluaran Hari Ini:</Text>
                  <Text style={styles.expenseValue}>{formatRupiah(todayExpense)}</Text>
                </View>
              </View>
            </TouchableOpacity>

          </View>

           {/* Shortcuts Horizontal */}
           <View style={styles.shortcutBar}>
              <ShortcutItem label="Focus" icon="timer" onPress={() => router.push('/pomodoro')} />
              <ShortcutItem label="Keuangan" icon="attach-money" onPress={() => router.push('/finance')} />
              <ShortcutItem label="Mac Control" icon="computer" onPress={() => router.push('/FAM')} />
              <ShortcutItem label="More" icon="widgets" onPress={() => {}} />
           </View>
        </View>

        {/* === KOLOM KANAN (35%): Sidebar Agenda === */}
        <View style={styles.rightColumn}>
          <View style={styles.sidebarCard}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sectionTitle}>Agenda</Text>
              <TouchableOpacity>
                <Text style={styles.linkText}>See All</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{flex: 1}}>
              <TaskItem title="Meeting Dosen" time="10:00" tag="Kampus" isDone={true} />
              <TaskItem title="Bayar Wifi" time="13:30" tag="Personal" isDone={false} />
              <TaskItem title="Project React" time="15:00" tag="Coding" isDone={false} />
              <TaskItem title="Jogging Sore" time="17:00" tag="Health" isDone={false} />
            </ScrollView>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

// --- SUB COMPONENTS ---

const ShortcutItem = ({ label, icon, onPress }: any) => (
  <TouchableOpacity style={styles.shortcutItem} onPress={onPress}>
    <View style={styles.shortcutIcon}>
      <MaterialIcons name={icon as any} size={22} color={Colors.textPrimary} />
    </View>
    <Text style={styles.shortcutLabel}>{label}</Text>
  </TouchableOpacity>
);

const TaskItem = ({ title, time, tag, isDone }: any) => (
  <View style={styles.taskItem}>
    <View style={[styles.checkCircle, isDone && styles.checkCircleDone]}>
      {isDone && <MaterialIcons name="check" size={14} color="white" />}
    </View>
    <View style={{flex: 1}}>
      <Text style={[styles.taskTitle, isDone && {textDecorationLine: 'line-through', color: Colors.textSecondary}]}>{title}</Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={styles.taskTime}>{time}</Text>
        <View style={styles.dot} />
        <Text style={styles.taskTag}>{tag}</Text>
      </View>
    </View>
  </View>
);