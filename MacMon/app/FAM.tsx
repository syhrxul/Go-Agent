import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Vibration } from 'react-native';
import { Text, View } from '@/components/Themed';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';

// IP Address Mac Anda
const API_URL = 'http://192.168.0.198:8080/api/control';

// Warna Tema Modern
const Colors = {
  background: '#121212',
  card: '#1E1E1E',
  accent: '#0A84FF', // iOS Blue
  text: '#FFFFFF',
  textDim: '#888888',
  icon: '#CCCCCC'
};

export default function FAMScreen() {
  const [loading, setLoading] = useState(false);
  const [customApp, setCustomApp] = useState('');
  
  // State lokal untuk slider agar UI responsif instan
  const [volLevel, setVolLevel] = useState(50);
  const [briLevel, setBriLevel] = useState(50);

  // Fungsi Kirim Perintah ke Server
  const sendCommand = async (type: string, action: string, value?: number, name?: string) => {
    // Feedback getar kecil saat tombol ditekan
    Vibration.vibrate(10); 
    
    // Jangan set loading untuk slider agar tidak lag
    if (type !== 'volume' && type !== 'brightness') setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, action, value, name }),
      });

      if (!response.ok) throw new Error('Failed');
    } catch (error) {
      console.log("Error sending command:", error);
      // Optional: Alert hanya jika error kritikal
    } finally {
      setLoading(false);
    }
  };

  // Handler Slider (Dikirim hanya saat user melepas slider / onSlidingComplete)
  const handleVolumeChange = (val: number) => {
    setVolLevel(val); // Update UI
  };
  
  const sendVolume = (val: number) => {
    sendCommand('volume', 'set', Math.floor(val));
  };

  const handleBrightnessChange = (val: number) => {
    setBriLevel(val); // Update UI
  };

  const sendBrightness = (val: number) => {
    // Catatan: Pastikan server Go Anda mendukung logic 'set' untuk brightness
    // Jika belum, ini bisa diganti logika 'up'/'down' berulang
    sendCommand('brightness', 'set', Math.floor(val));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Control Center</Text>
            <Text style={styles.headerSubtitle}>Connected to MacBook Air</Text>
          </View>
          <View style={styles.statusIndicator}>
            {loading ? <ActivityIndicator size="small" color={Colors.accent} /> : <View style={styles.dotOnline} />}
          </View>
        </View>

        {/* --- SLIDERS SECTION --- */}
        <View style={styles.card}>
          {/* Volume Slider */}
          <View style={styles.sliderRow}>
            <Ionicons name="volume-low" size={24} color={Colors.icon} />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={volLevel}
              onValueChange={handleVolumeChange}
              onSlidingComplete={sendVolume}
              minimumTrackTintColor={Colors.accent}
              maximumTrackTintColor="#333"
              thumbTintColor="#FFF"
            />
            <Ionicons name="volume-high" size={24} color={Colors.icon} />
          </View>

          <View style={styles.divider} />

          {/* Brightness Slider */}
          <View style={styles.sliderRow}>
            <Ionicons name="sunny-outline" size={24} color={Colors.icon} />
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={briLevel}
              onValueChange={handleBrightnessChange}
              onSlidingComplete={sendBrightness}
              minimumTrackTintColor="#FFD60A"
              maximumTrackTintColor="#333"
              thumbTintColor="#FFF"
            />
            <Ionicons name="sunny" size={24} color={Colors.icon} />
          </View>
        </View>

        {/* --- MEDIA CONTROLS --- */}
        <View style={styles.mediaCard}>
          <Text style={styles.sectionLabel}>Media Control</Text>
          <View style={styles.mediaRow}>
            <TouchableOpacity style={styles.mediaBtnSmall} onPress={() => sendCommand('media', 'prev')}>
              <Ionicons name="play-skip-back" size={24} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaBtnLarge} onPress={() => sendCommand('media', 'playpause')}>
              <Ionicons name="play" size={32} color="#000" style={{marginLeft: 4}} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaBtnSmall} onPress={() => sendCommand('media', 'next')}>
              <Ionicons name="play-skip-forward" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- QUICK APPS GRID --- */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Quick Launch</Text>
          <View style={styles.appGrid}>
            <AppButton name="Finder" icon="folder" color="#2D9CDB" onPress={() => sendCommand('app', 'open', 0, 'Finder')} />
            <AppButton name="Safari" icon="compass" color="#2F80ED" onPress={() => sendCommand('app', 'open', 0, 'Safari')} />
            <AppButton name="Music" icon="musical-notes" color="#EB5757" onPress={() => sendCommand('app', 'open', 0, 'Music')} />
            <AppButton name="Terminal" icon="terminal" color="#333" onPress={() => sendCommand('app', 'open', 0, 'Terminal')} />
            <AppButton name="Settings" icon="settings" color="#828282" onPress={() => sendCommand('app', 'open', 0, 'System Settings')} />
            <AppButton name="Chrome" icon="globe" color="#F2C94C" onPress={() => sendCommand('app', 'open', 0, 'Google Chrome')} />
          </View>
        </View>

        {/* --- CUSTOM COMMAND --- */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Type app name to open..."
            placeholderTextColor="#666"
            value={customApp}
            onChangeText={setCustomApp}
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={() => {
              if (customApp) sendCommand('app', 'open', 0, customApp);
              setCustomApp('');
            }}
          >
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Komponen Tombol Aplikasi Kecil
const AppButton = ({ name, icon, color, onPress }: any) => (
  <TouchableOpacity style={[styles.appItem]} onPress={onPress}>
    <View style={[styles.appIconBg, { backgroundColor: color }]}>
      <Ionicons name={icon} size={24} color="#FFF" />
    </View>
    <Text style={styles.appText}>{name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textDim,
    marginTop: 2,
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotOnline: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981', // Green dot
    shadowColor: '#10B981',
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },

  // Cards & Sliders
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
  },
  slider: {
    flex: 1,
    marginHorizontal: 15,
    height: 40,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 10,
  },

  // Media
  mediaCard: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
  },
  mediaRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    marginTop: 15,
  },
  mediaBtnSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaBtnLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#FFF",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },

  // Apps
  sectionContainer: {
    marginBottom: 25,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDim,
    marginBottom: 15,
    marginLeft: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  appGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  appItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 10,
  },
  appIconBg: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  appText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500',
  },

  // Input
  inputCard: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: Colors.accent,
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});