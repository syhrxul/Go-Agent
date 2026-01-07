import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

import DraggableButton from '@/components/DraggableButton';
import { useColorScheme } from '@/components/useColorScheme';

// --- IMPORT CONTEXT ---
import { SplitScreenProvider, useSplitScreen } from '@/context/SplitContext';
import { PomodoroProvider } from '@/context/PomodoroContext';
import { FinanceProvider } from '@/context/FinanceContext'; // <--- BARU

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = { initialRouteName: '(tabs)' };

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => { if (error) throw error; }, [error]);
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  if (!loaded) return null;

  return (
    // BUNGKUS DENGAN SEMUA PROVIDER
    <SplitScreenProvider>
      <PomodoroProvider>
        <FinanceProvider> 
           <RootLayoutNav />
        </FinanceProvider>
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
      
      <View style={{ flex: 1, flexDirection: 'row' }}>
        
        {/* SIDEBAR (SPLIT MODE) */}
        {isSplitMode && (
           <View style={{ flex: 0.25, borderRightWidth: 1, borderColor: '#ccc', backgroundColor: '#f2f2f7', zIndex: 10 }}> 
              <DraggableButton mode="split" />
           </View>
        )}

        {/* MAIN APP AREA */}
        <View style={{ flex: isSplitMode ? 0.75 : 1 }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              
              {/* POMODORO SCREENS */}
              <Stack.Screen name="pomodoro" options={{ presentation: 'card', title: 'Setting Pomodoro' }} />
              <Stack.Screen name="pomodoro-fullscreen" options={{ presentation: 'fullScreenModal', headerShown: false }} />
              
              {/* KEUANGAN SCREEN (BARU) */}
              <Stack.Screen name="finance" options={{ presentation: 'card', title: 'Keuangan' }} />
            </Stack>
        </View>

        {/* FLOATING BUTTON (NORMAL MODE) */}
        {!isSplitMode && (
            <DraggableButton mode="floating" />
        )}
      </View>
      
    </ThemeProvider>
  );
}