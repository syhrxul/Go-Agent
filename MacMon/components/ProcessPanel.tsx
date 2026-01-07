import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Process } from './types';

interface ProcessPanelProps {
  activeUrl: string; 
}

export default function ProcessPanel({ activeUrl }: ProcessPanelProps) {
  const [processList, setProcessList] = useState<Process[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWithTimeout = async (url: string) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return await res.json();
    } catch (e) { clearTimeout(id); throw e; }
  };

  const loadProcesses = async () => {
    setLoading(true);
    try {
      const baseUrl = activeUrl.replace('/stats-json', ''); 
      const data = await fetchWithTimeout(`${baseUrl}/processes`);
      setProcessList(data || []);
    } catch (error) {
      console.log("Failed to load processes");
    } finally {
      setLoading(false);
    }
  };

  const killProcess = (pid: number, name: string, category: string) => {
    const isSystem = category === 'System';
    const warningText = isSystem 
        ? "⚠️ PERINGATAN: Ini adalah proses sistem/kernel. Mematikannya bisa membuat Mac crash atau restart.\n\nYakin ingin memaksa berhenti?" 
        : `Paksa berhenti aplikasi "${name}"?`;

    Alert.alert(isSystem ? "Force Quit System Process" : "Force Quit App", warningText, [
        { text: "Batal", style: "cancel" },
        { text: isSystem ? "KILL (RISKY)" : "FORCE QUIT", style: 'destructive', onPress: async () => {
            try {
                const baseUrl = activeUrl.replace('/stats-json', '');
                await fetch(`${baseUrl}/kill?pid=${pid}`, { method: 'POST' });
                loadProcesses(); 
            } catch (e) { Alert.alert("Gagal mematikan proses."); }
        }}
    ]);
  };

  useEffect(() => {
    loadProcesses();
    const interval = setInterval(loadProcesses, 10000);
    return () => clearInterval(interval);
  }, [activeUrl]);

  // Filter Data untuk View
  const systemApps = processList.filter(p => p.category === 'System');
  const userApps = processList.filter(p => p.category !== 'System');

  const renderRow = (proc: Process, isSystem: boolean) => (
    <View key={proc.pid} style={[styles.row, isSystem && styles.rowSystem]}>
        <View style={styles.iconContainer}>
            <FontAwesome 
                name={isSystem ? "cog" : "window-maximize"} 
                size={14} 
                color={isSystem ? "#8E8E93" : "#007AFF"} 
            />
        </View>
        <View style={{flex: 1}}>
            <Text style={[styles.name, isSystem && {color:'#555'}]} numberOfLines={1}>{proc.name}</Text>
            <Text style={styles.pid}>PID: {proc.pid} • CPU: {proc.cpu}%</Text>
        </View>
        <TouchableOpacity 
            style={[styles.killBtn, isSystem && {backgroundColor: '#ccc'}]} 
            onPress={() => killProcess(proc.pid, proc.name, proc.category)}>
            <Text style={styles.killText}>{isSystem ? "KILL" : "QUIT"}</Text>
        </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Process Manager</Text>
            <TouchableOpacity onPress={loadProcesses}>
                <FontAwesome name="refresh" size={14} color="#007AFF" />
            </TouchableOpacity>
        </View>

        {loading && processList.length === 0 ? <ActivityIndicator size="small" style={{marginTop:20}} /> : (
            <ScrollView nestedScrollEnabled={true}>
                

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>SYSTEM / KERNEL</Text>
                    <View style={styles.badge}><Text style={styles.badgeText}>{systemApps.length}</Text></View>
                </View>
                {systemApps.map(p => renderRow(p, true))}

                <View style={{height: 10}} />

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>USER APPLICATIONS</Text>
                    <View style={[styles.badge, {backgroundColor:'#007AFF'}]}><Text style={styles.badgeText}>{userApps.length}</Text></View>
                </View>
                {userApps.length > 0 ? userApps.map(p => renderRow(p, false)) : (
                    <Text style={styles.emptyText}>Tidak ada aplikasi berat.</Text>
                )}
                
                <View style={{height: 40}} /> 
            </ScrollView>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal: 5, marginBottom: 10, marginTop: 5},
  title: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  
  sectionHeader: { flexDirection:'row', alignItems:'center', marginBottom: 5, marginTop: 5, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', color: '#888', marginRight: 5 },
  badge: { backgroundColor: '#8E8E93', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  badgeText: { color: 'white', fontSize: 9, fontWeight: 'bold' },

  row: { flexDirection: 'row', backgroundColor: 'white', padding: 10, borderRadius: 10, marginBottom: 6, alignItems: 'center', shadowColor:'#000', shadowOpacity:0.05, shadowRadius:2, elevation:1 },
  rowSystem: { backgroundColor: '#f9f9f9', opacity: 0.9 }, 
  iconContainer: { width: 30, alignItems: 'center', justifyContent:'center', marginRight: 5 },
  name: { fontWeight: 'bold', fontSize: 13, color: '#000' },
  pid: { fontSize: 11, color: '#666', marginTop: 2 },
  killBtn: { backgroundColor: '#FF3B30', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 },
  killText: { color: 'white', fontWeight: 'bold', fontSize: 9 },
  emptyText: { textAlign: 'center', color: '#999', fontSize: 12, marginVertical: 10 },
});