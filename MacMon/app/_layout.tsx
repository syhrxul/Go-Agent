import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native'; // Import View
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

import DraggableButton from '@/components/DraggableButton';
import { useColorScheme } from '@/components/useColorScheme';

// Import Context
import { SplitScreenProvider, useSplitScreen } from '@/context/SplitContext';
import { PomodoroProvider } from '@/context/PomodoroContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  // Bungkus aplikasi dengan Provider yang dibutuhkan
  return (
    <SplitScreenProvider>
      <PomodoroProvider>
         <RootLayoutNav />
      </PomodoroProvider>
    </SplitScreenProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isSplitMode } = useSplitScreen(); 

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar hidden={true} />
      
      {/* Container Utama dengan Flexbox ROW (Untuk Split Kiri-Kanan) */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        
        {/* BAGIAN A: SIDEBAR PANEL (Muncul jika Split Mode Aktif) */}
        {isSplitMode && (
           <View style={{ flex: 0.25, borderRightWidth: 1, borderColor: '#ccc', backgroundColor: '#f2f2f7', zIndex: 10 }}> 
              {/* Render DraggableButton dalam mode 'split' di sini */}
              <DraggableButton mode="split" />
           </View>
        )}

        {/* BAGIAN B: APLIKASI UTAMA (Stack Navigasi) */}
        {/* Jika split aktif, lebar tinggal 75% (0.75), jika tidak full 100% (1) */}
        <View style={{ flex: isSplitMode ? 0.75 : 1 }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              <Stack.Screen name="pomodoro" options={{ presentation: 'card', title: 'Setting Pomodoro' }} />
            </Stack>
        </View>

        {/* BAGIAN C: FLOATING BUTTON (Muncul jika Split Mode MATI) */}
        {!isSplitMode && (
            <DraggableButton mode="floating" />
        )}
      </View>
      
    </ThemeProvider>
  );
}