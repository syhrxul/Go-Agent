import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface PowerPanelProps {
  activeUrl: string; // Menerima URL aktif dari DraggableButton
}

export default function PowerPanel({ activeUrl }: PowerPanelProps) {

  // Helper untuk membersihkan URL (menghapus endpoint /stats-json)
  const getBaseUrl = () => {
    if (!activeUrl) return 'http://localhost:8080'; // Fallback default
    return activeUrl.replace('/stats-json', '');
  };

  const handleAction = async (action: 'restart' | 'sleep' | 'shutdown') => {
    // Konfirmasi sebelum eksekusi
    Alert.alert(
      `Konfirmasi ${action.toUpperCase()}`,
      `Apakah Anda yakin ingin melakukan ${action} pada Mac?`,
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya", 
          style: "destructive",
          onPress: async () => {
            try {
              const baseUrl = getBaseUrl();
              // Endpoint backend yang sesuai dengan handlers/action.go
              const response = await fetch(`${baseUrl}/api/action/${action}`, { method: 'POST' });
              
              if (response.ok) {
                Alert.alert("Sukses", `Perintah ${action} telah dikirim.`);
              } else {
                Alert.alert("Gagal", `Server merespon dengan error saat mencoba ${action}.`);
              }
            } catch (error) {
              Alert.alert("Koneksi Error", "Tidak dapat menghubungi server Agent.");
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Power Control</Text>
      
      <View style={styles.grid}>
        
        {/* Tombol Sleep */}
        <TouchableOpacity style={[styles.btn, {backgroundColor:'#FF9500'}]} onPress={() => handleAction('sleep')}>
          <FontAwesome name="moon-o" size={20} color="white" />
          <Text style={styles.btnText}>Sleep</Text>
        </TouchableOpacity>

        {/* Tombol Restart */}
        <TouchableOpacity style={[styles.btn, {backgroundColor:'#007AFF'}]} onPress={() => handleAction('restart')}>
          <FontAwesome name="refresh" size={20} color="white" />
          <Text style={styles.btnText}>Restart</Text>
        </TouchableOpacity>

        {/* Tombol Shutdown */}
        <TouchableOpacity style={[styles.btn, {backgroundColor:'#FF3B30'}]} onPress={() => handleAction('shutdown')}>
          <FontAwesome name="power-off" size={20} color="white" />
          <Text style={styles.btnText}>Shutdown</Text>
        </TouchableOpacity>

      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 15,
    // Margin dihapus/dikurangi agar pas di dalam DraggableButton split container
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#555',
    marginBottom: 15,
    textAlign: 'left' // Rata kiri agar sejajar dengan panel lain
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // Sedikit lebih ramping
    borderRadius: 10,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 11,
    marginTop: 5
  },
  info: {
    marginTop: 10,
    fontSize: 9,
    color: '#aaa',
    textAlign: 'center',
    fontStyle: 'italic'
  }
});