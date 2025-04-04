import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {Platform, StyleSheet} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { MyLightTheme, MyDarkTheme } from '@/constants/navigationThemes';
import NavBar from '@/components/NavBar';
import AsyncStorage from "@react-native-async-storage/async-storage";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";

SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {

      let userToken;
      if (Platform.OS === 'web'){
        let userToken = await asyncStorage.getItem('token');
      }else {
        let userToken = await SecureStore.getItemAsync('token');
      }
      if (userToken) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  const [fontsLoaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {

    if (fontsLoaded && isLoggedIn !== null) {
      if (isLoggedIn) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [fontsLoaded, isLoggedIn, router]);

  const hideNavbar = pathname === '/login' || pathname === '/register';

  const backgroundColor = useThemeColor({}, 'background');
  const navigationTheme = colorScheme === 'dark' ? MyDarkTheme : MyLightTheme;

  if (!fontsLoaded) {
    return null;
  }

  return (
      <SafeAreaProvider>
        <ThemeProvider value={navigationTheme}>
          <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <Slot />
            {!hideNavbar && <NavBar />}
          </SafeAreaView>

          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
