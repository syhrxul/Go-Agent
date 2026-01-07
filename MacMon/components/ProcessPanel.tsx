import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Process } from './types';

interface ProcessPanelProps {
  activeUrl: string;
}

type KillTarget = {
  pid: number;
  name: string;
  category: string;
} | null;

export default function ProcessPanel({ activeUrl }: ProcessPanelProps) {
  const [processList, setProcessList] = useState<Process[]>([]);
  const [loading, setLoading] = useState(false);
  const [killTarget, setKillTarget] = useState<KillTarget>(null);

  const fetchWithTimeout = async (url: string) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(id);
      return await res.json();
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  const loadProcesses = async () => {
    setLoading(true);
    try {
      const baseUrl = activeUrl.replace('/stats-json', '');
      const data = await fetchWithTimeout(`${baseUrl}/processes`);
      setProcessList(data || []);
    } catch (e) {
      console.log('Failed to load processes');
    } finally {
      setLoading(false);
    }
  };

  const executeKill = async () => {
    if (!killTarget) return;
    try {
      const baseUrl = activeUrl.replace('/stats-json', '');
      await fetch(`${baseUrl}/kill?pid=${killTarget.pid}`, { method: 'POST' });
      loadProcesses();
    } catch (e) {
      console.log('Failed to kill process');
    } finally {
      setKillTarget(null);
    }
  };

  useEffect(() => {
    loadProcesses();
    const interval = setInterval(loadProcesses, 10000);
    return () => clearInterval(interval);
  }, [activeUrl]);

  const systemApps = processList.filter(p => p.category === 'System');
  const userApps = processList.filter(p => p.category !== 'System');

  const renderRow = (proc: Process, isSystem: boolean) => (
    <View key={proc.pid} style={[styles.row, isSystem && styles.rowSystem]}>
      <View style={styles.iconContainer}>
        <FontAwesome
          name={isSystem ? 'cog' : 'window-maximize'}
          size={14}
          color={isSystem ? '#8E8E93' : '#007AFF'}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.name, isSystem && { color: '#555' }]} numberOfLines={1}>
          {proc.name}
        </Text>
        <Text style={styles.pid}>PID: {proc.pid} • CPU: {proc.cpu}%</Text>
      </View>

      <TouchableOpacity
        style={[styles.killBtn, isSystem && { backgroundColor: '#aaa' }]}
        onPress={() => setKillTarget({ pid: proc.pid, name: proc.name, category: proc.category })}
      >
        <Text style={styles.killText}>{isSystem ? 'KILL' : 'QUIT'}</Text>
      </TouchableOpacity>
    </View>
  );

  const isSystemKill = killTarget?.category === 'System';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Process Manager</Text>
        <TouchableOpacity onPress={loadProcesses}>
          <FontAwesome name="refresh" size={14} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {loading && processList.length === 0 ? (
        <ActivityIndicator size="small" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView nestedScrollEnabled>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SYSTEM / KERNEL</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{systemApps.length}</Text>
            </View>
          </View>
          {systemApps.map(p => renderRow(p, true))}

          <View style={{ height: 10 }} />

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>USER APPLICATIONS</Text>
            <View style={[styles.badge, { backgroundColor: '#007AFF' }]}>
              <Text style={styles.badgeText}>{userApps.length}</Text>
            </View>
          </View>
          {userApps.length > 0 ? (
            userApps.map(p => renderRow(p, false))
          ) : (
            <Text style={styles.emptyText}>Tidak ada aplikasi berat.</Text>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ===== MODAL KONFIRMASI MODERN ===== */}
      <Modal transparent animationType="fade" visible={!!killTarget}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <FontAwesome
              name={isSystemKill ? 'exclamation-triangle' : 'close'}
              size={38}
              color={isSystemKill ? '#FF3B30' : '#007AFF'}
              style={{ marginBottom: 10 }}
            />

            <Text style={styles.modalTitle}>
              {isSystemKill ? 'Force Kill System Process' : 'Force Quit App'}
            </Text>

            <Text style={styles.modalText}>
              {isSystemKill
                ? 'Ini adalah proses sistem / kernel.\nMematikannya bisa menyebabkan crash atau restart.'
                : `Paksa berhenti aplikasi "${killTarget?.name}"?`}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setKillTarget(null)}>
                <Text style={styles.cancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmBtn,
                  { backgroundColor: isSystemKill ? '#FF3B30' : '#007AFF' }
                ]}
                onPress={executeKill}
              >
                <Text style={styles.confirmText}>
                  {isSystemKill ? 'KILL (RISKY)' : 'FORCE QUIT'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginBottom: 10,
    marginTop: 5,
  },
  title: { fontWeight: 'bold', fontSize: 14, color: '#333' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 5,
    paddingHorizontal: 5,
  },
  sectionTitle: { fontSize: 10, fontWeight: 'bold', color: '#888', marginRight: 5 },
  badge: {
    backgroundColor: '#8E8E93',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: { color: 'white', fontSize: 9, fontWeight: 'bold' },

  row: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rowSystem: { backgroundColor: '#f9f9f9', opacity: 0.95 },

  iconContainer: { width: 30, alignItems: 'center', marginRight: 5 },

  name: { fontWeight: 'bold', fontSize: 13 },
  pid: { fontSize: 11, color: '#666', marginTop: 2 },

  killBtn: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  killText: { color: 'white', fontWeight: 'bold', fontSize: 9 },

  emptyText: { textAlign: 'center', color: '#999', fontSize: 12, marginVertical: 10 },

  /* ===== MODAL ===== */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  modalText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
  },
  cancelText: { fontWeight: 'bold', color: '#333' },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  confirmText: { color: 'white', fontWeight: 'bold', fontSize: 11 },
});
