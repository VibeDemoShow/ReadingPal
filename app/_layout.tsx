import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { AppProvider } from '@/lib/AppContext';
import { ProviderContextProvider, useProvider } from '@/lib/providers/ProviderContext';
import { AuthUser } from '@/lib/providers/types';
import { AppColors } from '@/constants/Colors';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const ReadingPalTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: AppColors.primary,
    background: AppColors.background,
    card: AppColors.surface,
    text: AppColors.textPrimary,
    border: AppColors.border,
  },
};

// Inner layout that handles auth-based routing
function RootLayoutNav() {
  const { auth } = useProvider();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined); // undefined = loading
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });
    return unsubscribe;
  }, [auth]);

  useEffect(() => {
    if (user === undefined) return; // Still loading

    const inLoginScreen = (segments[0] as string) === 'login';

    if (!user && !inLoginScreen) {
      // Not logged in, redirect to login
      router.replace('/login' as any);
    } else if (user && inLoginScreen) {
      // Logged in, redirect to home
      router.replace('/(tabs)' as any);
    }
  }, [user, segments]);

  return (
    <ThemeProvider value={ReadingPalTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

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

  return (
    <ProviderContextProvider>
      <AppProvider>
        <RootLayoutNav />
      </AppProvider>
    </ProviderContextProvider>
  );
}
