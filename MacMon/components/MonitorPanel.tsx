// components/MonitorPanel.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SystemStats } from './types'; 

interface MonitorPanelProps {
  stats: SystemStats | null;
  loading: boolean;
  errorMsg: string | null;
}

export default function MonitorPanel({ stats, loading, errorMsg }: MonitorPanelProps) {
  if (loading && !stats) return <ActivityIndicator size="small" color="#007AFF" style={{marginTop:20}} />;
  if (!stats) return <Text style={styles.errorText}>{errorMsg || "Disconnected"}</Text>;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>

        <StatCard label="CPU" value={`${stats.cpu}%`} icon="microchip" color="#FF3B30" />
        <StatCard label="RAM" value={`${stats.ram}%`} icon="memory" color="#007AFF" />
        <StatCard label="GPU" value={`${stats.gpu}%`} icon="tv" color="#5856D6" />
        
        <StatCard label="Disk" value={`${stats.disk}%`} icon="hdd-o" color="#FF9500" />
        <StatCard label="Temp" value={`${stats.temp}°C`} icon="thermometer" color="#FF2D55" />
        <StatCard label="Uptime" value={stats.uptime} icon="clock-o" color="#8E8E93" isSmallFont />

        <View style={styles.fullRow}>
            <Text style={styles.sectionTitle}>Battery</Text>
        </View>
        <StatCard label="Level" value={`${stats.battery}%`} icon="battery-3" color="#34C759" />
        <StatCard label="Status" value={stats.battery_status} icon="bolt" color="#FFCC00" isSmallFont />
        <StatCard label="Time" value={stats.battery_time} icon="hourglass-half" color="#8E8E93" isSmallFont />

        <View style={styles.fullRow}>
            <Text style={styles.sectionTitle}>Network</Text>
        </View>
        <StatCard label="Download" value={stats.network.rx_speed} icon="arrow-down" color="#34C759" />
        <StatCard label="Upload" value={stats.network.tx_speed} icon="arrow-up" color="#007AFF" />
        <StatCard label="Total Down" value={stats.network.rx_total} icon="cloud-download" color="#8E8E93" isSmallFont />
        <StatCard label="Total Up" value={stats.network.tx_total} icon="cloud-upload" color="#8E8E93" isSmallFont />
      </View>
      <View style={{height: 20}} />
    </ScrollView>
  );
}

function StatCard({ label, value, icon, color, isSmallFont }: any) {
  return (
    <View style={styles.card}>
      <FontAwesome name={icon} size={16} color={color} style={{marginBottom: 4}} />
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, isSmallFont && {fontSize: 11}]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '32%', backgroundColor: 'white', borderRadius: 8, padding: 8, alignItems: 'center', marginBottom: 8, elevation: 1, shadowColor:'#000', shadowOpacity:0.05, shadowRadius:2 },
  label: { fontSize: 10, color: '#666', marginBottom: 2 },
  value: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  errorText: { textAlign: 'center', color: '#888', marginTop: 20 },
  fullRow: { width: '100%', paddingVertical: 5, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#555' }
});