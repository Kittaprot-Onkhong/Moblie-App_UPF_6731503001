// App.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { onAuthChanged, getUserProfile } from './core/services/firebase';
import { useUserStore } from './core/store/userStore';

import LoginScreen         from './features/login/LoginScreen';
import HomeScreen          from './features/home/screen';
import ProfileScreen       from './features/profile/screen';
import ProductDetailScreen from './features/product_detail/screen';
import { ForgotPasswordScreen, ResetPasswordScreen } from './features/login/ForgotPasswordScreen';

const BG    = '#0a0f0d';
const GREEN = '#2ecc71';
const MUTED = '#7a9982';
const Stack = createNativeStackNavigator();

export default function App() {
  const setUser   = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);

  // null = กำลังเช็ค | true = login แล้ว | false = ยังไม่ login
  const [authReady, setAuthReady] = useState<boolean | null>(null);

  useEffect(() => {
    // ❌ ลบ initialized.current ออก ทั้งหมด
    // onAuthStateChanged ต้องทำงานทุกครั้งที่ state เปลี่ยน รวมถึงตอน signOut
    const unsubscribe = onAuthChanged(async (firebaseUser: any) => {
      if (firebaseUser) {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          if (profile) {
            setUser(profile);
            setAuthReady(true);
          } else {
            clearUser();
            setAuthReady(false);
          }
        } catch {
          clearUser();
          setAuthReady(false);
        }
      } else {
        // signOut() จะ trigger เข้ามาตรงนี้ → clearUser → authReady=false → แสดง Login
        clearUser();
        setAuthReady(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (authReady === null) {
    return (
      <View style={s.splash}>
        <View style={s.splashCard}>
          <Text style={s.splashLogo}>🥗</Text>
          <Text style={s.splashTitle}>UPF</Text>
          <ActivityIndicator size="large" color={GREEN} style={{ marginTop: 24 }} />
          <Text style={s.splashSub}>กำลังโหลด...</Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={authReady ? 'Home' : 'Login'}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: BG },
          }}
        >
          <Stack.Screen name="Login"          component={LoginScreen} />
          <Stack.Screen name="Home"           component={HomeScreen} />
          <Stack.Screen name="Profile"        component={ProfileScreen} />
          <Stack.Screen name="ProductDetail"  component={ProductDetailScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword"  component={ResetPasswordScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const s = StyleSheet.create({
  splash: { flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' },
  splashCard: {
    alignItems: 'center', padding: 40, borderRadius: 24,
    backgroundColor: '#111a14', borderWidth: 1,
    borderColor: 'rgba(46,204,113,0.2)', minWidth: 200,
  },
  splashLogo:  { fontSize: 52, marginBottom: 8 },
  splashTitle: { fontSize: 36, fontWeight: '800', color: GREEN, letterSpacing: 4 },
  splashSub:   { fontSize: 13, color: MUTED, marginTop: 12 },
});