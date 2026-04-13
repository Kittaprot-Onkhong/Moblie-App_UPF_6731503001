import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, ScrollView, StatusBar,
  Animated, Easing, ActivityIndicator, Platform,
} from 'react-native';

let useUserStore: any = (sel: any) => sel({ setUser: () => {} });
let loginUser: any    = async () => ({ success: false, error: 'Firebase ยังไม่ได้ตั้งค่า' });
let registerUser: any = async () => ({ success: false, error: 'Firebase ยังไม่ได้ตั้งค่า' });
let signInWithGoogle: any = async () => ({ success: false, error: 'ไม่รองรับบนแพลตฟอร์มนี้' });
let signInWithGoogleCredential: any = async () => ({ success: false, error: 'ไม่รองรับบนแพลตฟอร์มนี้' });
let resetPassword: any = async () => ({ success: false, error: 'Firebase ยังไม่ได้ตั้งค่า' });

try { useUserStore = require('../../core/store/userStore').useUserStore; } catch {}
try {
  const fb = require('../../core/services/firebase');
  loginUser    = fb.loginUser    ?? loginUser;
  registerUser = fb.registerUser ?? registerUser;
  signInWithGoogle = fb.signInWithGoogle ?? signInWithGoogle;
  signInWithGoogleCredential = fb.signInWithGoogleCredential ?? signInWithGoogleCredential;
  resetPassword = fb.resetPassword ?? resetPassword;
} catch {}

let useGoogleAuthRequest: any = null;
try { useGoogleAuthRequest = require('expo-auth-session/providers/google').useAuthRequest; } catch {}

// ─── Dark Theme Colors ─────────────────────────────────────────
const BG        = '#0a0f0d';
const SURFACE   = '#111a14';
const SURFACE2  = '#162019';
const GREEN     = '#2ecc71';
const GREEN_MID = '#1a9e52';
const GREEN_DIM = 'rgba(46,204,113,0.12)';
const GREEN_GLOW= 'rgba(46,204,113,0.3)';
const RED_DIM   = 'rgba(255,107,107,0.12)';
const MUTED     = '#7a9982';
const TEXT      = '#e8f5ec';
const BORDER    = 'rgba(46,204,113,0.2)';
const WHITE     = '#fff';

const LoginScreen = ({ navigation }: any) => {
  const setUser = useUserStore((state: any) => state.setUser);

  const [name, setName]                 = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused]   = useState(false);
  const [nameFocused, setNameFocused]   = useState(false);
  const [isSignup, setIsSignup]         = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [errorMsg, setErrorMsg]         = useState('');
  const [successMsg, setSuccessMsg]     = useState('');

  const ANDROID_CLIENT_ID = '';
  const IOS_CLIENT_ID     = '';
  const WEB_CLIENT_ID     = '';

  const googleAuth = useGoogleAuthRequest
    ? useGoogleAuthRequest({ androidClientId: ANDROID_CLIENT_ID, iosClientId: IOS_CLIENT_ID, webClientId: WEB_CLIENT_ID } as any)
    : [null, null, async () => ({ type: 'cancel' })];
  const [request, response, promptAsync] = googleAuth;

  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(50)).current;
  const logoScale  = useRef(new Animated.Value(0.8)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const blob1Float = useRef(new Animated.Value(0)).current;
  const blob2Float = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 7, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, tension: 10, friction: 3, useNativeDriver: true }),
    ]).start();

    const loops = [
      Animated.loop(Animated.sequence([
        Animated.timing(logoRotate, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(blob1Float, { toValue: -15, duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(blob1Float, { toValue: 0,   duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(blob2Float, { toValue: -20, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(blob2Float, { toValue: 0,   duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])),
    ];
    loops.forEach(l => l.start());
  }, []);

  const logoRotateInterp = logoRotate.interpolate({ inputRange: [0,1], outputRange: ['0deg','5deg'] });

  useEffect(() => {
    if (!response || response.type !== 'success') return;
    const handle = async () => {
      const auth = (response as any).authentication;
      setIsLoading(true);
      try {
        const res = await signInWithGoogleCredential(auth?.idToken, auth?.accessToken);
        if (!res.success) throw new Error(res.error || 'Login failed');
        setUser({ name: res.user.name || res.user.email?.split('@')[0], email: res.user.email, avatar: '👤', memberSince: 'มกราคม 2026', scannedProducts: 0, favoriteProducts: 0, healthScore: 0 });
        navigation.replace('Home');
      } catch (err: any) {
        setErrorMsg(err.message || 'เข้าสู่ระบบด้วย Google ล้มเหลว');
      } finally {
        setIsLoading(false);
      }
    };
    handle();
  }, [response]);

  const handleLogin = async () => {
    setErrorMsg(''); setSuccessMsg(''); setIsLoading(true);
    try {
      if (isSignup) {
        if (!name || !email || !password) throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
        const result = await registerUser(email, password, name);
        if (!result.success) throw new Error(result.error || 'ลงทะเบียนล้มเหลว');
      } else {
        if (!email || !password) throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
        const result = await loginUser(email, password);
        if (!result.success) throw new Error(result.error || 'เข้าสู่ระบบล้มเหลว');
      }
      setUser({ name: isSignup ? name : email.split('@')[0], email, avatar: '👤', memberSince: 'มกราคม 2026', scannedProducts: 0, favoriteProducts: 0, healthScore: 0 });
      navigation.replace('Home');
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(''); setSuccessMsg('');
    if (Platform.OS === 'web') {
      setIsLoading(true);
      try {
        const result = await signInWithGoogle();
        if (!result.success) throw new Error(result.error || 'เข้าสู่ระบบด้วย Google ล้มเหลว');
        setUser({ name: result.user.name || result.user.email?.split('@')[0], email: result.user.email, avatar: '👤', memberSince: 'มกราคม 2026', scannedProducts: 0, favoriteProducts: 0, healthScore: 0 });
        navigation.replace('Home');
      } catch (err: any) {
        setErrorMsg(err.message || 'เกิดข้อผิดพลาด');
      } finally {
        setIsLoading(false);
      }
    } else {
      try { await promptAsync(); } catch {
        setErrorMsg('Google sign-in ไม่พร้อมใช้งาน');
      }
    }
  };

  const handleForgot = async () => {
    setErrorMsg(''); setSuccessMsg('');
    if (!email) { setErrorMsg('กรุณากรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน'); return; }
    setIsLoading(true);
    try {
      const res = await resetPassword(email);
      if (!res.success) throw new Error(res.error || 'ส่งอีเมลรีเซ็ตรหัสผ่านล้มเหลว');
      setSuccessMsg('ส่งอีเมลรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว ✅');
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = () => {
  setUser({
    name: 'Guest',
    email: 'guest@upf.app',
    avatar: '👤',
    memberSince: 'Guest',
    scannedProducts: 0,
    favoriteProducts: 0,
    healthScore: 0,
  });

  navigation.replace('Home');
};

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Ambient blobs */}
        <Animated.View style={[s.blobLarge,  { transform: [{ translateY: blob1Float }] }]} pointerEvents="none" />
        <Animated.View style={[s.blobSmall,  { transform: [{ translateY: blob2Float }] }]} pointerEvents="none" />
        <View style={s.circleA} pointerEvents="none" />
        <View style={s.circleB} pointerEvents="none" />

        {/* ── Logo ── */}
        <Animated.View style={[s.header, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: logoScale }, { rotate: logoRotateInterp }],
        }]}>
          <View style={s.logoWrap}>
            <Text style={s.logoEmoji}>🥗</Text>
          </View>
          <Text style={s.appName}>UPF</Text>
          <Text style={s.tagline}>รู้จักอาหารแปรรูปของคุณ</Text>
        </Animated.View>

        {/* ── Card ── */}
        <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Top glow line */}
          <View style={s.cardTopLine} />

          <Text style={s.welcome}>ยินดีต้อนรับกลับมา 👋</Text>
          <Text style={s.sub}>เข้าสู่ระบบเพื่อตรวจสอบฉลากอาหารและดูแลสุขภาพ</Text>

          {isSignup && (
            <View style={s.inputGroup}>
              <Text style={s.label}>ชื่อ</Text>
              <View style={[s.inputWrap, nameFocused && s.inputFocused]}>
                <Text style={s.inputIcon}>👤</Text>
                <TextInput
                  style={s.input} placeholder="กรอกชื่อของคุณ" placeholderTextColor={MUTED}
                  value={name} onChangeText={setName}
                  onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)}
                />
              </View>
            </View>
          )}

          <View style={s.inputGroup}>
            <Text style={s.label}>อีเมล</Text>
            <View style={[s.inputWrap, emailFocused && s.inputFocused]}>
              <Text style={s.inputIcon}>✉️</Text>
              <TextInput
                style={s.input} placeholder="กรอกอีเมลของคุณ" placeholderTextColor={MUTED}
                keyboardType="email-address" autoCapitalize="none"
                value={email} onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
              />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>รหัสผ่าน</Text>
            <View style={[s.inputWrap, passFocused && s.inputFocused]}>
              <Text style={s.inputIcon}>🔒</Text>
              <TextInput
                style={s.input} placeholder="กรอกรหัสผ่านของคุณ" placeholderTextColor={MUTED}
                secureTextEntry={!showPassword} value={password} onChangeText={setPassword}
                onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {errorMsg   ? <View style={s.errorBox}  ><Text style={s.errorText  }>⚠️ {errorMsg}</Text></View>   : null}
          {successMsg ? <View style={s.successBox}><Text style={s.successText}>✅ {successMsg}</Text></View> : null}

          <TouchableOpacity style={s.forgotBtn} onPress={handleForgot}>
            <Text style={s.forgotText}>ลืมรหัสผ่าน?</Text>
          </TouchableOpacity>

<TouchableOpacity
  style={s.guestBtn}
  onPress={handleGuest}
  activeOpacity={0.8}
>
  <Text style={s.guestText}> เข้าใช้งานแบบ Guest</Text>
</TouchableOpacity>

          <Animated.View style={{ transform: email && password ? [{ scale: pulseAnim }] : [] }}>
            <TouchableOpacity
              style={[s.btn, (isLoading || (isSignup && !name) || !email || !password) && s.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading || (isSignup && !name) || !email || !password}
              activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color={BG} />
                : <Text style={s.btnText}>{isSignup ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}</Text>
              }
            </TouchableOpacity>
          </Animated.View>

          <View style={s.divider}>
            <View style={s.divLine} /><Text style={s.divText}>หรือ</Text><View style={s.divLine} />
          </View>

          <TouchableOpacity style={s.googleBtn} onPress={handleGoogleSignIn}>
            <Text style={{ fontSize: 18 }}>🌐</Text>
            <Text style={s.googleText}>เข้าสู่ระบบด้วย Google</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Info */}
        <Animated.View style={[s.infoBox, { opacity: fadeAnim }]}>
          <Text style={s.infoText}>🔐 Firebase {isSignup ? 'ลงทะเบียน' : 'เข้าสู่ระบบ'} — ข้อมูลปลอดภัย</Text>
        </Animated.View>

        {/* Toggle Signup */}
        <Animated.View style={[s.signupRow, { opacity: fadeAnim }]}>
          {isSignup ? (
            <>
              <Text style={s.signupText}>มีบัญชีแล้ว? </Text>
              <TouchableOpacity onPress={() => { setIsSignup(false); setErrorMsg(''); setSuccessMsg(''); }}>
                <Text style={s.signupLink}>เข้าสู่ระบบ</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.signupText}>ยังไม่มีบัญชี? </Text>
              <TouchableOpacity onPress={() => { setIsSignup(true); setErrorMsg(''); setSuccessMsg(''); }}>
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
  container: { flex: 1, backgroundColor: BG },
  scroll:    { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },

  // Blobs
  blobLarge: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: GREEN, opacity: 0.07, top: -80, right: -80 },
  blobSmall: { position: 'absolute', width: 180, height: 180, borderRadius: 90,  backgroundColor: GREEN, opacity: 0.05, top: 120, right: 30 },
  circleA:   { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: GREEN, opacity: 0.04, bottom: 200, left: -40 },
  circleB:   { position: 'absolute', width: 60,  height: 60,  borderRadius: 30, backgroundColor: GREEN, opacity: 0.08, bottom: 80,  right: 60 },

  // Header
  header:   { alignItems: 'center', marginTop: 60, marginBottom: 30, zIndex: 1 },
  logoWrap: {
    width: 76, height: 76, borderRadius: 22, backgroundColor: GREEN_DIM,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: BORDER,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  logoEmoji: { fontSize: 34 },
  appName:   { fontSize: 38, fontWeight: '800', color: GREEN, letterSpacing: 4, marginBottom: 6 },
  tagline:   { fontSize: 13, color: MUTED },

  // Card
  card: {
    backgroundColor: SURFACE, borderRadius: 24, padding: 24, zIndex: 1,
    borderWidth: 1, borderColor: BORDER, marginBottom: 16, overflow: 'hidden',
  },
  cardTopLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    backgroundColor: GREEN, opacity: 0.7,
  },
  welcome: { fontSize: 20, fontWeight: '700', color: TEXT, marginBottom: 6, marginTop: 8 },
  sub:     { fontSize: 13, color: MUTED, lineHeight: 20, marginBottom: 22 },

  // Inputs
  inputGroup: { marginBottom: 16 },
  label:      { fontSize: 12, fontWeight: '600', color: MUTED, marginBottom: 8, letterSpacing: 0.5 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', height: 50,
    borderWidth: 1, borderColor: BORDER, borderRadius: 12,
    backgroundColor: SURFACE2, paddingHorizontal: 12,
  },
  inputFocused: {
    borderColor: GREEN,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input:     { flex: 1, fontSize: 14, color: TEXT },
  eyeBtn:    { padding: 4 },

  // Messages
  forgotBtn:   { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText:  { fontSize: 12, fontWeight: '700', color: GREEN },
  errorBox:    { backgroundColor: RED_DIM, borderRadius: 10, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#ff6b6b' },
  errorText:   { fontSize: 13, color: '#ff6b6b', fontWeight: '600' },
  successBox:  { backgroundColor: GREEN_DIM, borderRadius: 10, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: GREEN },
  successText: { fontSize: 13, color: GREEN, fontWeight: '600' },

  // Button
  btn: {
    height: 52, backgroundColor: GREEN, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 18,
    shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8,
  },
  btnDisabled: { backgroundColor: '#1a3d25', shadowOpacity: 0, elevation: 0 },
  btnText:     { color: BG, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  divLine: { flex: 1, height: 1, backgroundColor: BORDER },
  divText: { marginHorizontal: 12, fontSize: 12, color: MUTED },

  // Google
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 48, borderWidth: 1, borderColor: BORDER, borderRadius: 12,
    backgroundColor: SURFACE2, gap: 10,
  },
  googleText: { fontSize: 14, fontWeight: '600', color: TEXT },

  // Info
  infoBox: {
    backgroundColor: GREEN_DIM, borderLeftWidth: 3, borderLeftColor: GREEN,
    borderRadius: 10, padding: 12, paddingHorizontal: 16, marginBottom: 20, zIndex: 1,
    borderWidth: 1, borderColor: BORDER,
  },
  infoText: { fontSize: 12, color: GREEN, fontWeight: '600' },

  // Toggle
  signupRow:  { flexDirection: 'row', justifyContent: 'center', zIndex: 1 },
  signupText: { fontSize: 14, color: MUTED },
  signupLink: { fontSize: 14, color: GREEN, fontWeight: '800' },

  guestBtn: {
  height: 48,
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 12,
  borderWidth: 1,
  borderColor: BORDER,
  backgroundColor: 'transparent',
},

guestText: {
  color: GREEN,
  fontSize: 14,
  fontWeight: '700',
},

});

export default LoginScreen;