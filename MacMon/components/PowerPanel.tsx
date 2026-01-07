import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface PowerPanelProps {
  activeUrl: string;
}

type ActionType = 'restart' | 'sleep' | 'shutdown';

export default function PowerPanel({ activeUrl }: PowerPanelProps) {

  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);

  const getBaseUrl = () => {
    if (!activeUrl) return 'http://localhost:8080';
    return activeUrl.replace('/stats-json', '');
  };

  const actionConfig = {
    sleep: {
      label: 'Sleep',
      color: '#FF9500',
      icon: 'moon-o',
    },
    restart: {
      label: 'Restart',
      color: '#007AFF',
      icon: 'refresh',
    },
    shutdown: {
      label: 'Shutdown',
      color: '#FF3B30',
      icon: 'power-off',
    },
  };

  const executeAction = async (action: ActionType) => {
    try {
      const baseUrl = getBaseUrl();
      await fetch(`${baseUrl}/api/action/${action}`, {
        method: 'POST',
      });
    } catch (e) {
      console.log('Action error:', e);
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Power Control</Text>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#FF9500' }]}
          onPress={() => setConfirmAction('sleep')}
        >
          <FontAwesome name="moon-o" size={20} color="white" />
          <Text style={styles.btnText}>Sleep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#007AFF' }]}
          onPress={() => setConfirmAction('restart')}
        >
          <FontAwesome name="refresh" size={20} color="white" />
          <Text style={styles.btnText}>Restart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#FF3B30' }]}
          onPress={() => setConfirmAction('shutdown')}
        >
          <FontAwesome name="power-off" size={20} color="white" />
          <Text style={styles.btnText}>Shutdown</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={!!confirmAction}
        onRequestClose={() => setConfirmAction(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {confirmAction && (
              <>
                <FontAwesome
                  name={actionConfig[confirmAction].icon as any}
                  size={40}
                  color={actionConfig[confirmAction].color}
                  style={{ marginBottom: 12 }}
                />

                <Text style={styles.modalTitle}>
                  {actionConfig[confirmAction].label}
                </Text>

                <Text style={styles.modalText}>
                  Apakah Anda yakin ingin melakukan tindakan ini pada Mac?
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setConfirmAction(null)}
                  >
                    <Text style={styles.cancelText}>Batal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.confirmBtn,
                      { backgroundColor: actionConfig[confirmAction].color }
                    ]}
                    onPress={() => executeAction(confirmAction)}
                  >
                    <Text style={styles.confirmText}>Ya</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 5,
  },

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
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  modalText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
  },
  cancelText: {
    fontWeight: 'bold',
    color: '#333',
  },
  confirmBtn: {
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 12,
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
