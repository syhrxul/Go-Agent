// app/_layout.tsx
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native'; // Jangan lupa import View
import 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

import DraggableButton from '@/components/DraggableButton';
import { useColorScheme } from '@/components/useColorScheme';
// Import Context
import { SplitScreenProvider, useSplitScreen } from '@/context/SplitContext';

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
    <SplitScreenProvider>
       <RootLayoutNav />
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
        
        {isSplitMode && (
           <View style={{ flex: 0.25, borderRightWidth: 1, borderColor: '#ccc' }}> 
              <DraggableButton mode="split" />
           </View>
        )}

        <View style={{ flex: isSplitMode ? 0.75 : 1 }}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
        </View>

        {!isSplitMode && (
            <DraggableButton mode="floating" />
        )}
      </View>
      
    </ThemeProvider>
  );
}