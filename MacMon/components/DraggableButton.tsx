import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, TouchableOpacity, Modal, Button, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const BUTTON_SIZE = 60; // Ukuran tombol

// KONFIGURASI JARAK AMAN
const MARGIN_TEPI = 20; // Jarak dari pinggir kiri/kanan frame
const MARGIN_ATAS = 40; // Jarak aman dari atas (agar tidak kena status bar)
const MARGIN_BAWAH = 40; // Jarak aman dari bawah

export default function DraggableButton() {
  const [modalVisible, setModalVisible] = useState(false);
  
  // Dapatkan dimensi layar saat ini
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

  // Posisi awal tombol (x=MARGIN_TEPI, y=100)
  const pan = useRef(new Animated.ValueXY({ x: MARGIN_TEPI, y: 100 })).current;

  // Variabel bantu untuk menyimpan nilai koordinat terakhir
  const val = useRef({ x: MARGIN_TEPI, y: 100 }); 

  // Listener untuk update posisi secara realtime
  pan.addListener((value) => (val.current = value));

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Hanya aktif drag jika geser lebih dari 5px (supaya klik biasa tetap jalan)
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: val.current.x,
          y: val.current.y,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gestureState) => {
        pan.flattenOffset();
        
        // --- LOGIKA SNAP & BATAS (BOUNDARY) ---
        
        // 1. Logika Horizontal (Kiri / Kanan)
        const currentX = val.current.x;
        let targetX = 0;
        
        // Cek apakah tombol ada di paruh kanan layar?
        if (currentX + BUTTON_SIZE / 2 > SCREEN_WIDTH / 2) {
            // SNAP KE KANAN (Dikurangi Margin)
            targetX = SCREEN_WIDTH - BUTTON_SIZE - MARGIN_TEPI; 
        } else {
            // SNAP KE KIRI (Ditambah Margin)
            targetX = MARGIN_TEPI; 
        }

        // 2. Logika Vertikal (Atas / Bawah)
        let targetY = val.current.y;
        
        // Batas Atas
        if (targetY < MARGIN_ATAS) {
            targetY = MARGIN_ATAS; 
        } 
        // Batas Bawah
        else if (targetY > SCREEN_HEIGHT - BUTTON_SIZE - MARGIN_BAWAH) {
            targetY = SCREEN_HEIGHT - BUTTON_SIZE - MARGIN_BAWAH;
        }

        // 3. Jalankan Animasi
        Animated.spring(pan, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          friction: 6, // Kekenyalan animasi
          tension: 40
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.absoluteContainer} pointerEvents="box-none">
      <Animated.View
        style={{
          transform: pan.getTranslateTransform(),
        }}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.floatingButton} 
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <FontAwesome name="apple" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Performa Mac</Text>
            <Text style={styles.modalText}>
              CPU Load: 15% {'\n'}
              Memory: 8GB / 16GB {'\n'}
              Temp: 45°C
            </Text>
            <Button title="Tutup" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    pointerEvents: 'box-none',
  },
  floatingButton: {
    backgroundColor: '#007AFF',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});