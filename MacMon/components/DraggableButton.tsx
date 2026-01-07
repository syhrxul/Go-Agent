import React, { useRef, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, PanResponder, Animated, TouchableOpacity, 
  Modal, Button, Dimensions, ActivityIndicator 
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useSplitScreen } from '@/context/SplitContext'; 
import { SystemStats } from './types';

import MonitorPanel from './MonitorPanel';
import ProcessPanel from './ProcessPanel';

const BUTTON_SIZE = 60; 
const MARGIN_TEPI = 20;
const MARGIN_ATAS = 40;
const MARGIN_BAWAH = 40;

const WIFI_IP = '192.168.0.198'; 
const PORT = '8080';
const ENDPOINT = '/stats-json'; 

const URL_LIST = [
  `http://localhost:${PORT}${ENDPOINT}`,       
  `http://${WIFI_IP}:${PORT}${ENDPOINT}`,     
];

async function fetchWithTimeout(url: string, timeout = 2000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { 'Cache-Control': 'no-cache' } });
      clearTimeout(id);
      if (!response.ok) throw new Error("Server error");
      return await response.json();
    } catch (error) { clearTimeout(id); throw error; }
}

export default function DraggableButton({ mode = 'floating' }: { mode?: 'floating' | 'split' }) {
  const { setSplitMode } = useSplitScreen();
  
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [statsModalVisible, setStatsModalVisible] = useState(false); 
  const [activeTab, setActiveTab] = useState<'monitor' | 'processes'>('monitor'); 

  const lastPress = useRef(0);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const activeUrlRef = useRef(URL_LIST[0]); 

  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
  const pan = useRef(new Animated.ValueXY({ x: MARGIN_TEPI, y: 100 })).current;
  const val = useRef({ x: MARGIN_TEPI, y: 100 }); 
  pan.addListener((value) => (val.current = value));
  const modalScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    let isMounted = true;
    
    const shouldFetch = statsModalVisible || (mode === 'split' && activeTab === 'monitor');

    const fetchData = async () => {
      let success = false;
      try {
        const data = await fetchWithTimeout(activeUrlRef.current, 1000);
        if (isMounted) { setStats(data); setErrorMsg(null); success = true; }
      } catch (e) {}

      if (!success) {
        for (const url of URL_LIST) {
          if (url === activeUrlRef.current) continue; 
          try {
            const data = await fetchWithTimeout(url, 500); 
            if (isMounted) {
              setStats(data); setErrorMsg(null); activeUrlRef.current = url; success = true; break; 
            }
          } catch (e) {}
        }
      }
      if (isMounted) { if (!success) setErrorMsg("Mencari Koneksi..."); setLoading(false); }
    };

    if (shouldFetch) {
      setLoading(true); fetchData(); 
      intervalId = setInterval(fetchData, 1000); 
    }
    return () => { isMounted = false; if (intervalId) clearInterval(intervalId); };
  }, [statsModalVisible, mode, activeTab]);

  const handlePress = () => {
    const now = Date.now();
    if (now - lastPress.current < 300) {
      if (clickTimer.current) clearTimeout(clickTimer.current);
      setSplitMode(true); 
    } else {
      lastPress.current = now;
      clickTimer.current = setTimeout(() => {
        setStatsModalVisible(true); 
        Animated.spring(modalScale, { toValue: 1, useNativeDriver: true }).start();
      }, 300);
    }
  };

  if (mode === 'split') {
    return (
      <View style={styles.splitContainer}>
        <View style={styles.splitHeaderRow}>
            <View style={{flexDirection: 'row'}}>
                <TabButton title="Monitor" active={activeTab === 'monitor'} onPress={() => setActiveTab('monitor')} />
                <TabButton title="Processes" active={activeTab === 'processes'} onPress={() => setActiveTab('processes')} />
            </View>
            <TouchableOpacity onPress={() => setSplitMode(false)} style={styles.closeSplitButton}>
                <FontAwesome name="times" size={14} color="white" />
            </TouchableOpacity>
        </View>

        <View style={{flex: 1, marginTop: 5}}>
            {activeTab === 'monitor' ? (
                <MonitorPanel stats={stats} loading={loading} errorMsg={errorMsg} />
            ) : (
                <ProcessPanel activeUrl={activeUrlRef.current} />
            )}
        </View>
      </View>
    );
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => { pan.setOffset({ x: val.current.x, y: val.current.y }); pan.setValue({ x: 0, y: 0 }); },
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
        <TouchableOpacity style={styles.floatingButton} onPress={handlePress} activeOpacity={0.8}>
          <FontAwesome name="apple" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      <Modal transparent={true} visible={statsModalVisible} onRequestClose={() => setStatsModalVisible(false)} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalView, { transform: [{ scale: modalScale }] }]}>
            <Text style={styles.modalTitle}>Quick Stats</Text>
            <View style={{height: 300, width: '100%'}}> 
                 <MonitorPanel stats={stats} loading={loading} errorMsg={errorMsg} />
            </View>
            <View style={{marginTop:10, width:'100%'}}>
                <Button title="Tutup" onPress={() => setStatsModalVisible(false)} color="#888" />
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

function TabButton({title, active, onPress}: any) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.tabButton, active && styles.tabActive]}>
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
  absoluteContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, pointerEvents: 'box-none' },
  floatingButton: { backgroundColor: '#007AFF', width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalView: { width: 340, backgroundColor: '#f2f2f7', borderRadius: 20, padding: 15, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },

  splitContainer: { width: '100%', height: '100%', backgroundColor: '#f2f2f7', borderBottomWidth: 1, borderColor: '#ccc', padding: 8, paddingTop: 10 },
  splitHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#e5e5e5', paddingBottom: 5 },
  closeSplitButton: { backgroundColor: '#FF3B30', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  tabButton: { paddingVertical: 5, paddingHorizontal: 15, borderRadius: 15, backgroundColor: '#e0e0e0', marginRight: 8 },
  tabActive: { backgroundColor: '#007AFF' },
  tabText: { fontSize: 12, color: '#555', fontWeight: '600' },
  tabTextActive: { color: 'white' },
});