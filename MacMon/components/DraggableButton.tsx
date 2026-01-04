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

// --- CONFIG AUTO SWITCH ---
const WIFI_IP = '192.168.0.198'; // Pastikan ini sesuai IP Mac saat ini
const PORT = '8080';
const ENDPOINT = '/stats-json';

// Daftar URL yang akan dicoba otomatis
const URL_LIST = [
  `http://localhost:${PORT}${ENDPOINT}`,       // Prioritas 1: USB (adb reverse)
  `http://${WIFI_IP}:${PORT}${ENDPOINT}`,      // Prioritas 2: Wi-Fi
];

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
  
  // Ref untuk menyimpan URL mana yang sedang aktif (agar tidak scan ulang tiap detik)
  const activeUrlRef = useRef(URL_LIST[0]); 

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
      let success = false;

      // 1. Coba fetch pakai URL yang terakhir berhasil (Fast Path)
      try {
        const data = await fetchWithTimeout(activeUrlRef.current, 1000); // Timeout 1 detik
        if (isMounted) {
          setStats(data);
          setErrorMsg(null);
          success = true;
        }
      } catch (e) {
        // Jika gagal, jangan lakukan apa-apa, lanjut ke scanning
      }

      // 2. Jika URL terakhir gagal, coba scan semua URL di list (Auto Switch)
      if (!success) {
        for (const url of URL_LIST) {
          // Skip URL yang barusan kita coba dan gagal
          if (url === activeUrlRef.current) continue; 

          try {
            // Timeout pendek (500ms) saat scanning agar UI tidak lag
            const data = await fetchWithTimeout(url, 500); 
            if (isMounted) {
              setStats(data);
              setErrorMsg(null);
              activeUrlRef.current = url; // Simpan URL ini sebagai yang aktif
              success = true;
              break; // Berhenti looping jika sudah ketemu yang sukses
            }
          } catch (e) {
            // Lanjut ke URL berikutnya
          }
        }
      }

      if (isMounted) {
        if (!success) {
          setErrorMsg("Mencari Koneksi...");
        }
        setLoading(false);
      }
    };

    if (modalVisible) {
      setLoading(true);
      fetchData(); // Panggil langsung pertama kali
      intervalId = setInterval(fetchData, 1000); // Ulangi tiap 1 detik
    }

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [modalVisible]);

  // ... (Sisa kode Animasi, PanResponder, Render UI SAMA PERSIS) ...

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
                {/* Indikator URL yang Dipakai */}
                <View style={[styles.statusBadge, { backgroundColor: errorMsg ? '#FF3B30' : '#34C759' }]}>
                  <Text style={styles.statusText}>
                    {errorMsg ? 'RECONNECTING' : activeUrlRef.current.includes('localhost') ? 'USB (LOCAL)' : 'WI-FI'}
                  </Text>
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
                    {errorMsg || "Menunggu data..."}{"\n"}
                    Cek Kabel atau Wi-Fi.
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

// --- HELPER FETCH DENGAN TIMEOUT ---
async function fetchWithTimeout(url: string, timeout = 2000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    });
    clearTimeout(id);
    if (!response.ok) throw new Error("Server error");
    return await response.json();
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ... (Komponen StatRow dan Styles tetap sama, tidak perlu diubah) ...
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