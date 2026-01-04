import React, { useRef, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, PanResponder, Animated, TouchableOpacity, 
  Modal, Button, Dimensions, ActivityIndicator 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const BUTTON_SIZE = 60; 
const MARGIN_TEPI = 20;
const MARGIN_ATAS = 40;
const MARGIN_BAWAH = 40;

// --- KONFIGURASI KONEKSI ---
// OPSI 1: KABEL DATA (USB) - Paling Stabil & Cepat
// Karena Anda sudah menjalankan 'adb reverse tcp:8080 tcp:8080', gunakan 'localhost'.
const API_URL = 'http://localhost:8080/stats-json'; 

// OPSI 2: WI-FI (Tanpa Kabel)
// Jika kabel dicabut, ganti baris di atas menjadi:
// const API_URL = 'http://192.168.0.198:8080/stats-json';
interface SystemStats {
  ts: number;
  cpu: number;
  ram: number;
  gpu: number;
  disk: number;
  temp: number;
  battery: number;
  battery_status: string;
  uptime: string;
  network: {
    rx_speed: string;
    tx_speed: string;
    rx_total: string;
    tx_total: string;
  };
}

export default function DraggableButton() {
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
  const pan = useRef(new Animated.ValueXY({ x: MARGIN_TEPI, y: 100 })).current;
  const val = useRef({ x: MARGIN_TEPI, y: 100 }); 
  pan.addListener((value) => (val.current = value));
  
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalTranslate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let isMounted = true;

    const fetchData = async () => {
      try {
        // Timeout 2 detik agar tidak hang jika koneksi putus
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(API_URL, {
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Server error");
        
        const json = await response.json();
        
        if (isMounted) {
          setStats(json);
          setLoading(false);
          setErrorMsg(null);
        }
      } catch (error) {
        if (isMounted) {
          // Jika error, kita biarkan stats terakhir (jika ada) atau tampilkan error
          // Tidak perlu setStats(null) agar data tidak berkedip hilang
          setErrorMsg("Connecting...");
          setLoading(false);
        }
      }
    };

    if (modalVisible) {
      setLoading(true);
      fetchData(); // Panggil langsung
      intervalId = setInterval(fetchData, 1000); // Update tiap 1 detik
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [modalVisible]);

  // --- Animasi & Pan Responder ---
  const openModal = () => {
    setModalVisible(true);
    const buttonCenterX = val.current.x + BUTTON_SIZE / 2;
    const buttonCenterY = val.current.y + BUTTON_SIZE / 2;
    const startX = buttonCenterX - (SCREEN_WIDTH / 2);
    const startY = buttonCenterY - (SCREEN_HEIGHT / 2);

    modalTranslate.setValue({ x: startX, y: startY });
    modalScale.setValue(0);
    Animated.parallel([
      Animated.spring(modalTranslate, { toValue: { x: 0, y: 0 }, useNativeDriver: true }),
      Animated.spring(modalScale, { toValue: 1, useNativeDriver: true })
    ]).start();
  };

  const closeModal = () => {
    Animated.timing(modalScale, { toValue: 0, duration: 150, useNativeDriver: true })
      .start(() => setModalVisible(false));
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => {
        pan.setOffset({ x: val.current.x, y: val.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const currentX = val.current.x;
        let targetX = (currentX + BUTTON_SIZE / 2 > SCREEN_WIDTH / 2) ? SCREEN_WIDTH - BUTTON_SIZE - MARGIN_TEPI : MARGIN_TEPI;
        let targetY = val.current.y;
        if (targetY < MARGIN_ATAS) targetY = MARGIN_ATAS;
        else if (targetY > SCREEN_HEIGHT - BUTTON_SIZE - MARGIN_BAWAH) targetY = SCREEN_HEIGHT - BUTTON_SIZE - MARGIN_BAWAH;
        Animated.spring(pan, { toValue: { x: targetX, y: targetY }, useNativeDriver: false }).start();
      },
    })
  ).current;

  return (
    <View style={styles.absoluteContainer} pointerEvents="box-none">
      <Animated.View style={{ transform: pan.getTranslateTransform() }} {...panResponder.panHandlers}>
        <TouchableOpacity style={styles.floatingButton} onPress={openModal} activeOpacity={0.8}>
          <FontAwesome name="apple" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      <Modal transparent={true} visible={modalVisible} onRequestClose={closeModal} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalView, { transform: [{ translateX: modalTranslate.x }, { translateY: modalTranslate.y }, { scale: modalScale }] }]}>
            <Text style={styles.modalTitle}>Mac Stats</Text>
            
            {loading && !stats ? (
               <ActivityIndicator size="large" color="#007AFF" style={{marginBottom: 20}} />
            ) : stats ? (
              <View style={styles.statsContainer}>
                {/* Indikator Status */}
                <View style={[styles.statusBadge, { backgroundColor: errorMsg ? '#FF3B30' : '#34C759' }]}>
                  <Text style={styles.statusText}>{errorMsg ? 'RECONNECTING' : 'LIVE'}</Text>
                </View>

                {/* TAMPILAN DATA */}
                <StatRow label="CPU" value={`${stats.cpu}%`} icon="microchip" />
                <StatRow label="RAM" value={`${stats.ram}%`} icon="memory" />
                <StatRow label="GPU" value={`${stats.gpu}%`} icon="tv" />
                <StatRow label="Temp" value={`${stats.temp}°C`} icon="thermometer" />
                
                <View style={styles.separator} />
                <Text style={styles.subTitle}>Network</Text>
                <StatRow label="Down" value={`${stats.network.rx_speed} (${stats.network.rx_total})`} icon="arrow-down" />
                <StatRow label="Up" value={`${stats.network.tx_speed} (${stats.network.tx_total})`} icon="arrow-up" />
                
                <View style={styles.separator} />
                <StatRow label="Battery" value={`${stats.battery}% (${stats.battery_status})`} icon="battery-3" />
                <StatRow label="Uptime" value={stats.uptime} icon="clock-o" />
              </View>
            ) : (
                <Text style={styles.errorText}>
                    Menunggu data dari {API_URL}...{"\n"}
                    Pastikan Kabel Terhubung & Server Jalan.
                </Text>
            )}

            <View style={{marginTop: 15, width: '100%'}}>
               <Button title="Tutup" onPress={closeModal} color="#888" />
            </View>

          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function StatRow({ label, value, icon }: { label: string, value: string | number, icon: any }) {
  return (
    <View style={styles.statRow}>
      <View style={{flexDirection: 'row', alignItems: 'center', minWidth: 90}}>
        <FontAwesome name={icon} size={14} color="#555" style={{marginRight: 8, width: 20, textAlign: 'center'}} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, pointerEvents: 'box-none' },
  floatingButton: { backgroundColor: '#007AFF', width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' },
  modalView: { width: 320, backgroundColor: 'white', borderRadius: 20, padding: 20, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subTitle: { fontSize: 12, fontWeight: 'bold', color: '#888', marginTop: 5, marginBottom: 5 },
  separator: { height: 1, backgroundColor: '#eee', width: '100%', marginVertical: 5 },
  statsContainer: { width: '100%' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  statLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  statValue: { fontSize: 14, color: '#000', fontWeight: 'bold' },
  statusBadge: { position: 'absolute', top: -35, right: 0, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 10, color: 'white', fontWeight: 'bold' },
  errorText: { color: '#666', fontSize: 12, textAlign: 'center', marginVertical: 20, lineHeight: 20 },
});