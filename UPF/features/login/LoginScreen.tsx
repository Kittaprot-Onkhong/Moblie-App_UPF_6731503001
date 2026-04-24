// screens/LoginScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Image } from 'react-native';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, TextInput, ScrollView, StatusBar,
  Animated, Easing, ActivityIndicator, Platform,
  
} from 'react-native';
import {
  loginUser, registerUser, signInWithGoogle,
  signInWithGoogleCredential,
} from '../../core/services/firebase';


let useUserStore: any = (sel: any) => sel({ setUser: () => {} });
try { useUserStore = require('../../core/store/userStore').useUserStore; } catch {}

let useGoogleAuthRequest: any = null;
try { useGoogleAuthRequest = require('expo-auth-session/providers/google').useAuthRequest; } catch {}

const BG = '#0a0f0d', SURFACE = '#111a14', SURFACE2 = '#162019';
const GREEN = '#2ecc71', GREEN_DIM = 'rgba(46,204,113,0.12)';
const RED_DIM = 'rgba(255,107,107,0.12)', MUTED = '#7a9982', TEXT = '#e8f5ec';
const BORDER = 'rgba(46,204,113,0.2)';

const LoginScreen = ({ navigation }: any) => {
  const setUser = useUserStore((s: any) => s.setUser);

  const [isSignup, setIsSignup]               = useState(false);
  const [name, setName]                       = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [errorMsg, setErrorMsg]               = useState('');
  const [successMsg, setSuccessMsg]           = useState('');
  const [nameFocused, setNameFocused]         = useState(false);
  const [emailFocused, setEmailFocused]       = useState(false);
  const [passFocused, setPassFocused]         = useState(false);
  const [confirmFocused, setConfirmFocused]   = useState(false);

  const googleAuth = useGoogleAuthRequest
    ? useGoogleAuthRequest({ androidClientId: '', iosClientId: '', webClientId: '' } as any)
    : [null, null, async () => ({ type: 'cancel' })];
  const [, response, promptAsync] = googleAuth;

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
    [
      Animated.loop(Animated.sequence([Animated.timing(logoRotate, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }), Animated.timing(logoRotate, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })])),
      Animated.loop(Animated.sequence([Animated.timing(blob1Float, { toValue: -15, duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }), Animated.timing(blob1Float, { toValue: 0, duration: 3500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })])),
      Animated.loop(Animated.sequence([Animated.timing(blob2Float, { toValue: -20, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }), Animated.timing(blob2Float, { toValue: 0, duration: 4500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })])),
      Animated.loop(Animated.sequence([Animated.timing(pulseAnim, { toValue: 1.04, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }), Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true })])),
    ].forEach(l => l.start());
  }, []);

  const logoRotateInterp = logoRotate.interpolate({ inputRange: [0,1], outputRange: ['0deg','5deg'] });

  // Google native response
  useEffect(() => {
    if (!response || response.type !== 'success') return;
    (async () => {
      const auth = (response as any).authentication;
      setIsLoading(true);
      try {
        const res = await signInWithGoogleCredential(auth?.idToken, auth?.accessToken);
        if (!res.success) throw new Error(res.error);
        setUser(res.user);
        navigation.replace('Home');
      } catch (err: any) { setErrorMsg(err.message); }
      finally { setIsLoading(false); }
    })();
  }, [response]);

  const handleLogin = async () => {
    setErrorMsg(''); setSuccessMsg(''); setIsLoading(true);
    try {
      if (!email.trim() || !password) throw new Error('กรุณากรอกอีเมลและรหัสผ่าน');
      const result = await loginUser(email.trim(), password);
      if (!result.success) throw new Error(result.error);
      setUser(result.user);
      navigation.replace('Home');
    } catch (err: any) { setErrorMsg(err.message); }
    finally { setIsLoading(false); }
  };

  const handleRegister = async () => {
    setErrorMsg(''); setSuccessMsg(''); setIsLoading(true);
    try {
      if (!name.trim() || !email.trim() || !password || !confirmPassword)
        throw new Error('กรุณากรอกข้อมูลให้ครบถ้วน');
      if (password.length < 6) throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      if (password !== confirmPassword) throw new Error('รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่');
      const result = await registerUser(email.trim(), password, name.trim());
      if (!result.success) throw new Error(result.error);
      setUser(result.user);
      navigation.replace('Home');
    } catch (err: any) { setErrorMsg(err.message); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    if (Platform.OS === 'web') {
      setIsLoading(true);
      try {
        const result = await signInWithGoogle();
        if (!result.success) throw new Error(result.error);
        setUser(result.user);
        navigation.replace('Home');
      } catch (err: any) { setErrorMsg(err.message); }
      finally { setIsLoading(false); }
    } else {
      try { await promptAsync(); } catch { setErrorMsg('Google sign-in ไม่พร้อมใช้งาน'); }
    }
  };

  const handleGuest = () => {
    setUser({ uid: 'guest', name: 'Guest', email: 'guest@upf.app', avatar: '', memberSince: new Date().toISOString(), scannedProducts: 0, favoriteProducts: 0, favorites: [], healthScore: 0, healthGoal: '', appRating: 0, appReview: '' });
    navigation.replace('Home');
  };

  const canSubmit = isSignup ? !!(name && email && password && confirmPassword) : !!(email && password);
  const passwordMatch = confirmPassword !== '' && password === confirmPassword;
  const passwordMismatch = confirmPassword !== '' && password !== confirmPassword;

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View style={[s.blobLarge, { transform: [{ translateY: blob1Float }] }]} pointerEvents="none" />
        <Animated.View style={[s.blobSmall, { transform: [{ translateY: blob2Float }] }]} pointerEvents="none" />
        <View style={s.circleA} pointerEvents="none" />
        <View style={s.circleB} pointerEvents="none" />

        {/* Logo */}
        <Animated.View style={[s.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: logoScale }, { rotate: logoRotateInterp }] }]}>
          <View style={s.logoWrap}><Text style={s.logoEmoji}>🥗</Text></View>
          <Text style={s.appName}>UPF</Text>
          <Text style={s.tagline}>รู้จักอาหารแปรรูปของคุณ</Text>
        </Animated.View>

        {/* Card */}
        <Animated.View style={[s.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={s.cardTopLine} />
          <Text style={s.welcome}>{isSignup ? 'สร้างบัญชีใหม่ 🌿' : 'ยินดีต้อนรับ 👋'}</Text>
          <Text style={s.sub}>{isSignup ? 'กรอกข้อมูลเพื่อเริ่มต้นใช้งาน' : 'เข้าสู่ระบบเพื่อตรวจสอบฉลากอาหาร'}</Text>

          {isSignup && (
            <View style={s.inputGroup}>
              <Text style={s.label}>ชื่อ</Text>
              <View style={[s.inputWrap, nameFocused && s.inputFocused]}>
                <Text style={s.inputIcon}>👤</Text>
                <TextInput style={s.input} placeholder="กรอกชื่อของคุณ" placeholderTextColor={MUTED}
                  value={name} onChangeText={setName}
                  onFocus={() => setNameFocused(true)} onBlur={() => setNameFocused(false)} />
              </View>
            </View>
          )}

          <View style={s.inputGroup}>
            <Text style={s.label}>อีเมล</Text>
            <View style={[s.inputWrap, emailFocused && s.inputFocused]}>
              <Text style={s.inputIcon}>✉️</Text>
              <TextInput style={s.input} placeholder="กรอกอีเมลของคุณ" placeholderTextColor={MUTED}
                keyboardType="email-address" autoCapitalize="none"
                value={email} onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)} />
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>รหัสผ่าน</Text>
            <View style={[s.inputWrap, passFocused && s.inputFocused]}>
              <Text style={s.inputIcon}>🔒</Text>
              <TextInput style={s.input} placeholder="อย่างน้อย 6 ตัวอักษร" placeholderTextColor={MUTED}
                secureTextEntry={!showPassword} value={password} onChangeText={setPassword}
                onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {isSignup && (
            <View style={s.inputGroup}>
              <Text style={s.label}>ยืนยันรหัสผ่าน</Text>
              <View style={[s.inputWrap, confirmFocused && s.inputFocused, passwordMismatch && s.inputError]}>
                <Text style={s.inputIcon}>🔑</Text>
                <TextInput style={s.input} placeholder="พิมพ์รหัสผ่านอีกครั้ง" placeholderTextColor={MUTED}
                  secureTextEntry={!showConfirm} value={confirmPassword} onChangeText={setConfirmPassword}
                  onFocus={() => setConfirmFocused(true)} onBlur={() => setConfirmFocused(false)} />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={s.eyeBtn}>
                  <Text style={{ fontSize: 18 }}>{showConfirm ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {passwordMismatch && <Text style={s.matchError}>❌ รหัสผ่านไม่ตรงกัน</Text>}
              {passwordMatch    && <Text style={s.matchOk  }>✅ รหัสผ่านตรงกัน</Text>}
            </View>
          )}

          {errorMsg   ? <View style={s.errorBox}  ><Text style={s.errorText  }>⚠️ {errorMsg}</Text></View>   : null}
          {successMsg ? <View style={s.successBox}><Text style={s.successText}>✅ {successMsg}</Text></View> : null}

          {!isSignup && (
            <TouchableOpacity style={s.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={s.forgotText}>ลืมรหัสผ่าน?</Text>
            </TouchableOpacity>
          )}

          {!isSignup && (
            <TouchableOpacity style={s.guestBtn} onPress={handleGuest} activeOpacity={0.8}>
              <Text style={s.guestText}>👤 เข้าใช้งานแบบ Guest</Text>
            </TouchableOpacity>
          )}

          <Animated.View style={{ transform: canSubmit ? [{ scale: pulseAnim }] : [] }}>
            <TouchableOpacity
              style={[s.btn, (isLoading || !canSubmit) && s.btnDisabled]}
              onPress={isSignup ? handleRegister : handleLogin}
              disabled={isLoading || !canSubmit} activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color={BG} />
                : <Text style={s.btnText}>{isSignup ? '✨ สมัครสมาชิก' : ' เข้าสู่ระบบ'}</Text>
              }
            </TouchableOpacity>
          </Animated.View>

          <View style={s.divider}><View style={s.divLine} /><Text style={s.divText}>หรือ</Text><View style={s.divLine} /></View>

          <TouchableOpacity style={s.googleBtn} onPress={handleGoogleSignIn} activeOpacity={0.85}>
            <Image
  source={{ uri: 'https://www.transparentpng.com/thumb/google-logo/google-logo-png-icon-free-download-SUF63j.png' }}
  style={{ width: 18, height: 18 }}
/>
            <Text style={s.googleText}>เข้าสู่ระบบด้วย Google</Text>
          </TouchableOpacity>
        </Animated.View>

        

        <Animated.View style={[s.signupRow, { opacity: fadeAnim }]}>
          {isSignup ? (
            <><Text style={s.signupText}>มีบัญชีแล้ว? </Text><TouchableOpacity onPress={() => { setIsSignup(false); setErrorMsg(''); setConfirmPassword(''); }}><Text style={s.signupLink}>เข้าสู่ระบบ</Text></TouchableOpacity></>
          ) : (
            <><Text style={s.signupText}>ยังไม่มีบัญชี? </Text><TouchableOpacity onPress={() => { setIsSignup(true); setErrorMsg(''); }}><Text style={s.signupLink}>สมัครสมาชิก</Text></TouchableOpacity></>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll:    { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  blobLarge: { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: GREEN, opacity: 0.07, top: -80, right: -80 },
  blobSmall: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: GREEN, opacity: 0.05, top: 120, right: 30 },
  circleA:   { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: GREEN, opacity: 0.04, bottom: 200, left: -40 },
  circleB:   { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: GREEN, opacity: 0.08, bottom: 80, right: 60 },
  header:    { alignItems: 'center', marginTop: 60, marginBottom: 30, zIndex: 1 },
  logoWrap:  { width: 76, height: 76, borderRadius: 22, backgroundColor: GREEN_DIM, justifyContent: 'center', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: BORDER, shadowColor: GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  logoEmoji: { fontSize: 34 },
  appName:   { fontSize: 38, fontWeight: '800', color: GREEN, letterSpacing: 4, marginBottom: 6 },
  tagline:   { fontSize: 13, color: MUTED },
  card:      { backgroundColor: SURFACE, borderRadius: 24, padding: 24, zIndex: 1, borderWidth: 1, borderColor: BORDER, marginBottom: 16, overflow: 'hidden' },
  cardTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: GREEN, opacity: 0.7 },
  welcome:   { fontSize: 20, fontWeight: '700', color: TEXT, marginBottom: 6, marginTop: 8 },
  sub:       { fontSize: 13, color: MUTED, lineHeight: 20, marginBottom: 22 },
  inputGroup:{ marginBottom: 16 },
  label:     { fontSize: 12, fontWeight: '600', color: MUTED, marginBottom: 8, letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', height: 50, borderWidth: 1, borderColor: BORDER, borderRadius: 12, backgroundColor: SURFACE2, paddingHorizontal: 12 },
  inputFocused: { borderColor: GREEN, shadowColor: GREEN, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  inputError:   { borderColor: '#ff6b6b' },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input:     { flex: 1, fontSize: 14, color: TEXT },
  eyeBtn:    { padding: 4 },
  matchError:{ fontSize: 11, color: '#ff6b6b', marginTop: 6 },
  matchOk:   { fontSize: 11, color: GREEN, marginTop: 6 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 12 },
  forgotText:{ fontSize: 12, fontWeight: '700', color: GREEN },
  errorBox:  { backgroundColor: RED_DIM, borderRadius: 10, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: '#ff6b6b' },
  errorText: { fontSize: 13, color: '#ff6b6b', fontWeight: '600' },
  successBox:{ backgroundColor: GREEN_DIM, borderRadius: 10, padding: 12, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: GREEN },
  successText:{ fontSize: 13, color: GREEN, fontWeight: '600' },
  guestBtn:  { height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: BORDER, backgroundColor: 'transparent' },
  guestText: { color: MUTED, fontSize: 14, fontWeight: '600' },
  btn:       { height: 52, backgroundColor: GREEN, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 18, shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8 },
  btnDisabled:{ backgroundColor: '#1a3d25', shadowOpacity: 0, elevation: 0 },
  btnText:   { color: BG, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  divider:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  divLine:   { flex: 1, height: 1, backgroundColor: BORDER },
  divText:   { marginHorizontal: 12, fontSize: 12, color: MUTED },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderWidth: 1, borderColor: BORDER, borderRadius: 12, backgroundColor: SURFACE2, gap: 10 },
  googleText:{ fontSize: 14, fontWeight: '600', color: TEXT },
  infoBox:   { backgroundColor: GREEN_DIM, borderLeftWidth: 3, borderLeftColor: GREEN, borderRadius: 10, padding: 12, paddingHorizontal: 16, marginBottom: 20, zIndex: 1, borderWidth: 1, borderColor: BORDER },
  infoText:  { fontSize: 12, color: GREEN, fontWeight: '600' },
  signupRow: { flexDirection: 'row', justifyContent: 'center', zIndex: 1 },
  signupText:{ fontSize: 14, color: MUTED },
  signupLink:{ fontSize: 14, color: GREEN, fontWeight: '800' },
});

export default LoginScreen;