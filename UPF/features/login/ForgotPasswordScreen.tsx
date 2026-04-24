// screens/ForgotPasswordScreen.tsx
// หน้านี้ทำ 2 อย่าง:
//   mode="request"  → กรอก email → ส่งลิงก์ reset
//   mode="reset"    → กรอก password ใหม่ (ถ้า deep-link มาจาก email)
//
// สำหรับ web app: Firebase จะส่ง link ไปที่ email
// เมื่อ user กดลิงก์ จะมา land ที่ /reset-password?oobCode=xxxx
// ถ้าใช้ Expo Router ให้รับ oobCode ผ่าน route param แล้วส่งเข้า mode="reset"

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  TextInput, ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import {
  sendPasswordResetEmail,
  confirmPasswordReset,
  getAuth,
} from 'firebase/auth';
import { auth } from '../../core/services/firebase';

const BG = '#0a0f0d', SURFACE = '#111a14', SURFACE2 = '#162019';
const GREEN = '#2ecc71', GREEN_DIM = 'rgba(46,204,113,0.12)';
const RED_DIM = 'rgba(255,107,107,0.12)', MUTED = '#7a9982', TEXT = '#e8f5ec';
const BORDER = 'rgba(46,204,113,0.2)';

// ─── Request Reset Screen ─────────────────────────────────────
export const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail]       = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendReset = async () => {
    setErrorMsg(''); setSuccessMsg('');
    if (!email.trim()) { setErrorMsg('กรุณากรอกอีเมล'); return; }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        // ถ้าต้องการ redirect URL หลังจาก reset เสร็จ
        url: 'https://upf001-b206e.web.app/reset-done',
      });
      setSuccessMsg(`✅ ส่งลิงก์ไปยัง ${email.trim()} แล้ว\nกรุณาเช็คกล่อง Inbox (หรือ Spam) ของคุณ`);
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
        setErrorMsg('ไม่พบอีเมลนี้ในระบบ');
      } else {
        setErrorMsg(err?.message ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>ลืมรหัสผ่าน</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.iconBox}>
          <Text style={{ fontSize: 48 }}>🔑</Text>
        </View>
        <Text style={s.title}>รีเซ็ตรหัสผ่าน</Text>
        <Text style={s.desc}>กรอกอีเมลที่ใช้สมัครสมาชิก ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้คุณ</Text>

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

        {errorMsg   ? <View style={s.errorBox}  ><Text style={s.errorText  }>⚠️ {errorMsg}</Text></View>   : null}
        {successMsg ? <View style={s.successBox}><Text style={s.successText}>{successMsg}</Text></View> : null}

        <TouchableOpacity
          style={[s.btn, (isLoading || !email.trim()) && s.btnDisabled]}
          onPress={handleSendReset}
          disabled={isLoading || !email.trim()} activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color={BG} />
            : <Text style={s.btnText}>📧 ส่งลิงก์รีเซ็ตรหัสผ่าน</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={s.backLink} onPress={() => navigation.goBack()}>
          <Text style={s.backLinkText}>← กลับไปหน้าเข้าสู่ระบบ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Reset Password Screen (รับ oobCode จาก deep-link) ───────
// ใช้เมื่อ user กดลิงก์จาก email แล้ว redirect มาที่แอพ
// route.params.oobCode = code จาก Firebase email link
export const ResetPasswordScreen = ({ navigation, route }: any) => {
  const oobCode = route?.params?.oobCode ?? '';
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [passFocused, setPassFocused]     = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [errorMsg, setErrorMsg]           = useState('');
  const [successMsg, setSuccessMsg]       = useState('');

  const passwordMatch    = confirmPassword !== '' && password === confirmPassword;
  const passwordMismatch = confirmPassword !== '' && password !== confirmPassword;

  const handleResetPassword = async () => {
    setErrorMsg(''); setSuccessMsg(''); setIsLoading(true);
    try {
      if (!password || !confirmPassword) throw new Error('กรุณากรอกรหัสผ่านใหม่');
      if (password.length < 6) throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      if (password !== confirmPassword) throw new Error('รหัสผ่านไม่ตรงกัน');
      if (!oobCode) throw new Error('ลิงก์รีเซ็ตไม่ถูกต้องหรือหมดอายุแล้ว');

      await confirmPasswordReset(auth, oobCode, password);
      setSuccessMsg('✅ เปลี่ยนรหัสผ่านสำเร็จ! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่');
      setTimeout(() => navigation.replace('Login'), 2500);
    } catch (err: any) {
      const code = err?.code ?? '';
      if (code === 'auth/expired-action-code') setErrorMsg('ลิงก์หมดอายุแล้ว กรุณาขอลิงก์ใหม่');
      else if (code === 'auth/invalid-action-code') setErrorMsg('ลิงก์ไม่ถูกต้อง กรุณาขอลิงก์ใหม่');
      else setErrorMsg(err?.message ?? 'เกิดข้อผิดพลาด');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>ตั้งรหัสผ่านใหม่</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.iconBox}>
          <Text style={{ fontSize: 48 }}>🔐</Text>
        </View>
        <Text style={s.title}>ตั้งรหัสผ่านใหม่</Text>
        <Text style={s.desc}>กรอกรหัสผ่านใหม่ของคุณ ต้องมีอย่างน้อย 6 ตัวอักษร</Text>

        <View style={s.inputGroup}>
          <Text style={s.label}>รหัสผ่านใหม่</Text>
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

        <View style={s.inputGroup}>
          <Text style={s.label}>ยืนยันรหัสผ่านใหม่</Text>
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

        {errorMsg   ? <View style={s.errorBox}  ><Text style={s.errorText  }>⚠️ {errorMsg}</Text></View>   : null}
        {successMsg ? <View style={s.successBox}><Text style={s.successText}>{successMsg}</Text></View> : null}

        <TouchableOpacity
          style={[s.btn, (isLoading || !password || !confirmPassword) && s.btnDisabled]}
          onPress={handleResetPassword}
          disabled={isLoading || !password || !confirmPassword} activeOpacity={0.85}
        >
          {isLoading
            ? <ActivityIndicator color={BG} />
            : <Text style={s.btnText}>🔐 เปลี่ยนรหัสผ่าน</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: SURFACE, borderBottomWidth: 1, borderBottomColor: BORDER },
  backBtn:   { width: 40, height: 40, borderRadius: 20, backgroundColor: GREEN_DIM, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: BORDER },
  backIcon:  { fontSize: 28, color: GREEN, fontWeight: '300' },
  headerTitle:{ fontSize: 16, fontWeight: '700', color: TEXT },
  scroll:    { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40, paddingTop: 32 },
  iconBox:   { alignItems: 'center', marginBottom: 16 },
  title:     { fontSize: 24, fontWeight: '800', color: TEXT, textAlign: 'center', marginBottom: 10 },
  desc:      { fontSize: 14, color: MUTED, lineHeight: 22, textAlign: 'center', marginBottom: 32 },
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
  errorBox:  { backgroundColor: RED_DIM, borderRadius: 10, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#ff6b6b' },
  errorText: { fontSize: 13, color: '#ff6b6b', fontWeight: '600' },
  successBox:{ backgroundColor: GREEN_DIM, borderRadius: 10, padding: 14, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: GREEN },
  successText:{ fontSize: 13, color: GREEN, fontWeight: '600', lineHeight: 20 },
  btn:       { height: 52, backgroundColor: GREEN, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 14, elevation: 8 },
  btnDisabled:{ backgroundColor: '#1a3d25', shadowOpacity: 0, elevation: 0 },
  btnText:   { color: BG, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  backLink:  { alignItems: 'center', paddingVertical: 12 },
  backLinkText:{ fontSize: 14, color: MUTED, fontWeight: '600' },
});

export default ForgotPasswordScreen;
