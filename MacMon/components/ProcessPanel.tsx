// components/ProcessPanel.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Process } from './types';

interface ProcessPanelProps {
  activeUrl: string; // Panel ini butuh URL aktif untuk fetch/kill
}

export default function ProcessPanel({ activeUrl }: ProcessPanelProps) {
  const [processList, setProcessList] = useState<Process[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper Fetch
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
      // Hapus endpoint stats, ganti dengan processes
      const baseUrl = activeUrl.replace('/stats-json', ''); 
      const data = await fetchWithTimeout(`${baseUrl}/processes`);
      setProcessList(data || []);
    } catch (error) {
      console.log("Failed to load processes");
    } finally {
      setLoading(false);
    }
  };

  const killProcess = (pid: number, name: string) => {
    Alert.alert("Kill Process", `Matikan "${name}" (PID: ${pid})?`, [
        { text: "Batal", style: "cancel" },
        { text: "KILL", style: 'destructive', onPress: async () => {
            try {
                const baseUrl = activeUrl.replace('/stats-json', '');
                await fetch(`${baseUrl}/kill?pid=${pid}`, { method: 'POST' });
                loadProcesses(); // Refresh setelah kill
            } catch (e) { Alert.alert("Gagal mematikan proses."); }
        }}
    ]);
  };

  // Auto load saat pertama kali dibuka
  useEffect(() => {
    loadProcesses();
    const interval = setInterval(loadProcesses, 5000); // Auto refresh tiap 5 detik
    return () => clearInterval(interval);
  }, [activeUrl]);

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.title}>Top Processes</Text>
            <TouchableOpacity onPress={loadProcesses}>
                <Text style={{color:'#007AFF', fontSize:12}}>Refresh</Text>
            </TouchableOpacity>
        </View>

        {loading && processList.length === 0 ? <ActivityIndicator size="small" /> : (
            <ScrollView nestedScrollEnabled={true}>
                {processList.map((proc) => (
                    <View key={proc.pid} style={styles.row}>
                        <View style={{flex: 1}}>
                            <Text style={styles.name} numberOfLines={1}>{proc.name}</Text>
                            <Text style={styles.pid}>PID: {proc.pid}</Text>
                        </View>
                        <View style={{marginRight: 10, alignItems:'flex-end'}}>
                             <Text style={styles.stat}>CPU: {proc.cpu}%</Text>
                             <Text style={styles.stat}>RAM: {proc.ram.toFixed(1)}%</Text>
                        </View>
                        <TouchableOpacity style={styles.killBtn} onPress={() => killProcess(proc.pid, proc.name)}>
                            <Text style={styles.killText}>KILL</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                <View style={{height: 20}} /> 
            </ScrollView>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal: 5, marginBottom: 5},
  title: { fontWeight: 'bold', fontSize: 12, color: '#666' },
  row: { flexDirection: 'row', backgroundColor: 'white', padding: 8, borderRadius: 8, marginBottom: 4, alignItems: 'center', elevation:1 },
  name: { fontWeight: 'bold', fontSize: 12, color: '#333' },
  pid: { fontSize: 10, color: '#888' },
  stat: { fontSize: 10, color: '#555' },
  killBtn: { backgroundColor: '#FF3B30', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 5 },
  killText: { color: 'white', fontWeight: 'bold', fontSize: 10 },
});