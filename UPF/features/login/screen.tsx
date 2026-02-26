import React, { useState, useEffect, useRef } from 'react';
import { useUserStore } from '../../core/store/userStore';
import { loginUser, registerUser } from '../../core/services/firebase';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, ScrollView, StatusBar,
  Animated, Easing, ActivityIndicator,
} from 'react-native';

// ─── Brand colours ─────────────────────────────────────────
const GREEN        = '#3BAD45';
const GREEN_MID    = '#2E9438';
const GREEN_LIGHT  = '#E8F7E9';
const ORANGE       = '#F5821F';
const ORANGE_LIGHT = '#FFF3E8';
const TEXT_DARK    = '#1A1A1A';
const TEXT_MID     = '#666';
const TEXT_LIGHT   = '#aaa';
const BORDER       = '#E5E5E5';
const WHITE        = '#fff';


const LoginScreen = ({ navigation }: any) => {
  const setUser = useUserStore(state => state.setUser);
  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused,  setPassFocused]  = useState(false);
  const [nameFocused, setNameFocused]   = useState(false);
  const [isSignup, setIsSignup]         = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [errorMsg, setErrorMsg]         = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const blob1Float = useRef(new Animated.Value(0)).current;
  const blob2Float = useRef(new Animated.Value(0)).current;
  const blob3Float = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating blobs - เปลี่ยนจาก Easing.sine เป็น Easing.ease
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Float, {
          toValue: -15,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blob1Float, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Float, {
          toValue: -20,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blob2Float, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob3Float, {
          toValue: -10,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(blob3Float, {
          toValue: 0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for login button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
  });

  /*const handleLogin = () => {
    if (email && password) {
      // Button press animation
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      navigation.navigate('Home');
    }
  };*/
  const handleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isSignup) {
        // ลงทะเบียนผู้ใช้ใหม่
        if (!name || !email || !password) {
          throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        }
        const result = await registerUser(email, password, name);
        if (!result.success) {
          throw new Error(result.error || 'ลงทะเบียนล้มเหลว');
        }
      } else {
        // เข้าสู่ระบบ
        if (!email || !password) {
          throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
        }
        const result = await loginUser(email, password);
        if (!result.success) {
          throw new Error(result.error || 'เข้าสู่ระบบล้มเหลว');
        }
      }

      // บันทึกข้อมูลผู้ใช้ใน Zustand
      setUser({
        name: isSignup ? name : email.split('@')[0],
        email: email,
        avatar: '👤',
        memberSince: 'มกราคม 2026',
        scannedProducts: 0,
        favoriteProducts: 0,
        healthScore: 0,
      });

      navigation.replace('Home');
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative blobs with animation */}
        <Animated.View style={[s.blobLarge, { 
          transform: [{ translateY: blob1Float }] 
        }]} pointerEvents="none" />
        <Animated.View style={[s.blobSmall, { 
          transform: [{ translateY: blob2Float }] 
        }]} pointerEvents="none" />
        <Animated.View style={[s.blobMedium, { 
          transform: [{ translateY: blob3Float }] 
        }]} pointerEvents="none" />

        {/* Extra decorative circles */}
        <View style={s.circleOrange1} pointerEvents="none" />
        <View style={s.circleGreen1} pointerEvents="none" />
        <View style={s.circleOrange2} pointerEvents="none" />
        <View style={s.circleGreen2} pointerEvents="none" />

        {/* ── Header with animation ── */}
        <Animated.View style={[s.header, {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: logoScale },
            { rotate: logoRotateInterpolate },
          ],
        }]}>
          <View style={s.logoWrap}>
            <Text style={s.logoEmoji}>🥗</Text>
          </View>
          <Text style={s.appName}>UPF</Text>
          <Text style={s.tagline}>รู้จักอาหารแปรรูปของคุณ</Text>
        </Animated.View>

        {/* ── Card with animation ── */}
        <Animated.View style={[s.card, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>
          <Text style={s.welcome}>ยินดีต้อนรับกลับมา 👋</Text>
          <Text style={s.sub}>
            เข้าสู่ระบบเพื่อตรวจสอบฉลากอาหารและดูแลสุขภาพ
          </Text>

          {/* Name */}
          {isSignup && (
            <View style={s.inputGroup}>
              <Text style={s.label}>ชื่อ</Text>
              <View style={[
                s.inputWrap,
                nameFocused && s.inputFocused,
                nameFocused && s.inputFocusedGreen,
              ]}>
                <Text style={s.inputIcon}>👤</Text>
                <TextInput
                  style={s.input}
                  placeholder="กรอกชื่อของคุณ"
                  placeholderTextColor="#bbb"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                />
              </View>
            </View>
          )}

          {/* Email */}
          <View style={s.inputGroup}>
            <Text style={s.label}>อีเมล</Text>
            <View style={[
              s.inputWrap, 
              emailFocused && s.inputFocused,
              emailFocused && s.inputFocusedGreen
            ]}>
              <Text style={s.inputIcon}>✉️</Text>
              <TextInput
                style={s.input}
                placeholder="กรอกอีเมลของคุณ"
                placeholderTextColor="#bbb"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          {/* Password */}
          <View style={s.inputGroup}>
            <Text style={s.label}>รหัสผ่าน</Text>
            <View style={[
              s.inputWrap, 
              passFocused && s.inputFocused,
              passFocused && s.inputFocusedOrange
            ]}>
              <Text style={s.inputIcon}>🔒</Text>
              <TextInput
                style={s.input}
                placeholder="กรอกรหัสผ่านของคุณ"
                placeholderTextColor="#bbb"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>⚠️ {errorMsg}</Text>
            </View>
          ) : null}

          {/* Forgot */}
          <TouchableOpacity style={s.forgotBtn}>
            <Text style={s.forgotText}>ลืมรหัสผ่าน?</Text>
          </TouchableOpacity>

          {/* Login/Signup Button with loading */}
          <Animated.View style={{ 
            transform: email && password ? [{ scale: pulseAnim }] : []
          }}>
            <TouchableOpacity
              style={[s.btn, (isLoading || (isSignup && !name) || !email || !password) && s.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading || (isSignup && !name) || !email || !password}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={WHITE} />
              ) : (
                <Text style={s.btnText}>{isSignup ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.divLine} />
            <Text style={s.divText}>หรือ</Text>
            <View style={s.divLine} />
          </View>

          {/* Social Login */}
          <View style={s.socialRow}>
            <TouchableOpacity style={s.socialBtn}>
              <Text style={{ fontSize: 18 }}>🍎</Text>
              <Text style={s.socialText}>Apple</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.socialBtn}>
              <Text style={{ fontSize: 18 }}>🌐</Text>
              <Text style={s.socialText}>Google</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Demo notice */}
        <Animated.View style={[s.demo, {
          opacity: fadeAnim,
        }]}>
          <Text style={s.demoText}>� Firebase {isSignup ? 'ลงทะเบียน' : 'เข้าสู่ระบบ'} - ข้อมูลปลอดภัย</Text>
        </Animated.View>

        {/* Toggle Login/Signup */}
        <Animated.View style={[s.signupRow, {
          opacity: fadeAnim,
        }]}>
          {isSignup ? (
            <>
              <Text style={s.signupText}>มีบัญชีแล้ว? </Text>
              <TouchableOpacity onPress={() => { setIsSignup(false); setErrorMsg(''); }}>
                <Text style={s.signupLink}>เข้าสู่ระบบ</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.signupText}>ยังไม่มีบัญชี? </Text>
              <TouchableOpacity onPress={() => { setIsSignup(true); setErrorMsg(''); }}>
                <Text style={s.signupLink}>สมัครสมาชิก</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: WHITE },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 32 },

  // blobs with more colors
  blobLarge: {
    position: 'absolute', width: 220, height: 220, borderRadius: 110,
    backgroundColor: GREEN_LIGHT, opacity: 0.8, top: -60, right: -60,
  },
  blobSmall: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: ORANGE_LIGHT, opacity: 0.9, top: 60, right: 20,
  },
  blobMedium: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: GREEN_LIGHT, opacity: 0.6, bottom: 100, left: -50,
  },

  // Extra decorative circles
  circleOrange1: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    backgroundColor: ORANGE, opacity: 0.15, top: 180, left: 30,
  },
  circleGreen1: {
    position: 'absolute', width: 40, height: 40, borderRadius: 20,
    backgroundColor: GREEN, opacity: 0.2, top: 350, right: 50,
  },
  circleOrange2: {
    position: 'absolute', width: 80, height: 80, borderRadius: 40,
    backgroundColor: ORANGE_LIGHT, opacity: 0.7, bottom: 200, right: -20,
  },
  circleGreen2: {
    position: 'absolute', width: 50, height: 50, borderRadius: 25,
    backgroundColor: GREEN_LIGHT, opacity: 0.8, bottom: 50, left: 40,
  },

  // header
  header: { alignItems: 'center', marginTop: 56, marginBottom: 28, zIndex: 1 },
  logoWrap: {
    width: 72, height: 72, borderRadius: 20, 
    backgroundColor: GREEN_LIGHT,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    borderWidth: 2,
    borderColor: GREEN,
  },
  logoEmoji: { fontSize: 34 },
  appName: { 
    fontSize: 36, fontWeight: '800', color: GREEN, letterSpacing: 3, marginBottom: 4,
  },
  tagline: { fontSize: 12.5, color: TEXT_LIGHT },

  // card
  card: {
    backgroundColor: WHITE, borderRadius: 24, padding: 24, zIndex: 1,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 6, marginBottom: 14,
    borderWidth: 1,
    borderColor: GREEN_LIGHT,
  },
  welcome: { fontSize: 22, fontWeight: '700', color: TEXT_DARK, marginBottom: 6 },
  sub: { fontSize: 13, color: TEXT_MID, lineHeight: 20, marginBottom: 22 },

  // inputs
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: TEXT_DARK, marginBottom: 8 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', height: 50,
    borderWidth: 2, borderColor: BORDER, borderRadius: 12,
    backgroundColor: '#FAFAFA', paddingHorizontal: 12,
  },
  inputFocused: { 
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputFocusedGreen: { 
    borderColor: GREEN, 
    backgroundColor: GREEN_LIGHT,
  },
  inputFocusedOrange: { 
    borderColor: ORANGE, 
    backgroundColor: ORANGE_LIGHT,
    shadowColor: ORANGE,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: TEXT_DARK },
  eyeBtn: { padding: 4 },

  // forgot
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontSize: 12, fontWeight: '700', color: ORANGE },

  // button
  btn: {
    height: 52, backgroundColor: GREEN, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    borderWidth: 2,
    borderColor: GREEN_MID,
  },
  btnDisabled: { 
    backgroundColor: '#C8E6CA', 
    shadowOpacity: 0, 
    elevation: 0,
    borderColor: BORDER,
  },
  btnText: { color: WHITE, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  // error message
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  errorText: { fontSize: 13, color: '#C0392B', fontWeight: '600' },

  // divider
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  divLine: { flex: 1, height: 1, backgroundColor: BORDER },
  divText: { marginHorizontal: 12, fontSize: 12, color: TEXT_LIGHT },

  // social
  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 46, borderWidth: 2, borderColor: ORANGE_LIGHT, borderRadius: 12,
    backgroundColor: WHITE, gap: 8,
  },
  socialText: { fontSize: 14, fontWeight: '600', color: TEXT_DARK },

  // demo
  demo: {
    backgroundColor: ORANGE_LIGHT, borderLeftWidth: 4, borderLeftColor: ORANGE,
    borderRadius: 10, padding: 10, paddingHorizontal: 14, marginBottom: 18, zIndex: 1,
    borderWidth: 1,
    borderColor: ORANGE,
  },
  demoText: { fontSize: 12, color: ORANGE, fontWeight: '600', lineHeight: 18 },

  // signup
  signupRow: { flexDirection: 'row', justifyContent: 'center', zIndex: 1 },
  signupText: { fontSize: 14, color: TEXT_MID },
  signupLink: { fontSize: 14, color: GREEN, fontWeight: '800' },
});

export default LoginScreen;