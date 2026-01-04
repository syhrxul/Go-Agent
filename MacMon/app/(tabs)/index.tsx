import React, { useState } from 'react';
import { StyleSheet, TextInput, ScrollView, Platform } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useStats } from '@/hooks/useStats';

export default function MonitorScreen() {
  const [serverUrl, setServerUrl] = useState('http://192.168.1.5:8080'); // Default placeholder
  // Use a debounced or committed url to avoid reconnecting on every keystroke
  const [connectedUrl, setConnectedUrl] = useState(serverUrl);

  const { stats, connected, error } = useStats(connectedUrl);

  const handleConnect = () => {
    setConnectedUrl(serverUrl);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mac Monitor</Text>
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="http://100.x.y.z:8080"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
            />
            <Text
                style={styles.connectButton}
                onPress={handleConnect}
            >
                Connect
            </Text>
        </View>
        <Text style={{color: connected ? 'green' : 'red', marginTop: 5}}>
            {connected ? 'Connected' : error ? `Error: ${error}` : 'Disconnected'}
        </Text>
      </View>

      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.statsContainer}>
        {stats ? (
            <>
                <StatRow label="CPU" value={`${stats.cpu.toFixed(1)}%`} />
                <StatRow label="RAM" value={`${stats.ram.toFixed(1)} GB`} />
                <StatRow label="GPU" value={`${stats.gpu.toFixed(1)}%`} />
                <StatRow label="Temp" value={`${stats.temp.toFixed(1)}°C`} />
                <StatRow label="Disk" value={`${stats.disk.toFixed(1)}%`} />
                <StatRow label="Battery" value={`${stats.battery}% (${stats.battery_status})`} />
                <StatRow label="Time Rem." value={stats.battery_time} />
                <StatRow label="Uptime" value={stats.uptime} />

                <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Network</Text></View>
                <StatRow label="Download" value={stats.network.rx_speed} />
                <StatRow label="Upload" value={stats.network.tx_speed} />
                <StatRow label="Total DL" value={stats.network.rx_total} />
                <StatRow label="Total UL" value={stats.network.tx_total} />
            </>
        ) : (
            <Text style={styles.waiting}>Waiting for data...</Text>
        )}
      </ScrollView>
    </View>
  );
}

function StatRow({ label, value }: { label: string, value: string | number }) {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    color: '#000',
    marginRight: 10,
  },
  connectButton: {
    color: '#2f95dc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  scroll: {
    width: '100%',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 400,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  label: {
    fontSize: 18,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  waiting: {
    marginTop: 50,
    fontSize: 16,
    fontStyle: 'italic',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    width: '100%',
    maxWidth: 400,
    borderBottomWidth: 2,
    borderBottomColor: '#666',
  },
  sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
  }
});
