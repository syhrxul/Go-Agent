import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Vibration } from 'react-native';
import { Text, View } from '@/components/Themed';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// GANTI DENGAN IP MAC ANDA
const API_URL = 'http://192.168.0.198:8080/api/control';

// Palet Warna Konsisten (White Theme)
const Colors = {
  background: '#F2F4F8',
  surface: '#FFFFFF',
  primary: '#6366F1',        // Indigo
  textPrimary: '#1E293B',    // Slate Dark
  textSecondary: '#64748B',  // Slate Light
  border: '#E2E8F0',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
};

export default function FAMScreen() {
  const [loading, setLoading] = useState(false);
  const [customApp, setCustomApp] = useState('');

  // Fungsi Kirim Perintah
  const sendCommand = async (type: string, action: string, value?: number, name?: string) => {
    Vibration.vibrate(15); 
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, action, value, name }),
      });
      if (!response.ok) throw new Error('Failed');
    } catch (error) {
      console.log("Error sending command:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
           <MaterialIcons name="arrow-back-ios-new" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={{alignItems: 'center'}}>
           <Text style={styles.headerTitle}>Mac Control Center</Text>
           <View style={{flexDirection:'row', alignItems:'center', gap: 6}}>
              <View style={[styles.statusDot, { backgroundColor: loading ? Colors.warning : Colors.success }]} />
              <Text style={styles.headerSubtitle}>{loading ? "Sending..." : "Connected"}</Text>
           </View>
        </View>

        <TouchableOpacity style={styles.iconBtn}>
           <MaterialIcons name="more-horiz" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.mainLayout}>
        
        {/* === KOLOM KIRI: System Controls === */}
        <View style={styles.leftColumn}>
            
            {/* 1. VOLUME & BRIGHTNESS CARD */}
            <View style={styles.controlCard}>
                {/* Volume Row */}
                <View style={styles.controlRow}>
                    <View style={styles.labelContainer}>
                        <View style={[styles.iconBox, {backgroundColor: '#EEF2FF'}]}>
                            <Ionicons name="volume-high" size={20} color={Colors.primary} />
                        </View>
                        <Text style={styles.labelText}>Volume</Text>
                    </View>
                    <View style={styles.buttonGroup}>
                        <ControlButton icon="volume-mute" onPress={() => sendCommand('volume', 'mute')} color={Colors.danger} />
                        <ControlButton icon="remove" onPress={() => sendCommand('volume', 'down')} />
                        <ControlButton icon="add" onPress={() => sendCommand('volume', 'up')} isPrimary />
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Brightness Row */}
                <View style={styles.controlRow}>
                    <View style={styles.labelContainer}>
                        <View style={[styles.iconBox, {backgroundColor: '#FEF3C7'}]}>
                            <Ionicons name="sunny" size={20} color={Colors.warning} />
                        </View>
                        <Text style={styles.labelText}>Brightness</Text>
                    </View>
                    <View style={styles.buttonGroup}>
                        <ControlButton icon="remove" onPress={() => sendCommand('brightness', 'down')} />
                        <ControlButton icon="add" onPress={() => sendCommand('brightness', 'up')} isPrimary />
                    </View>
                </View>
            </View>

            {/* 2. MEDIA PLAYER CARD (UPDATED DESIGN) */}
            <View style={[styles.controlCard, styles.mediaCardContainer]}>
                {/* Header: Art & Info */}
                <View style={styles.mediaHeader}>
                   <View style={styles.albumArt}>
                      <Ionicons name="musical-notes" size={28} color="white" />
                   </View>
                   <View>
                      <Text style={styles.trackTitle}>System Audio</Text>
                      <Text style={styles.trackArtist}>Connected to MacBook</Text>
                   </View>
                </View>

                {/* Progress Bar (Visual Only) */}
                <View style={styles.progressContainer}>
                   <View style={styles.progressBar} />
                   <View style={styles.timeRow}>
                      <Text style={styles.timeText}>--:--</Text>
                      <Text style={styles.timeText}>--:--</Text>
                   </View>
                </View>
                
                {/* Controls */}
                <View style={styles.mediaRow}>
                    <TouchableOpacity style={styles.mediaIconBtn} onPress={() => sendCommand('media', 'prev')}>
                        <Ionicons name="play-skip-back" size={26} color={Colors.textPrimary} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.playPauseBtn} onPress={() => sendCommand('media', 'playpause')}>
                        <Ionicons name="play" size={32} color="white" style={{marginLeft: 4}} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.mediaIconBtn} onPress={() => sendCommand('media', 'next')}>
                        <Ionicons name="play-skip-forward" size={26} color={Colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </View>

        </View>

        {/* === KOLOM KANAN: Apps & Tools === */}
        <View style={styles.rightColumn}>
            
            {/* QUICK LAUNCH GRID */}
            <Text style={styles.sectionTitle}>Quick Launch</Text>
            <View style={styles.appGrid}>
                <AppButton name="Finder" icon="folder-open" color="#3B82F6" onPress={() => sendCommand('app', 'open', 0, 'Finder')} />
                <AppButton name="Safari" icon="compass-outline" color="#2563EB" onPress={() => sendCommand('app', 'open', 0, 'Safari')} />
                <AppButton name="Music" icon="musical-notes" color="#EF4444" onPress={() => sendCommand('app', 'open', 0, 'Music')} />
                <AppButton name="Terminal" icon="terminal" color="#1F2937" onPress={() => sendCommand('app', 'open', 0, 'Terminal')} />
                <AppButton name="Settings" icon="settings-outline" color="#6B7280" onPress={() => sendCommand('app', 'open', 0, 'System Settings')} />
                <AppButton name="Chrome" icon="globe-outline" color="#F59E0B" onPress={() => sendCommand('app', 'open', 0, 'Google Chrome')} />
            </View>

            {/* CUSTOM COMMAND INPUT */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <MaterialIcons name="search" size={20} color={Colors.textSecondary} />
                    <TextInput
                        style={styles.input}
                        placeholder="Open app by name..."
                        placeholderTextColor={Colors.textSecondary}
                        value={customApp}
                        onChangeText={setCustomApp}
                    />
                </View>
                <TouchableOpacity 
                    style={styles.sendBtn} 
                    onPress={() => {
                        if (customApp) sendCommand('app', 'open', 0, customApp);
                        setCustomApp('');
                    }}
                >
                    <MaterialIcons name="arrow-forward" size={20} color="white" />
                </TouchableOpacity>
            </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

// --- SUB COMPONENTS ---

const ControlButton = ({ icon, onPress, isPrimary, color }: any) => (
    <TouchableOpacity 
        style={[
            styles.ctrlBtn, 
            isPrimary && { backgroundColor: Colors.primary },
            color && { backgroundColor: color + '20' } 
        ]} 
        onPress={onPress}
    >
        <Ionicons name={icon} size={20} color={isPrimary ? 'white' : (color || Colors.textPrimary)} />
    </TouchableOpacity>
);

const AppButton = ({ name, icon, color, onPress }: any) => (
  <TouchableOpacity style={styles.appItem} onPress={onPress}>
    <View style={[styles.appIconBg, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="white" />
    </View>
    <Text style={styles.appText}>{name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 1
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  headerSubtitle: { fontSize: 12, color: Colors.textSecondary },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  // Layout
  mainLayout: { flex: 1, flexDirection: 'row', padding: 24, gap: 24 },
  leftColumn: { flex: 1.2, gap: 24 },
  rightColumn: { flex: 1, backgroundColor: Colors.surface, borderRadius: 28, padding: 24, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },

  // Control Cards (Volume/Brightness)
  controlCard: {
      backgroundColor: Colors.surface,
      borderRadius: 28,
      padding: 24,
      shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
      justifyContent: 'center'
  },
  controlRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
  },
  labelContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  labelText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  
  buttonGroup: { flexDirection: 'row', gap: 12 },
  ctrlBtn: {
      width: 44, height: 44, borderRadius: 16,
      backgroundColor: Colors.background,
      justifyContent: 'center', alignItems: 'center',
  },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 16 },

  // MEDIA PLAYER STYLES (NEW)
  mediaCardContainer: {
    flex: 1,
    justifyContent: 'space-between', 
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 10,
  },
  albumArt: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  trackTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 2 },
  trackArtist: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  
  // Progress Bar
  progressContainer: { width: '100%', marginVertical: 10 },
  progressBar: { height: 4, backgroundColor: Colors.border, borderRadius: 2, width: '100%', overflow: 'hidden', marginBottom: 4 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { fontSize: 10, color: Colors.textSecondary },

  // Media Controls
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  mediaIconBtn: { padding: 10 },
  playPauseBtn: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.textPrimary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },

  // Apps
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },
  appGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },
  appItem: { width: '30%', alignItems: 'center', marginBottom: 16 },
  appIconBg: {
      width: 56, height: 56, borderRadius: 20,
      justifyContent: 'center', alignItems: 'center',
      marginBottom: 8,
      shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 3
  },
  appText: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary },

  // Input
  inputContainer: { flexDirection: 'row', marginTop: 'auto', gap: 10 },
  inputWrapper: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      backgroundColor: Colors.background, borderRadius: 16, paddingHorizontal: 16,
  },
  input: { flex: 1, height: 50, marginLeft: 8, fontSize: 14, color: Colors.textPrimary },
  sendBtn: {
      width: 50, height: 50, borderRadius: 16,
      backgroundColor: Colors.textPrimary,
      justifyContent: 'center', alignItems: 'center',
  },
});